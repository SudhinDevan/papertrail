const isLogin = (req, res, next) => {
    try {
        if (req.session.Admin) {
            next()
        } else {
            res.render('Admin/adminLogin', { message: "" })
        }
    } catch (error) {
        res.render('User/404page')
    }
}

const isLogout = (req, res, next) => {
    try {
        if (req.session.Admin) {
            res.redirect('/admin/');
        } else {
            next();
        }
    } catch (error) {
        res.render('User/404page')
    }
}


module.exports = {
    isLogin,
    isLogout,
}