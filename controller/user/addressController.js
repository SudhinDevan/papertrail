const userModel = require('../../model/userSchema');
const addressModel = require('../../model/addressSchema');
const cartModel = require('../../model/cartSchema')


const loadAddress = async (req, res) => {
    const id = req.session.User_id;
    const userData = await userModel.findOne({ _id: id });
    const contactAddress = await addressModel.findOne({ user: id, type: "contact" });
    const mainAddress = await addressModel.findOne({ user: id, type: "main" });
    const secondaryAddress = await addressModel.find({ user: id, type: "secondary" });
    const cart = await cartModel.findOne({ userId: id })

    res.render("User/address", { id, user: userData, contact: contactAddress, main: mainAddress, secondary: secondaryAddress, cart });
}


const loadAddAddress = async (req, res) => {
    const id = req.session.User_id
    const type = req.query.type;
    const user = await userModel.findOne({ _id: id })
    const cart = await cartModel.findOne({ userId: id })


    res.render("User/addAddress", { user, type, cart });
}


const addAddress = async (req, res) => {
    try {

        const id = req.session.User_id;

        const {
            buildingName,
            street,
            city,
            state,
            type,
        } = req.body;

        let pincode = parseInt(req.body.pincode);
        let phonenumber = parseInt(req.body.number);

        const newAddress = new addressModel({
            buildingName,
            street,
            city,
            state,
            pincode,
            phonenumber,
            user: id,
            type,
        })

        await newAddress.save();
        res.redirect('/user/profile/address');

    } catch (error) {
        console.log(error);
    }

}


const loadEditAddress = async (req, res) => {
    const userid = req.session.User_id
    const user = await userModel({ _id: userid })
    const { type, id } = req.query;
    const cart = await cartModel.findOne({ userId: id })
    const address = await addressModel.findOne({ _id: id });
    res.render("User/editAddress", { user, type, address, cart });
}


const editAddress = async (req, res) => {

    try {

        const addressId = req.query.addressId;

        const {
            buildingName,
            street,
            city,
            state,
        } = req.body;

        let pincode = parseInt(req.body.pincode);
        let phonenumber = parseInt(req.body.number);

        await addressModel.findByIdAndUpdate(addressId, {
            buildingName,
            street,
            city,
            state,
            pincode,
            phonenumber,
        })

        res.redirect('/user/profile/address');

    } catch (error) {
        console.log(error);
    }

}


const deleteAddress = async (req, res) => {
    try {

        const id = req.query.id;
        await addressModel.deleteOne({ _id: id });
        res.json({ response: true });

    } catch (error) {
        console.log(error)
    }
}





module.exports = {
    loadAddress,
    loadAddAddress,
    addAddress,
    loadEditAddress,
    editAddress,
    deleteAddress,
}