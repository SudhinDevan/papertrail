const addressModel = require("../../model/addressSchema")
const userModel = require("../../model/userSchema");
const cartModel = require("../../model/cartSchema")
const orderModel = require("../../model/orderSchema");
const orderItemModel = require("../../model/orderItemSchema")
const productModel = require("../../model/productSchema")
const couponModel = require("../../model/couponSchema")
const walletModel = require("../../model/walletSchema");

const Razorpay = require('razorpay');

const loadCheckoutAddress = async (req, res) => {
    try{
    const id = req.session.User_id;
    const userData = await userModel.findOne({ _id: id });
    const address = await addressModel.find({ _id: id });
    const contactAddress = await addressModel.findOne({ user: id, type: "contact" });
    const mainAddress = await addressModel.findOne({ user: id, type: "main" });
    const secondaryAddress = await addressModel.find({ user: id, type: "secondary" });
    const cart = await cartModel.findOne({ userId: id })

    res.render('User/checkoutAddress', { id, user: userData, contact: contactAddress, main: mainAddress, secondary: secondaryAddress, address, cart });
    
    }catch (error) {
        res.render('User/404page')
    }
}



const checkoutAddAddress = async (req, res) => {
    try {
        const user_id = req.session.User_id;

        const {
            building,
            street,
            city,
            state,
            type
        } = req.body;

        const pincode = Number(req.body.pincode);
        const phonenumber = Number(req.body.phone);

        const newAddress = new addressModel({
            buildingName: building,
            street,
            city,
            state,
            pincode,
            phonenumber,
            user: user_id,
            type,
        })

        await newAddress.save();
        res.redirect('/checkout/address');


    } catch (error) {
      res.render('User/404page')
    }
}


const selectAddress = async (req, res) => {
  try{
    const { addressId, userId } = req.query;
    const user = await userModel.findOne({ _id: userId })

    if (userId) {
        const address = await addressModel.findOne({ _id: addressId })
        const cart = await cartModel.findOne({ userId });
        const wallet = await walletModel.findOne({ user: userId })
        const coupons = await couponModel.find()
        let productList = [];
        const product = await cartModel
            .findOne({ userId: userId })
            .populate("items.productId");

        product.items.forEach((item) => {
            productList.push(item.productId)
        })

        res.render('User/checkout', { cart, productList, user, address, coupons, wallet });

    } else {
        res.redirect('/');
    }
  }catch (error) {
    res.render('User/404page')
  }
}



