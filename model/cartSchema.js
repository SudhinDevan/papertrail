const mongoose = require('mongoose');
const schema = mongoose.Schema;

const cartSchema = new schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users",
        required: true,
    },
    items: [
        {
            productId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "product",
                required: true,
            },
            quantity: {
                type: Number,
                default: 1,
            },
            totalPrice: {
                type: Number,
            },
            date: {
                type: Date,
                default: Date.now(),
            }
        }
    ],
    cartPrice: {
        type: Number,
        default: 0,
    },

});


module.exports = mongoose.model('cart', cartSchema);