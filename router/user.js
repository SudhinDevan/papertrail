const userAuthController = require("../controller/user/authcontroller");
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
const userAuth = require('../middleware/user');
const adminAuth = require("../middleware/admin")

const { profile } = require("console");


routers.get('/signup', userAuthController.signup);
routers.post('/signup', userAuthController.createUser);
routers.get('/successemail/:username', userAuthController.successEmail);
routers.get('/login', userAuth.isLogin, userAuthController.loadHome);
routers.post('/login', userAuthController.verifyLogin);
routers.get('/logout', userAuth.isLogout);

routers.get('/', userAuthController.loadHome);

routers.get('/forgotPassword',adminAuth.isLogout,userAuthController.loadForgotPassword)
routers.post('/forgotPassword',userAuthController.forgotPassword)
routers.post('/forgotPassword/otp',userAuthController.verifyForgotPasswordOtp);
routers.post('/forgotPassword/newForgotPassword',userAuthController.newPassword);

routers.get('/shop', productController.loadShop);
routers.get('/productdetails', productController.productDetails);
routers.get('/category', productController.productInCategory);

routers.get('/user/profile', userAuth.isLogin, profileController.loadUserProfile);

routers.get('/user/profile/edit', userAuth.isLogin, profileController.loadEditUser);
routers.post('/user/profile/edit', profileController.editUser);

routers.get('/user/profile/oldPassword', userAuth.isLogin, profileController.oldPassword);
routers.post('/user/profile/oldPassword', profileController.verifyOldPassword);
routers.post('/user/profile/newPassword', profileController.profileNewPassword);

routers.get('/user/profile/address', userAuth.isLogin, addressController.loadAddress);

routers.get('/address/add', userAuth.isLogin, addressController.loadAddAddress);
routers.post('/address/add', addressController.addAddress);


routers.get('/address/edit', userAuth.isLogin, addressController.loadEditAddress);
routers.post('/address/edit', addressController.editAddress);

routers.delete('/address/delete', addressController.deleteAddress);

routers.get('/cart', userAuth.isLogin, cartController.loadCart);
routers.get('/addToCart', cartController.addToCart);
routers.get('/incrementQuantity', cartController.incrementQuantity);
routers.get('/decrementQuantity', cartController.decrementQuantity);
routers.delete('/removeItem', cartController.removeItem);

routers.get('/checkout/address', userAuth.isLogin, checkoutController.loadCheckoutAddress);
routers.post('/checkout/addAddress', checkoutController.checkoutAddAddress);


routers.get('/checkout', userAuth.isLogin, checkoutController.selectAddress);
routers.post('/checkout', checkoutController.checkout);

routers.post('/razorpay', checkoutController.razorPayPaymet);

routers.get('/order', userAuth.isLogin, orderController.loadorder);
routers.get('/order/details', userAuth.isLogin, orderController.loadOrderDetails);
routers.post('/order/cancel', orderController.cancelOrder);
routers.get('/order/success', userAuth.isLogin, orderController.loadOrderSuccessPage);
routers.get('/returnOrder', userAuth.isLogin, orderController.returnOrder);
routers.get('/order/download', userAuth.isLogin, orderController.downloadInvoive);

routers.get('/addToWishlist', wishlistController.addToWishlist);
routers.get('/wishlist', userAuth.isLogin, wishlistController.loadWishlist);
routers.get('/removeFromWishlist', userAuth.isLogin, wishlistController.removeFromWishlist);

routers.get('/user/profile/wallet', userAuth.isLogin, walletController.loadWallet);


module.exports = routers;