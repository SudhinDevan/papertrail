const express = require('express');
const routers = express.Router();

const adminAuth = require("../controller/admin/authcontroller");
const category = require("../controller/admin/categoryController");
const product = require("../controller/admin/productOperations");
const admin = require("../controller/admin/adminController");
const order = require("../controller/admin/orderController");
const coupon = require("../controller/admin/couponController");
const banner = require("../controller/admin/bannerController");
const dashBoard = require("../controller/admin/dashBoardController")

const adminSesh = require("../middleware/admin");



routers.get('/dashboard', adminSesh.isLogin, dashBoard.loadDashboard);

routers.get('/sale', adminSesh.isLogin, dashBoard.loadSalesReport);
routers.post('/sale/monthly', dashBoard.monthlySaleReport);
routers.post('/sale/daily', dashBoard.dailySalesReport);
routers.post('/sale/date', dashBoard.byDateSaleReport);

routers.get('/', adminSesh.isLogin, dashBoard.loadDashboard);
routers.post('/', adminAuth.verifyAdminLogin);
routers.get('/signOut', adminAuth.adminLogout);
routers.get('/userData', adminSesh.isLogin, admin.userTable);
routers.post('/userData', admin.updateAccess);
routers.get('/blockUser', adminAuth.blockUser);

routers.get('/category', adminSesh.isLogin, category.loadCategory);
routers.get('/addCategory', adminSesh.isLogin, category.loadAddCategory);
routers.post('/addCategory', category.addCategory);
routers.get('/category/edit', category.loadEditCategory);
routers.post('/category/edit', category.editCategory);

routers.get('/product', adminSesh.isLogin, product.loadProducts);
routers.get('/product/add', adminSesh.isLogin, product.loadAddProducts);
routers.post('/product/add', product.addProduct);
routers.get('/product/edit', product.loadEditProduct);
routers.post('/product/edit', product.editProduct);
routers.get('/product/image', adminSesh.isLogin, product.loadImages)
routers.delete('/product/image/delete', product.deleteProductImage)
routers.get('/product/image/add', adminSesh.isLogin, product.loadAddImage);
routers.post('/product/image/add', product.editImage);
routers.get('/product/delete', product.deleteProduct)


routers.get('/order', adminSesh.isLogin, order.loadorder);
routers.get('/orderDetails', adminSesh.isLogin, order.loadOrderDetails);
routers.post('/order/status', order.statusChange);

routers.get('/coupon', adminSesh.isLogin, coupon.loadCoupon);
routers.get('/coupon/add', adminSesh.isLogin, coupon.loadAddCoupon);
routers.post('/coupon/add', coupon.addCoupon);
routers.get('/coupon/edit', adminSesh.isLogin, coupon.loadEditCoupon);
routers.post('/coupon/edit', coupon.editCoupon);
routers.get('/coupon/delete',adminSesh.isLogin, coupon.deleteCoupon)
routers.post('/coupon/apply', coupon.applyCoupon);

routers.get('/banner', adminSesh.isLogin, banner.loadBanner);
routers.get('/banner/add', adminSesh.isLogin, banner.loadAddBanner);
routers.post('/banner/add', banner.addBanner);
routers.get('/banner/edit', adminSesh.isLogin, banner.loadEditBanner);
routers.post('/banner/edit', banner.editBanner);
routers.get('/banner/delete', banner.deleteBanner);





module.exports = routers 