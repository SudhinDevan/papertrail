const mongoose = require('mongoose');
const schema = mongoose.Schema;


const orderSchema = schema({
    user: {
        type: mongoose.Types.ObjectId,
        ref: "user",
        required: true,
    },
    address: {
        type: mongoose.Types.ObjectId,
        ref: "address",
        required: true,
    },
    items: [
        {
            type: mongoose.Types.ObjectId,
            ref: "orderItem",
            required: true
        },
    ],
    price: {
        type: Number,
        required: true,
    },
    order_status: {
        type: String,
        default: "pending"
    },
    payment_status: {
        type: Boolean,
    },
    payment_method: {
        type: String,
    },
    coupon: {
        type: String,
    },
    couponDiscount: {
        type: Number,
    },
    order_date: {
        type: Date,
        default: Date.now(),
    }
})



module.exports = mongoose.model('order', orderSchema);