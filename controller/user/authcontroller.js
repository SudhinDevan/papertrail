const User = require('../../model/userSchema')
const bcrypt = require('bcrypt')
const mail = require("../../utility/sendEmail")
const Product = require('../../model/productSchema')
const Category = require('../../model/categorySchema')
const cartModel = require('../../model/cartSchema')

// Load Signup page
const signup = async (req, res) => {
    res.render("User/usersignup")
}

// Function to hash password
const hashPassword = async (password) => {
    try {
        const hashPassword = await bcrypt.hash(password, 10)
        return hashPassword
    }
    catch (error) {
        console.log(error.message)
    }
}

// Function to create new user
const createUser = async (req, res) => {
    try {
        const userName = req.body.username
        const email = req.body.email
        const password = req.body.password
        const userData = await User.findOne({ username: userName })
        if (userData) {
            res.render('user/usersignup', {
                message: "User already Exists"
            })
        } else {
            const sPass = await hashPassword(password)

            const newUser = new User({
                username: userName,
                email: email,
                password: sPass,
            });
            const savedUser = await newUser.save()
            const verify = await mail.verifyEmail(newUser)
            res.render('User/verifyEmail')
        }
    }
    catch (error) {
        console.log(error.message)
    }
}


// Existing user Login
const verifyLogin = async (req, res) => {
    const email = req.body.email
    const password = req.body.password
    const userData = await User.findOne({ email: email })
    if (userData) {
        const passMatch = await bcrypt.compare(password, userData.password)
        if (passMatch) {
            if (userData.isVerified) {
                if (userData.isAccess) {
                    req.session.User_id = userData._id
                    res.redirect('/')
                } else {
                    res.render('User/userlogin', { message: "Access Denied" })
                }
            } else {
                const verify = await mail.verifyEmail(userData)
                res.render('User/userLogin', { message: "Please verify to login" })
            }
        } else {
            res.render('User/userLogin', { message: "Username/Password Incorrect" })
        }
    } else {
        res.render('User/userLogin', { message: "Invalid User" })
    }
}

// Home if session, else Login
const loadHome = async (req, res) => {
    const id = req.session.User_id;
    const user = await User.findOne({ _id: id });
    const category = await Category.find();
    const products = await Product.find({ isActive: true })
    const cart = await cartModel.findOne({ userId: id })
    res.render('User/home', { category, products, user, cart });
}


const successEmail = async (req, res) => {
    res.render("User/successEmail", { message: req.params.username })
    const username = req.params.username
    await User.findOneAndUpdate({ username: username }, { $set: { isVerified: true } })
}



module.exports = {
    signup,
    createUser,
    verifyLogin,
    loadHome,
    successEmail,
}