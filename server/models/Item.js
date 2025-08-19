const mongoose = require('mongoose');

const ItemSchema = new mongoose.Schema({
    productName: {
        type: String,
        required: true,
        trim: true
    },
    productPrice: {
        type: Number,
        required: true
    },
    productSellPrice: {
        type: Number,
        required: true
    },
    productDescription: {
        type: String,
        required: true
    },
    quantity: {
        type: Number,
        required: true,
        default: 0,
        min: [0, "Quantity cannot be negative"]
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    history: [
        {
            quantityChanged: Number,
            type: { type: String, enum: ["CREATED", "INCREASED", "DECREASED"] },
            date: { type: String, default: () => new Date().toLocaleDateString() },
            time: { type: String, default: () => new Date().toLocaleTimeString() }
        }
    ]
});

ItemSchema.index({ userId: 1, productName: 1 }, { unique: true });

module.exports = mongoose.model('Item', ItemSchema);
