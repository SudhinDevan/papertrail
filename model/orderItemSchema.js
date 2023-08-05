const mongoose = require('mongoose');
const schema = mongoose.Schema;

const orderItemSchema = new schema({
    product: {
        type: mongoose.Types.ObjectId,
        ref: "product",
        required: true,
    },
    quantity: {
        type: Number,
        required: true,
    }
})


module.exports = mongoose.model('orderItem', orderItemSchema);