const mongoose = require("mongoose");

const claimRequestSchema = new mongoose.Schema({
    itemId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Item",
        required: true
    },

    ownerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },

    claimantId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },

    status: {
        type: String,
        enum: ["Pending", "Approved", "Rejected"],
        default: "Pending"
    }

}, {
    timestamps: true
});

module.exports = mongoose.model(
    "ClaimRequest",
    claimRequestSchema
);