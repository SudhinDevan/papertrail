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
    const cart = await cartModel.findOne({ userId: userId })
    const orders = await orderModel.find({ user: userId });

    // let products = [];
    // if(orders){

    //     for(const order of orders){
    //         const product = await orderItemModel.findOne({user}).populate("product")
    //         products.push(product)
    //     }
    // }

    const products = await orderModel.find({ user: userId })
        .populate({
            path: 'items',
            model: 'orderItem',
            populate: {
                path: 'product',
                model: 'product'
            }
        })


    res.render('user/orders', { id: userId, products, orders, user: userData, cart });
}



const loadOrderDetails = async (req, res) => {
    try {

        const userId = req.session.User_id;
        const { orderId } = req.query;

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

        res.render('user/orderDetails', { id: userId, user, order, address: cartAddress.address });

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

    const { orderId } = req.query;

    const order = await orderModel.findOne({ _id: orderId });
    const user = await userModel.findOne({ _id: order.user });
    const address = await addressModel.findOne({ _id: order.address });

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

    res.render('User/orderSuccess', { user, order, address, product, coupon });
}



module.exports = {
    loadorder,
    loadOrderDetails,
    removeOrder,
    loadOrderSuccessPage,
}