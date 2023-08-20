const { log } = require("console");
const User = require("../../model/userSchema")


const userTable = async (req, res) => {
    try {
        let search = "";
        if (req.query.search) {
            search = req.query.search;
        }
        const userDetails = await User.find({
            isAdmin: false,
            $or: [
                { username: { $regex: new RegExp(search, 'i') } },
                { email: { $regex: new RegExp(search, 'i') } }
            ]
        });
        res.render('Admin/userData', { user: userDetails })
    } catch (error) {
        res.render('User/404page')
    }
}

const updateAccess = async (req, res) => {
    try {
        let access = req.body.access;
        const id = req.query.id;
        await User.findByIdAndUpdate(id, { $set: { isAccess: access } })
        res.redirect('/admin/userData')
    } catch (error) {
        res.render('User/404page')
    }
}

module.exports = {
    userTable,
    updateAccess,
}