const mongoose = require('mongoose');

const providerSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    telephone: {
        type: String,
        required:[true, 'Please add a phone number'],
        maxlength: 10
    },
    address: {
        street: String,
        city: String,
        state: String,
        postalCode: String,
        country: String
    },
    location: {
        latitude: {
            type: Number,
            required: true
        },
        longitude: {
            type: Number,
            required: true
        }
    },
    popularityScore: {
        type: Number,
        default: 0  //count the number of bookings for Dashboard.
    },
    income: {
        type: Number,
        default: 0 // รายรับสะสม
    },
    outcome: {
        type: Number,
        default: 0 // ค่าใช้จ่ายสะสม (optional)
    },
    isActive: {
        type: Boolean,
        default: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
},{
    toJSON: {virtuals:true},
    toObject: {virtuals:true}
});

//Reverse populate with virtuals
providerSchema.virtual('cars', {
    ref: 'Car',
    localField: '_id',
    foreignField: 'provider',
    justOne: false
});

module.exports = mongoose.model('Provider', providerSchema);
