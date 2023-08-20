const orderModel = require("../../model/orderSchema")
const orderItemModel = require('../../model/orderItemSchema');
const userModel = require("../../model/userSchema");
const walletModel = require("../../model/walletSchema");


const loadorder = async (req, res) => {
    try{
        const orders = await orderModel.find();
        const users = await orderModel.find().populate("user");   
        res.render('Admin/orders', { orders, users });
    }catch (error) {
        res.render('User/404page')
    }
}


const loadOrderDetails = async (req, res) => {
    try{
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
    }catch (error) {
    res.render('User/404page')
    }
}



const statusChange = async (req, res) => {
  try{
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
        let orderId = await orderModel.findOne({_id: id})
        let wallet = await walletModel.findOne({user: orderId.user})
        if (!wallet) {
            wallet = new walletModel({
                user: orderId.user,
                balance: orderId.price,
                history: ({
                  type: "add",
                  amount: orderId.price,
                  newBalance: orderId.price
                })
            })
            await wallet.save();
          } else {
            let balance = wallet.balance;
            const newBalance = balance + orderId.price;
            const history = {
                type: "add",
                amount: orderId.price,
                newBalance: newBalance,
            }
            wallet.balance = newBalance;
            wallet.history.push(history);
            wallet.save();
          }
        }
        
        const order = await orderModel.findOne({ _id: id });
        
        res.json({ data: order })
      }catch (error) {
        res.render('User/404page')
    }
}


module.exports = {
    loadorder,
    loadOrderDetails,
    statusChange,
}