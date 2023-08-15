const categoryModel = require('../../model/categorySchema');
const productModel = require('../../model/productSchema');
const userModel = require('../../model/userSchema');
const cartModel = require('../../model/cartSchema');
const wishlistModel = require('../../model/wishlistSchema')


const productInCategory = async (req, res) => {
    const userId = req.session.User_id;
    const categoryId = req.query.categoryId;
    const search = req.query.search || '';
    const minamount = parseInt(req.query.minamount) || 0;
    const maxamount = parseInt(req.query.maxamount) || 1000;

    const PAGE_SIZE = 6;
    const page = parseInt(req.query.page) || 1;
    const skip = (page - 1) * PAGE_SIZE;


    try {
        const products = await productModel
            .find({
                isActive: true,
                category: categoryId,
                productName: { $regex: new RegExp(search, 'i') },
                $and: [
                    { price: { $gt: minamount } },
                    { price: { $lt: maxamount } },
                ]
            })
            .skip(skip)
            .limit(PAGE_SIZE)
            .exec();

        const category = await categoryModel.find().exec();
        const cart = await cartModel.findOne({ userId: userId })
        const user = await userModel.findOne({ _id: userId })

        const totalCount = await productModel
            .countDocuments({ isActive: true, category: categoryId })
            .exec();
        res.render('User/shop', {
            category,
            cart,
            products,
            user,
            totalCount,
            currentPage: page,
            totalPages: Math.ceil(totalCount / PAGE_SIZE),
            search,
            minamount,
            maxamount,
            catId: categoryId,
        });
    } catch (err) {
        console.error('Error fetching products by category:', err);
        res.status(500).send('Internal server error');
    }
};



const loadShop = async (req, res) => {
    const id = req.session.User_id;
    const search = req.query.search || '';
    const user = await userModel.findOne({ _id: id });
    const minamount = parseInt(req.query.minamount) || 0;
    const maxamount = parseInt(req.query.maxamount) || 1000;

    const PAGE_SIZE = 6;
    const page = parseInt(req.query.page) || 1;
    const skip = (page - 1) * PAGE_SIZE;

    const products = await productModel.find({
        isActive: true,
        productName: { $regex: new RegExp(search, 'i') },
        $and: [
            { price: { $gt: minamount } },
            { price: { $lt: maxamount } },
        ]
    }).skip(skip).limit(PAGE_SIZE);

    const category = await categoryModel.find();
    const cart = await cartModel.findOne({ userId: id })


    const totalCount = await productModel.countDocuments({ isActive: true });

    res.render('User/shop', { category, products, user, cart, totalCount, currentPage: page, totalPages: Math.ceil(totalCount / PAGE_SIZE), search, minamount, maxamount });
};


const productDetails = async (req, res) => {
    try {

        const userId = req.session.User_id;

        const user = await userModel.findOne({ _id: userId });
        const cart = await cartModel.findOne({ userId });
        const wishlist = await wishlistModel.findOne({ userId: userId });
        const id = req.query.id;
        const relatedProducts = await productModel.find()
        const products = await productModel.find();
        const category = await categoryModel.find();
        const product = await productModel.findOne({ _id: id })
        let wish = false;
        if (user && wishlist && wishlist.items.length > 0) {
            if (wishlist.items.includes(product._id)) {
                wish = true;
            }
        }
        await productModel.findOne({ _id: id })
            .then((product) => {
                if (!product) {
                    res.render('User/404page');
                }
                res.render('User/productDetails', { category, cart, relatedProducts, product, products, userId, user, wish });
            })
            .catch(err => {
                res.render('User/404page');
            })

    } catch (error) {
        console.log(error);
    }

}


const loadWishlist = async (req, res) => {
    const id = req.session.User_id;
    const cart = await cartModel.findOne({ userId: id })

    const user = await userModel.findOne({ _id: id })
    const products = await productModel.find({
        _id: { $in: user.wishlist },
    }).lean()

    res.render('User/wishlist', { user, products, cart });
};


const addToWishlist = async (req, res) => {
    const id = req.session.User_id;
    const productid = req.query.productId;

    try {
        await userModel.updateOne({ _id: id }, { $push: { wishlist: productid } });
        res.json({ success: true });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: "Failed to add to wishlist" });
    }
}


module.exports = {
    loadShop,
    productDetails,
    addToWishlist,
    loadWishlist,
    productInCategory,
}