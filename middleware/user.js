const userSchema = require("../model/userSchema");

const isLogin = async(req, res, next) => {
    try {
        if(req.session.User_id){
            const userId = req.session.User_id
            const user = await userSchema.findOne({_id: userId})
            if (user.isAccess===true) {
                next()
            }else {
                res.render('User/userLogin', { message: "" });
            }
        } else {
            res.render('User/userLogin', { message: "" });
        }

    } catch (error) {
        res.render('User/404page')
    }
}

const isLogout = (req, res) => {
    try {
        req.session.User_id = null;
        res.clearCookie('User_id')
        res.redirect('/')
        
    } catch (error) {
        res.render('User/404page')
    }
}

module.exports = {
    isLogin,
    isLogout,
}