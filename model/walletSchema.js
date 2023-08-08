const mongoose = require('mongoose');
const schema = mongoose.Schema;

const walletSchema = schema({
  user: {
    type: mongoose.Types.ObjectId,
    ref: "users",
    required: true,
  },
  balance: {
    type: Number,
    default: 0
  },
  history: [{

    updatedDate: {
      type: Date,
      default: Date.now()
    },
    type: {
      type: String,
      enum: ["add", "subtract"],
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    newBalance: {
      type: Number,
      required: true,
    }
  }]
})

module.exports = mongoose.model('wallet', walletSchema);