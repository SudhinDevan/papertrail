const isLogin = (req, res, next) => {
    try {
        if (req.session.Admin) {
            next()
        } else {
            res.render('Admin/adminLogin', { message: "" })
        }
    } catch (error) {
        console.log(error.message);
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
        console.log(error.message)
    }
}


module.exports = {
    isLogin,
    isLogout,
}