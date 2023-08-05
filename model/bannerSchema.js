const mongoose = require('mongoose');
const schema = mongoose.Schema;


const bannerSchema = schema({
  title: {
    type: String,
    required: true,
  },
  bannerImage: {
    public_id: {
      type: String,
      required: true,
    },
    url: {
      type: String,
      required: true,
    }
  },
  description: {
    type: String,
    required: true,
  },
  targetCategory: {
    type: mongoose.Types.ObjectId,
    ref: "category",
    required: true,
  }
})

module.exports = mongoose.model('banner', bannerSchema);