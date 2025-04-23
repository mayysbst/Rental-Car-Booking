const mongoose = require('mongoose');

const carSchema = new mongoose.Schema({
    provider: {
        type: mongoose.Schema.ObjectId,
        ref: 'Provider',
        required: true
    },
    name: {
        type: String,
        required: true
    },
    type: {
        type: String,
        required: true
    },
    plateNumber: {
        type: String,
        required: true,
        unique: true
    },
    pricePerDay: {
        type: Number,
        required: true
    },
    available: {
        type: Boolean,
        default: true
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model('Car', carSchema);