const checkout = async (req, res) => {
    try {
        const userId = req.session.User_id;
        const {
            payment,
            address,
            couponId,
            payment_id,
        } = req.body;

        const cart = await cartModel.findOne({ userId: userId });

        const orderItemIdList = Promise.all(cart.items.map(async (item) => {
            const product = await productModel.findOne({ _id: item.productId });
            const newItem = new orderItemModel({
                product: item.productId,
                quantity: item.quantity,
                productPrice: product.price,

            })

            const newOrderItem = await newItem.save();
            return newOrderItem._id;
        }))

        const items = await orderItemIdList;

        let newOrder = orderModel({
            user: userId,
            address: address,
            items: items,
            price: cart.cartPrice,
            payment_status: false,
            payment_method: payment,
        });

        if (payment == "wallet") {
            const wallet = await walletModel.findOne({ user: userId });

            if (!wallet) {
                res.json({ wallet: "false" });
                return;
            }

            let cartTotalPrice = cart.cartPrice;

            if (couponId) {
                const coupon = await couponModel.findOne({ _id: couponId });
                let couponDiscount = (cartPrice * coupon.discount) / 100;
                if (couponDiscount > coupon.maxDiscount) {
                    couponDiscount = coupon.maxDiscount;
                }
                coupon.discount = couponDiscount;
                order.couponDiscount = couponDiscount;
                if (wallet.balance < (cartTotalPrice - coupon.discount)) {
                    res.json({ wallet: "noprice" })
                    return;
                }

                cartTotalPrice -= coupon.discount

            } else {

                if (wallet.balance < cartTotalPrice) {
                    res.json({ wallet: "noprice" })
                    return;
                }
            }

            let balance = wallet.balance;
            const newBalance = balance - cartTotalPrice;
            const history = {
                type: "subtract",
                amount: cartTotalPrice,
                newBalance: newBalance
            }

            wallet.balance = newBalance;
            wallet.history.push(history);
            await wallet.save();
            newOrder.payment_status = true;
           
        }


        if (couponId) {

            const coupon = await couponModel.findOne({ _id: couponId });
            coupon.owners.push({
                user: userId,
                quantity: 1,
            });

            // Save the coupon with the updated owners array and userId field
            await coupon.save();

            if (payment_id) {
                let couponDiscount = (cart.cartPrice * coupon.discount) / 100;
                if (couponDiscount > coupon.maxDiscount) {
                    couponDiscount = coupon.maxDiscount;
                }
                coupon.discount = couponDiscount;
                newOrder.price = cart.cartPrice - coupon.discount;
                newOrder.payment_status = true;
                newOrder.razorpay_order_id = payment_id;
                newOrder.coupon = coupon._id;
                newOrder.couponDiscount = couponDiscount


            } else {
                let couponDiscount = (cart.cartPrice * coupon.discount) / 100;
                if (couponDiscount > coupon.maxDiscount) {
                    couponDiscount = coupon.maxDiscount;
                }
                coupon.discount = couponDiscount;
                newOrder.price = cart.cartPrice - coupon.discount;
                newOrder.coupon = coupon._id;
                newOrder.couponDiscount = couponDiscount;
            }

        } else {

            if (payment_id) {

                newOrder.payment_status = true;
                newOrder.razorpay_order_id = payment_id;

            }

        }


        const saveOrder = await newOrder.save()


        cart.items.forEach(async (item) => {
            const product = await productModel.findOne({ _id: item.productId });
            await productModel.updateMany({ _id: item.productId },
                { $set: { quantity: product.quantity - item.quantity } })
        })


        await cartModel.deleteOne({ userId: userId });

        res.json({ response: true, orderId: saveOrder._id });

    } catch (error) {
      res.render('User/404page')
    }

}


const razorpayInstance = new Razorpay({
    key_id: process.env.RAZOR_KEY_ID,
    key_secret: process.env.RAZOR_KEY_SECRET,
});


const razorPayPaymet = async (req, res) => {
    try {

        const { coupon } = req.body;

        const userId = req.session.User_id;

        const user = await userModel.findOne({ _id: userId });
        const cart = await cartModel.findOne({ userId: userId });

        let amount = cart.cartPrice * 100;

        if (coupon) {
            const coupon = await couponModel.findOne({ _id: req.body.coupon });
            let couponDiscount = (cart.cartPrice * coupon.discount) / 100;
            if (couponDiscount > coupon.maxDiscount) {
                couponDiscount = coupon.maxDiscount;
            }
            coupon.discount = couponDiscount;
            amount = (cart.cartPrice - coupon.discount) * 100;
        }


        const options = {
            amount: amount,
            currency: "INR",
            receipt: "papertrailsudhin@gmail.com",
        }

        razorpayInstance.orders.create(options,
            (err, order) => {
                if (!err) {
                    res.status(200).send({
                        success: true,
                        msg: 'Order Created',
                        order_id: order.id,
                        amount: amount,
                        key_id: process.env.RAZOR_KEY_ID,
                        name: user.username,
                        email: user.email,
                    })
                } else {
                    res.status(400).send({ success: false, msg: "something went wrong!" });
                }
            })

    } catch (error) {
      res.render('User/404page')
        res.status(500).json({ error: "something went wrong" });
    }
}


module.exports = {
    loadCheckoutAddress,
    checkoutAddAddress,
    selectAddress,
    checkout,
    razorPayPaymet,
}