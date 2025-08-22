const mongoose = require("mongoose");

const UpdateItemSchema = new mongoose.Schema({
    productName: {
        type: String,
        required: true
    },
    productPrice: {
        type: Number,
        required: true
    },
    sellPrice: {
        type: Number,
        required: true
    },
    quantityChanged: {
        type: Number,
        required: true
    },
    userId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "User", 
        required: true 
    }
}, {
    timestamps: true
}
);
module.exports = mongoose.model("UpdateItem", UpdateItemSchema);
