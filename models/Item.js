const mongoose = require("mongoose");

const itemSchema = new mongoose.Schema({
    itemName: {
        type: String,
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

    date: {
        type: Date,
        required: true
    },

    listingType: {
        type: String,
        enum: ["Lost", "Found"],
        required: true
    },

    image: {
        type: String,
        default: ""
    },

    status: {
        type: String,
        default: "Available"
    }
});

module.exports = mongoose.model("Item", itemSchema);