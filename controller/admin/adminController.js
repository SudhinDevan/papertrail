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
        console.log(error.message);
    }
}

const updateAccess = async (req, res) => {
    try {
        let access = req.body.access;
        console.log(access);
        const id = req.query.id;
        console.log(id);
        await User.findByIdAndUpdate(id, { $set: { isAccess: access } })
        res.redirect('/admin/userData')
    } catch (error) {
        console.log(error);
    }
}

module.exports = {
    userTable,
    updateAccess,
}