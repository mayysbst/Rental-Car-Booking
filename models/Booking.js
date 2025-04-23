const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true,
    },
    car: {
        type: mongoose.Schema.ObjectId,
        ref: 'Car',
        required: true,
    },
    provider: {
        type: mongoose.Schema.ObjectId,
        ref: 'Provider',
        required: true,
    },
    pickupLocation: {
        type: String,
        required: true,
    },
    returnLocation: {
        type: String,
        required: true,
    },
    pickupDate: {
        type: Date,
        required: true,
    },
    returnDate: {
        type: Date,
        required: true,
    },
    status: {
        type: String,
        enum: ['pending', 'confirmed', 'cancelled'],
        default: 'pending',
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model('Booking', bookingSchema);