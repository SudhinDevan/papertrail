const orderItemModel = require("../../model/orderItemSchema");
const orderModel = require("../../model/orderSchema");
const productModel = require("../../model/productSchema");
const userModel = require("../../model/userSchema");
const addressModel = require("../../model/addressSchema")
const couponModel = require("../../model/couponSchema")
const cartModel = require('../../model/cartSchema')
const walletModel = require('../../model/walletSchema');


const loadorder = async (req, res) => {
    const userId = req.session.User_id;
    const userData = await userModel.findOne({ _id: userId });
    const cart = await cartModel.findOne({ userId: userId });
    let orders = await orderModel.find({ user: userId });

    // Sort orders based on the order_date as (newest orders first)
    orders = orders.sort((a, b) => b.order_date - a.order_date);

    const products = await orderModel
        .find({ user: userId })
        .populate({
            path: 'items',
            model: 'orderItem',
            populate: {
                path: 'product',
                model: 'product'
            }
        });

    // Pagination variables
    const page = parseInt(req.query.page) || 1;
    const itemsPerPage = 5;
    const totalOrders = orders.length;
    const totalPages = Math.ceil(totalOrders / itemsPerPage);
    const startIndex = (page - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;

    const ordersToDisplay = orders.slice(startIndex, endIndex);

    res.render('user/orders', {
        id: userId,
        products,
        orders: ordersToDisplay,
        user: userData,
        cart,
        currentPage: page,
        totalPages,
        itemsPerPage
    });
};




const loadOrderDetails = async (req, res) => {
    try {

        const userId = req.session.User_id;
        const { orderId } = req.query;

        const cart = await cartModel.findOne({ userId: userId })


        const user = await userModel.findOne({ _id: userId });

        const order = await orderModel.findOne({ _id: orderId })
            .populate({
                path: 'items',
                model: 'orderItem',
                populate: {
                    path: 'product',
                    model: 'product'
                }
            })


        const coupon = await couponModel.findOne({ _id: order.coupon })

        const cartAddress = await orderModel.findOne({ _id: orderId }).populate("address");
        res.render('user/orderDetails', { id: userId, cart, coupon, user, order, address: cartAddress.address });

    } catch (error) {
        console.log(error.message);
    }
}


const cancelOrder = async (req, res) => {
    try {

        const orderId = req.query.orderId;
        const order = await orderModel.findOne({ _id: orderId }).populate('items')
        if (order.payment_method === "online" || order.payment_method === "wallet") {
            let wallet = await walletModel.findOne({ user: order.user })
            if (!wallet) {
                wallet = new walletModel({
                    user: order.user,
                    balance: order.price,
                    history: ({
                        type: "add",
                        amount: order.price,
                        newBalance: order.price
                    })
                })
                await wallet.save();
            } else {
                let balance = wallet.balance;
                const newBalance = balance + order.price;
                const history = {
                    type: "add",
                    amount: order.price,
                    newBalance: newBalance,
                }
                wallet.balance = newBalance;
                wallet.history.push(history);
                wallet.save();
            }
        }
        await orderModel.findByIdAndUpdate(orderId, { order_status: "cancelled" })

        for (const item of order.items) {
            await productModel.updateOne({ _id: item.product },
                {
                    $inc: { quantity: item.quantity }
                })
        }
        res.send({ response: true });
    } catch (error) {
        console.log(error);
    }
}


const loadOrderSuccessPage = async (req, res) => {
    const userId = req.session.User_id;
    const { orderId } = req.query;

    const order = await orderModel.findOne({ _id: orderId });
    const user = await userModel.findOne({ _id: order.user });
    const address = await addressModel.findOne({ _id: order.address });
    const cart = await cartModel.findOne({ userId: userId })


    const product = await orderModel.findOne({ _id: orderId })
        .populate({
            path: 'items',
            model: 'orderItem',
            populate: {
                path: 'product',
                model: 'product'
            }
        })
    const coupon = await couponModel.findOne({ _id: order.coupon })

    res.render('User/orderSuccess', { user, order, address, product, coupon, cart });
}

const returnOrder = async (req, res) => {
    try {
        const orderId = req.query.orderId
        const order = await orderModel.updateOne({ _id: orderId }, { order_status: "returnInitiated" })
        res.json({ response: true });

    } catch (error) {
        console.log(error)
    }

}


module.exports = {
    loadorder,
    loadOrderDetails,
    cancelOrder,
    loadOrderSuccessPage,
    returnOrder,
}