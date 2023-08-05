const mongoose = require('mongoose');
const schema = require('mongoose').Schema;


const productSchema = schema({
    productName: {
        type: String,
        required: true,
    },
    category: {
        type: String,
        required: true,
    },
    price: {
        type: Number,
        required: true,
    },
    quantity: {
        type: Number,
        required: true,
    },
    blurb: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    image: [{
        public_id: {
            type: String,
            required: true,
        },
        url: {
            type: String,
            required: true,
        }
    }],
    isActive: {
        type: Boolean,
        required: true,
        default: true,
    }
})


module.exports = mongoose.model('product', productSchema);