const Booking = require('../models/Booking');
const Car = require('../models/Car');
const Provider = require('../models/Provider');

//@desc     Get Admin Dashboard Data
//@route    GET /api/v1/dashboard
//@access   Private
exports.getDashboardData = async (req, res, next) => {
    try {
        // Total Car Rental
        const totalBooking = await Booking.countDocuments();

        // Popular Car Provider (Top 3)
        const popularProvider = await Booking.aggregate([
            {
                $group: {
                    _id: '$provider',
                    totalBooking: { $sum: 1 },
                },
            },
            { $sort: { totalBooking: -1 } },
            { $limit: 3 },
            {
                $lookup: {
                    from: 'providers',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'providerInfo',
                },
            },
            { $unwind: '$providerInfo' },
        ]);

        // Popular Car Type (Top 3)
        const popularCarType = await Car.aggregate([
            {
                $group: {
                    _id: '$type',
                    count: { $sum: 1 },
                },
            },
            { $sort: { count: -1 } },
            { $limit: 3 },
        ]);

        // Total Income
        const totalIncome = await Provider.aggregate([
            {
                $group: {
                    _id: null,
                    total: { $sum: '$income' },
                },
            },
        ]);

        // Total Outcome
        const totalOutcome = await Provider.aggregate([
            {
                $group: {
                    _id: null,
                    total: { $sum: '$outcome' },
                },
            },
        ]);

        res.status(200).json({
            success: true,
            data: {
                totalBooking,
                popularProvider,
                popularCarType,
                totalIncome: totalIncome[0] ? totalIncome[0].total : 0,
                totalOutcome: totalOutcome[0] ? totalOutcome[0].total : 0,
            },
        });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};
