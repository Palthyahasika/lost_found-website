const mongoose = require("mongoose");

const itemSchema = new mongoose.Schema({

    itemName: {
        type: String,
        required: true
    },

    itemType: {
        type: String,
        enum: ["Lost", "Found"],
        required: true
    },

    category: {
        type: String,
        required: true
    },

    description: {
        type: String,
        required: true
    },

    location: {
        type: String,
        required: true
    },

    contactNumber: {
        type: String,
        required: true
    },

    image: {
        type: String,
        default: ""
    },

    status: {
        type: String,
        default: "Pending"
    },

    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    }

}, {
    timestamps: true
});

module.exports = mongoose.model("Item", itemSchema);