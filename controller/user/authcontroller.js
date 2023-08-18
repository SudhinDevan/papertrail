const User = require('../../model/userSchema');
const bcrypt = require('bcrypt');
const hash = require('../../utility/hashFunction');
const otp = require('../../utility/sendOTP');
const mail = require("../../utility/sendEmail");
const Product = require('../../model/productSchema');
const Category = require('../../model/categorySchema');
const cartModel = require('../../model/cartSchema');
const bannerModel = require('../../model/bannerSchema');
const userModel = require('../../model/userSchema');


// Load Signup page
const signup = async (req, res) => {
    res.render("User/userSignup")
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
            res.render('User/userSignup', {
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
                    res.render('User/userLogin', { message: "Access Denied" })
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


const loadHome = async (req, res) => {
    try {
        const id = req.session.User_id;
        const user = await User.findOne({ _id: id });
        const cart = await cartModel.findOne({ userId: id })
        const category = await Category.find();
        const products = await Product.find({ isActive: true })
        const banners = await bannerModel.find()


        res.render('User/home', { category, products, user, cart, banners });
    } catch (error) {
        res.render('User/404page');
    }
}


const successEmail = async (req, res) => {
    res.render("User/successEmail", { message: req.params.username })
    const username = req.params.username
    await User.findOneAndUpdate({ username: username }, { $set: { isVerified: true } })
}

const loadForgotPassword = (req, res) => {
    try {
      res.render("Authentication/forgotPassword", { message: null, user: null, cart: null});
    } catch (error) {
      res.render("User/404page");
    }
  };

  
const forgotPassword = async (req, res) => {
    try {
      const email = req.body.email;
      const emailMatch = await User.findOne({ email: email });
      if (!emailMatch) {
        res.render("Authentication/forgotPassword", {
          message: "Account for this email does'nt exist", user: null, cart: null
        });
      } else {
        const result = await otp.sendOtp(emailMatch);
        res.cookie("forgotHash", result, { httpOnly: true });
        res.render("Authentication/otp", {
          id: emailMatch._id,
          message: null,
          user: null,
          cart: null,
          localAction: `/forgotPassword/otp?id=${emailMatch._id}`,
        });
      }
    } catch (error) {
      console.log(error);
      res.render("User/404page");
    }
  };

  
const verifyForgotPasswordOtp = async (req, res) => {
    try {
      const userId = req.query.id;
      const secret = req.cookies["forgotHash"];
      const OTP = req.body.otp;
      const verified = await bcrypt.compare(OTP, secret);
      if (verified) {
        console.log("otp verification success");
        res.cookie("id", userId, { httpOnly: true });
        res.render("Authentication/newForgotPassword", { action: "/forgotPassword/newForgotPassword", user: null, cart: null });
      } else {
        console.log("otp verification failed");
        res.render("Authentication/otp", {
          user: null,
          cart: null,
          id: userId,
          message: "Incorrect OTP",
          localAction: `/forgotPassword/otp?id=${userId}`,
        });
      }
    } catch (error) {
      res.render("User/404page");
    }
  };
  
  
const newPassword = async (req, res) => {
    try {
      const id = req.cookies["id"];
      const newPassword = req.body.password;
      const hashNewPassword = await hash(newPassword);
      await userModel.findByIdAndUpdate(id, { password: hashNewPassword });
      res.render("User/userLogin", {message: "Password successfully reset"});
    } catch (error) {
      res.render("User/404page");
    }
  };
  


module.exports = {
    signup,
    createUser,
    verifyLogin,
    loadHome,
    successEmail,
    loadForgotPassword,
    forgotPassword,
    verifyForgotPasswordOtp,
    newPassword,
}