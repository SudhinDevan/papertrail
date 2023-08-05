const User = require('../../model/userSchema')
const bcrypt = require('bcrypt')


// Get Admin Login
const adminlogin = async (req, res) => {
    res.render('Admin/dashBoard', { message: "" });
}

// verify admin credentials
const verifyAdminLogin = async (req, res) => {
    const username = req.body.username;
    const email = req.body.email;
    const password = req.body.password;
    const userData = await User.findOne({ email: email })
    if (userData) {
        const passMatch = await bcrypt.compare(password, userData.password)
        if (passMatch) {
            if (userData.isAdmin) {
                req.session.Admin = userData.email
                res.render('Admin/dashBoard', { admin: userData.username })
            } else {
                res.render('Admin/adminLogin', { message: "Access Denied" })
            }
        } else {
            res.render('Admin/adminLogin', { message: "Invalid Credentials" })
        }
    } else {
        res.render('Admin/adminLogin', { message: "Invalid User" })
    }
}


const adminLogout = async (req, res) => {
    try {
        req.session.Admin = null;
        res.clearCookie('Admin')
        res.redirect('/admin/')
    } catch (error) {
        console.log(error.message);
    }

}

const blockUser = async (req, res) => {
    const userData = await User.findOne({ email: email })
    try {
        userData.isAccess = false;
        res.redirect('/userData')
    } catch (error) {
        console.log(error.message);
    }
}

module.exports = {
    adminlogin,
    verifyAdminLogin,
    adminLogout,
    blockUser,
}
