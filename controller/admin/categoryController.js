const categoryModel = require('../../model/categorySchema')
const productModel = require('../../model/productSchema');


const loadCategory = async (req, res) => {
    try {
        let productsValue = [];
        const categories = await categoryModel.find();

        for (let i = 0; i < categories.length; i++) {
            productsValue[i] = await productModel.findOne({ category: categories[i]._id })
        }
        res.render('Admin/categories', { categories, productsValue });
    } catch (error) {
        res.render('User/404page')
    }
}


const loadAddCategory = async (req, res) => {
    try{
        res.render("Admin/addCategory", { message: "" })
    }catch (error) {
        res.render('User/404page')
    }
}

const addCategory = async (req, res) => {
    try {
        const categoryName = req.body.name;

        const catergoryData = await categoryModel.findOne({ categoryName: { $regex: new RegExp(`^${req.body.name}$`, "i") } })

        if (catergoryData) {
            res.render('Admin/addCategory', { message: "This category already exists" });
        } else {
            const newCategory = new categoryModel({
                categoryName: categoryName
            })
            const savedCategory = await newCategory.save();
            res.redirect('/admin/category');
        }


    } catch (error) {
        res.render('User/404page')
    }
}

const loadEditCategory = async (req, res) => {
    try {
        const id = req.query.id;
        const categoryData = await categoryModel.findOne({ _id: id });

        res.render('Admin/editCategory', { message: null, category: categoryData })
    } catch (error) {
        res.render('User/404page')
    }
}


const editCategory = async (req, res) => {
    try {
        const id = req.query.id
        const categoryName = req.body.name

        await categoryModel.findByIdAndUpdate(id, { categoryName: req.body.name })
        res.redirect('/admin/category');
    } catch (error) {
        res.render('User/404page')
    }
}



module.exports = {
    loadAddCategory,
    editCategory,
    loadCategory,
    addCategory,
    loadEditCategory,
}