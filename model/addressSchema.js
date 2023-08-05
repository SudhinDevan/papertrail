const mongoose = require('mongoose');
const schema = mongoose.Schema;

const addressSchema = new schema({
    buildingName: {
        type: String,
        required: true,
    },
    street: {
        type: String,
        required: true,
    },
    city: {
        type: String,
        required: true,
    },
    state: {
        type: String,
        required: true,
    },
    pincode: {
        type: Number,
        required: true,
    },
    phonenumber: {
        type: Number,
        required: true,
    },
    user: {
        type: String,
        required: true,
    },
    type: {
        type: String,
        required: true,
    }
});

module.exports = mongoose.model("address", addressSchema);