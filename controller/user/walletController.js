const userModel = require('../../model/userSchema')
const productModel = require('../../model/productSchema')
const categoryModel = require('../../model/categorySchema')
const walletModel = require('../../model/walletSchema')
const cartModel = require('../../model/cartSchema')



const loadWallet = async (req, res) => {
  try {

    const userId = req.session.User_id;

    const user = await userModel.findById(userId);
    const wallet = await walletModel.findOne({ user: userId });
    const cart = await cartModel.findOne({ userId: userId });

    res.render("User/wallet", { id: userId, user, wallet, cart });

  } catch (error) {
    console.log(error);
  }
}


module.exports = {
  loadWallet,
}