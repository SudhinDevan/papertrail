const User = require('../../model/userSchema')
const bcrypt = require('bcrypt')

// verify admin credentials
const verifyAdminLogin = async (req, res) => {
    try {
        const username = req.body.username;
        const email = req.body.email;
        const password = req.body.password;
    const userData = await User.findOne({ email: email })
    if (userData) {
        const passMatch = await bcrypt.compare(password, userData.password)
        if (passMatch) {
            if (userData.isAdmin) {
                req.session.Admin = userData.email
                res.redirect('Admin/dashBoard')
            } else {
                res.render('Admin/adminLogin', { message: "Access Denied" })
            }
        } else {
            res.render('Admin/adminLogin', { message: "Invalid Credentials" })
        }
    } else {
        res.render('Admin/adminLogin', { message: "Invalid User" })
    }
  }catch (error) {
    res.render('User/404page')
  }
}

   
const adminLogout = async (req, res) => {
    try {
        req.session.Admin = null;
        res.clearCookie('Admin')
        res.redirect('/admin/')
    }catch (error) {
      res.render('User/404page')
  }

}

const blockUser = async (req, res) => {
    const userData = await User.findOne({ email: email })
    try {
        userData.isAccess = false;
        res.redirect('/userData')
    } catch (error) {
      res.render('User/404page')
  }
}

module.exports = {
    verifyAdminLogin,
    adminLogout,
    blockUser,
}
