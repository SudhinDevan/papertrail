const user = require("../controller/user/authcontroller");
const productController = require("../controller/user/productController");
const profileController = require('../controller/user/profileController');
const addressController = require('../controller/user/addressController')
const cartController = require('../controller/user/cartController')
const checkoutController = require('../controller/user/checkoutController')
const orderController = require('../controller/user/orderController')
const wishlistController = require('../controller/user/wishlistController')
const walletController = require('../controller/user/walletController')


const express = require('express');
const routers = express.Router();
const userSess = require('../middleware/user');

const { profile } = require("console");


routers.get('/signup', user.signup);
routers.post('/signup', user.createUser);
routers.get('/successemail/:username', user.successEmail);
routers.get('/login', userSess.isLogin, user.loadHome);
routers.post('/login', user.verifyLogin);
routers.get('/logout', userSess.isLogout)

routers.get('/', user.loadHome);

routers.get('/shop', productController.loadShop);
routers.get('/productdetails', productController.productDetails);
routers.get('/category', productController.productInCategory)

routers.get('/user/profile', userSess.isLogin, profileController.loadUserProfile)

routers
  .get('/user/profile/edit', userSess.isLogin, profileController.loadEditUser)
  .post('/user/profile/edit', profileController.editUser);

routers
  .get('/user/profile/oldPassword', userSess.isLogin, profileController.oldPassword)
  .post('/user/profile/oldPassword', profileController.verifyOldPassword)
  .post('/user/profile/newPassword', profileController.profileNewPassword);

routers.get('/user/profile/address', userSess.isLogin, addressController.loadAddress)

routers
  .get('/address/add', userSess.isLogin, addressController.loadAddAddress)
  .post('/address/add', addressController.addAddress);

routers
  .get('/address/edit', userSess.isLogin, addressController.loadEditAddress)
  .post('/address/edit', addressController.editAddress);

routers.delete('/address/delete', addressController.deleteAddress);

routers.get('/cart', userSess.isLogin, cartController.loadCart)
routers.get('/addToCart', cartController.addToCart)
routers.get('/incrementQuantity', cartController.incrementQuantity)
routers.get('/decrementQuantity', cartController.decrementQuantity)
routers.delete('/removeItem', cartController.removeItem);

routers
  .get('/checkout/address', userSess.isLogin, checkoutController.loadCheckoutAddress)
  .post('/checkout/addAddress', checkoutController.checkoutAddAddress);

routers
  .get('/checkout', userSess.isLogin, checkoutController.selectAddress)
  .post('/checkout', checkoutController.checkout);

routers.post('/razorpay', checkoutController.razorPayPaymet);


routers.get('/order', userSess.isLogin, orderController.loadorder)
routers.get('/order/details', userSess.isLogin, orderController.loadOrderDetails)
routers.post('/order/cancel', orderController.cancelOrder);
routers.get('/order/success', userSess.isLogin, orderController.loadOrderSuccessPage)
routers.get('/returnOrder', userSess.isLogin, orderController.returnOrder)
routers.get('/order/download', userSess.isLogin, orderController.downloadInvoive)

routers.get('/addToWishlist', wishlistController.addToWishlist);
routers.get('/wishlist', userSess.isLogin, wishlistController.loadWishlist)
routers.get('/removeFromWishlist', userSess.isLogin, wishlistController.removeFromWishlist)

routers.get('/user/profile/wallet', userSess.isLogin, walletController.loadWallet)


module.exports = routers;