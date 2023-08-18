const userModel = require('../../model/userSchema')
const bcrypt = require('bcrypt');
const hash = require('../../utility/hashFunction')
const cartModel = require('../../model/cartSchema')


const loadUserProfile = async (req, res) => {
    const id = req.session.User_id
    const user = await userModel.findOne({ _id: id })
    const cart = await cartModel.findOne({ userId: id })


    res.render('User/userprofile', { user, id, cart })

}

const loadEditUser = async (req, res) => {
    const id = req.query.id;
    const user = await userModel.findOne({ _id: id });
    const cart = await cartModel.findOne({ userId: id })

    res.render("User/editUser", { user, cart });
}


const editUser = async (req, res) => {
    const id = req.query.id;
    const username = req.body.username;
    const user = await userModel.findByIdAndUpdate(id, { $set: { username: username } });;
    res.redirect('/user/profile');
}

const oldPassword = async (req, res) => {
    const id = req.session.User_id;
    const user = await userModel.findOne({ _id: id })
    const cart = await cartModel.findOne({ userId: id })

    res.render('User/oldPassword', { user, id, message: "", cart })

}


const verifyOldPassword = async (req, res) => {
    try {

        const id = req.query.id;
        const oldPassword = req.body.oldPassword

        const user = await userModel.findOne({ _id: id });

        const passMatch = await bcrypt.compare(oldPassword, user.password);

        if (!passMatch) {
            res.render('User/oldPassword', { user, id, message: "The old password is incorrect" });
        } else {
            res.render('Authentication/newPassword', { user, action: "/User/profile/newPassword" })
        }

    } catch (error) {
        console.log(error);
    }

}


const profileNewPassword = async (req, res) => {
    const id = req.session.User_id;

    const newPassword = req.body.password;
    const hashNewPassword = await hash(newPassword);
    await userModel.findByIdAndUpdate(id, { password: hashNewPassword });
    res.redirect('/user/profile');
}


module.exports = {
    loadUserProfile,
    oldPassword,
    verifyOldPassword,
    profileNewPassword,
    loadEditUser,
    editUser,
}