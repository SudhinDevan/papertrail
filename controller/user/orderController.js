const orderItemModel = require("../../model/orderItemSchema");
const orderModel = require("../../model/orderSchema");
const productModel = require("../../model/productSchema");
const userModel = require("../../model/userSchema");
const addressModel = require("../../model/addressSchema")
const couponModel = require("../../model/couponSchema")
const cartModel = require('../../model/cartSchema')



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
    const itemsPerPage = 3;
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

        const cartAddress = await orderModel.findOne({ _id: orderId }).populate("address");
        res.render('user/orderDetails', { id: userId, cart, user, order, address: cartAddress.address });

    } catch (error) {
        console.log(error.message);
    }
}




const removeOrder = async (req, res) => {
    const { orderId, ordersItemsId } = req.body;

    // Update the order document to remove the specified order items
    await orderModel.findOneAndUpdate(
        { _id: orderId },
        { $pull: { items: { $in: ordersItemsId } } }
    );

    // Loop through each order item ID and perform the necessary updates
    for (const itemId of ordersItemsId) {
        const cartProduct = await orderItemModel.findOne({ _id: itemId });

        if (cartProduct) {
            await productModel.findOneAndUpdate(
                { _id: cartProduct.product },
                { $inc: { quantity: cartProduct.quantity } }
            );

            await orderItemModel.deleteOne({ _id: itemId });
        } else {
            console.log(`Cart Product not found for item ID: ${itemId}`);
        }
        await orderModel.deleteOne({ _id: orderId })

    }

    res.json({ response: true });
};


const loadOrderSuccessPage = async (req, res) => {
    // const userId = req.Session.User_id
    const { orderId } = req.query;

    const order = await orderModel.findOne({ _id: orderId });
    const user = await userModel.findOne({ _id: order.user });
    const address = await addressModel.findOne({ _id: order.address });
    const cart = await cartModel.findOne({ userId: user._Id })


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
    console.log(coupon);

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
    removeOrder,
    loadOrderSuccessPage,
    returnOrder,
}