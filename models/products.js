const mongoose = require('mongoose') ;

const productSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    description: {
        type: String,
        required: true
    },
    location: {
        type: String,
        required: true
    },
    information: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },

    productImage: {
        type: String,
        required: true
    }
})

module.exports = mongoose.model('Products', productSchema)