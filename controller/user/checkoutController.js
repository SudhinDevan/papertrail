const addressModel = require("../../model/addressSchema")
const userModel = require("../../model/userSchema");
const cartModel = require("../../model/cartSchema")
const orderModel = require("../../model/orderSchema");
const orderItemModel = require("../../model/orderItemSchema")
const productModel = require("../../model/productSchema")
const couponModel = require("../../model/couponSchema")

const Razorpay = require('razorpay');

const loadCheckoutAddress = async (req, res) => {
    const id = req.session.User_id;

    const userData = await userModel.findOne({ _id: id });
    const address = await addressModel.find({ _id: id });
    const contactAddress = await addressModel.findOne({ user: id, type: "contact" });
    const mainAddress = await addressModel.findOne({ user: id, type: "main" });
    const secondaryAddress = await addressModel.find({ user: id, type: "secondary" });
    const cart = await cartModel.findOne({ userId: id })

    res.render('User/checkoutAddress', { id, user: userData, contact: contactAddress, main: mainAddress, secondary: secondaryAddress, address, cart });
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
        console.log(error);
    }

}


const selectAddress = async (req, res) => {

    const { addressId, userId } = req.query;
    const user = await userModel.findOne({ _id: userId })

    if (userId) {
        const address = await addressModel.findOne({ _id: addressId })
        const cart = await cartModel.findOne({ userId });
        let productList = [];
        const product = await cartModel
            .findOne({ userId: userId })
            .populate("items.productId");

        product.items.forEach((item) => {
            productList.push(item.productId)
        })

        res.render('User/checkout', { cart, productList, user, address, coupon: null });

    } else {

        res.redirect('/');

    }


}



const checkout = async (req, res) => {
    const userId = req.session.User_id;

    const {
        payment,
        address,
        couponId,
        payment_id,
    } = req.body;
    const cart = await cartModel.findOne({ userId: userId });

    const orderItemIdList = Promise.all(cart.items.map(async (item) => {
        const newItem = new orderItemModel({
            product: item.productId,
            quantity: item.quantity,
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
    })
    if (couponId) {

        const coupon = await couponModel.findOne({ _id: couponId });
        coupon.owners.push({
            user: userId,
            quantity: 1,
        });

        // Save the coupon with the updated owners array and userId field
        await coupon.save();


        if (payment_id) {

            newOrder = orderModel({
                user: userId,
                address: address,
                items: items,
                price: cart.cartPrice - coupon.discount,
                payment_status: true,
                payment_method: payment,
                coupon: couponId,
                razorpay_order_id: payment_id,

            });

        } else {

            newOrder = orderModel({
                user: userId,
                address: address,
                items: items,
                price: cart.cartPrice - coupon.discount,
                payment_status: false,
                payment_method: payment,
                coupon: couponId,
            });

        }
        coupon.owners.push({
            user: userId,
            quantity: 1,
        });

    } else {
        if (payment_id) {

            newOrder = orderModel({
                user: userId,
                address: address,
                items: items,
                price: cart.cartPrice,
                payment_status: true,
                payment_method: payment,
                razorpay_order_id: payment_id,
            });

        }

    }
    await newOrder.save()

    cart.items.forEach(async (item) => {
        const product = await productModel.findOne({ _id: item.productId });
        await productModel.updateMany({ _id: item.productId },
            { $set: { quantity: product.quantity - item.quantity } })
    })

    cart.items.forEach(async (item) => {
        const product = await productModel.findOne({ _id: item.productId });
        await cartModel.updateMany(
            {
                "items.productId": item.productId,
                "items.quantity": { $gt: product.quantity },
            },
            { $set: { "items.$.quantity": product.quantity } }
        );

        await cartModel.updateMany({
            $or: [
                { "items.productId": item.productId }
            ]
        })

    })
    await cartModel.deleteOne({ userId: userId });
    res.json({ response: true, orderId: newOrder._id });
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
        console.log(error);
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