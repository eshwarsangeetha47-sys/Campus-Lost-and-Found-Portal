const mongoose = require("mongoose");

const claimSchema = new mongoose.Schema({
    item: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Item",
        required: true
    },

    claimant: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },

    description: {
        type: String,
        required: true
    },

    status: {
        type: String,
        enum: ["Pending", "Approved", "Rejected"],
        default: "Pending"
    },

    date: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model("Claim", claimSchema);