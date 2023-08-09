const orderModel = require("../../model/orderSchema")
const orderItemModel = require('../../model/orderItemSchema');
const userModel = require("../../model/userSchema");


const loadorder = async (req, res) => {

    const orders = await orderModel.find();

    const users = await orderModel.find().populate("user");

    res.render('Admin/orders', { orders, users });
}


const loadOrderDetails = async (req, res) => {

    const {
        userId,
        orderId,
    } = req.query;
    const user = await userModel.findOne({ _id: userId });
    const order = await orderModel.findOne({ _id: orderId });
    const cartAddress = await orderModel.findOne({ _id: orderId }).populate("address");

    let products = [];
    for (const item of order.items) {
        const product = await orderItemModel.findOne({ _id: item }).populate("product")
        products.push(product)
    }

    res.render('Admin/orderDetails', { user, order, products, address: cartAddress.address });
}



const statusChange = async (req, res) => {
    const {
        id,
        status
    } = req.body;

    if (status === "shipped") {
        await orderModel.findByIdAndUpdate(id, { order_status: status, payment_status: true });

    } else if (status === "delivered") {
        await orderModel.findByIdAndUpdate(id, { order_status: status, payment_status: true });

    } else if (status === "cancelled") {
        await orderModel.findByIdAndUpdate(id, { order_status: status, payment_status: true });

    } else if (status === "returnComplete") {
        await orderModel.findByIdAndUpdate(id, { order_status: status, payment_status: true });

    }

    const order = await orderModel.findOne({ _id: id });

    res.json({ data: order })
}


module.exports = {
    loadorder,
    loadOrderDetails,
    statusChange,
}