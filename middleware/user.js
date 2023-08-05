const isLogin = (req, res, next) => {
    try {
        if (req.session.User_id) {
            next()
        } else {
            res.render('user/userlogin', { message: "" });
        }

    } catch (error) {
        console.log(error.message);
    }
}

const isLogout = (req, res) => {
    try {
        req.session.User_id = null;
        res.clearCookie('User_id')
        res.redirect('/')
    } catch (error) {
        console.log(error.message);
    }
}

module.exports = {
    isLogin,
    isLogout,
}