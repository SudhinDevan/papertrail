const productModel = require('../../model/productSchema')
const categoryModel = require('../../model/categorySchema');
const { parse } = require('path');
const { multipleImage, imageUpload } = require('../../utility/uploadImage');
const deleteImage = require('../../utility/deleteImage')



const loadProducts = async (req, res) => {
    try{
        const products = await productModel.find();
        const categories = await categoryModel.find();
        res.render('Admin/product', { products, categories });
    }catch (error) {
        res.render('User/404page')
    }
}

const loadAddProducts = async (req, res) => {
    try{
        const categories = await categoryModel.find();
        res.render('Admin/addProduct', { categories: categories })
    }catch (error) {
        res.render('User/404page')
    }
}

const addProduct = async (req, res) => {
    try {
        const productName = req.body.productName;
        const category = req.body.category;
        let price = req.body.price;
        let quantity = req.body.quantity;
        const blurb = req.body.blurb;
        const description = req.body.description;

        const images = req.files.image;

        price = parseFloat(price);
        quantity = parseInt(quantity);

        const urlList = await multipleImage(images);

        const newProduct = productModel({
            productName: productName,
            category: category,
            price: price,
            quantity: quantity,
            blurb: blurb,
            description: description,
            image: urlList,
        })

        await newProduct.save()
        res.redirect('/admin/product');
    } catch (error) {
        res.render('User/404page')
    }
}


const loadEditProduct = async (req, res) => {
    try{
        const idb = req.query.id;
        const categories = await categoryModel.find();
        const product = await productModel.findOne({ _id: idb })
        res.render('Admin/editProduct', { categories, product });
    }catch (error) {
        res.render('User/404page')
    }
}


const editProduct = async (req, res) => {
    try {
        const id = req.query.id;
        const productName = req.body.productName;
        const category = req.body.category;
        let price = req.body.price;
        let quantity = req.body.quantity;
        const blurb = req.body.blurb;
        const description = req.body.description;

        price = parseFloat(price);
        quantity = parseInt(quantity);

        await productModel.findByIdAndUpdate(id, {
            productName: productName,
            category: category,
            price: price,
            quantity: quantity,
            blurb: blurb,
            description: description,
        })

        res.redirect('/admin/product');

    } catch (error) {
        res.render('User/404page')
    }

}



const deleteProduct = async (req, res) => {
    try {
        const { id, active } = req.query;

        if (active == "true") {
            await productModel.findByIdAndUpdate(id, { $set: { isActive: false } });
        } else if (active == "false") {
            await productModel.findByIdAndUpdate(id, { $set: { isActive: true } });
        }

        res.redirect('/admin/product');

    } catch (error) {
        res.render('User/404page')
    }
}


const loadImages = async (req, res) => {
    try {
        const { id } = req.query;
        const product = await productModel.findOne({ _id: id });
        res.render('Admin/editImages', { product });

    } catch (error) {
        res.render('User/404page')
    }

}



const deleteProductImage = async (req, res) => {
    try{
        const { public_id, productId } = req.query; 
        await deleteImage(public_id);
        await productModel.updateOne({ _id: productId, "image.public_id": public_id },
        {
            $pull: {
                "image": { public_id: public_id }
            }
        }
        )
        res.json({ response: true })
    }catch (error) {
        res.render('User/404page')
    }
}


const loadAddImage = async (req, res) => {
    try {

        const { productId } = req.query;
        const product = await productModel.findOne({ _id: productId });
        res.render('Admin/addImage', { productId, product })

    } catch (error) {
        res.render('User/404page')
    }
}


const editImage = async (req, res) => {
    try {

        const { image } = req.files;
        const { productId } = req.query;

        const result = await imageUpload(image);

        await productModel.updateOne({ _id: productId },
            {
                $push: {
                    image: result
                }
            })

        res.redirect('/admin/product')

    } catch (error) {
        res.render('User/404page')
    }
}



module.exports = {
    loadAddProducts,
    addProduct,
    loadProducts,
    loadEditProduct,
    editProduct,
    deleteProduct,
    loadImages,
    deleteProductImage,
    loadAddImage,
    editImage,

}

