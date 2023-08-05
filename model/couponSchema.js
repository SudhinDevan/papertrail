const mongoose = require('mongoose');
const schema = mongoose.Schema;


const couponSchema = schema({
  couponName: {
    type: String,
    required: true,
  },
  discount: {
    type: Number,
    required: true,
  },
  expiryDate: {
    type: Date,
    required: true,
  },
  minAmount: {
    type: Number,
    required: true,
  },
  isActive: {
    type: Boolean,
    required: true,
    default: true,
  },
  owners: [
    {
      user: {
        type: mongoose.Types.ObjectId,
        ref: "users",
        required: true
      },
      quantity: {
        type: Number,
        default: 1,
      }
    }
  ]
})

module.exports = mongoose.model('coupon', couponSchema);