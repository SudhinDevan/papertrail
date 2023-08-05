const mongoose = require('mongoose');
const schema = mongoose.Schema;


const categorySchema = new schema({
    categoryName: {
        type: String,
        required: true
    }
})


module.exports = mongoose.model('category', categorySchema);