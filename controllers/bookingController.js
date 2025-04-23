const Booking = require('../models/Booking');
const Car = require('../models/Car');
const User = require('../models/User');

// @desc    Get all bookings
// @route   GET /api/v1/bookings
// @access  Private
exports.getBookings = async (req, res) => {
    let query;

    // Check role
    if (req.user.role !== 'admin') {
        // User → see only own bookings
        query = Booking.find({ user: req.user.id })
            .populate('user', 'name email')
            .populate('car', 'name type plateNumber')
            .populate('provider', 'name');
    } else {
        // Admin → see all bookings
        query = Booking.find()
            .populate('user', 'name email')
            .populate('car', 'name type plateNumber')
            .populate('provider', 'name');
    }

    try {
        const bookings = await query;

        res.status(200).json({
            success: true,
            count: bookings.length,
            data: bookings,
        });
    } catch (err) {
        console.log(err);
        res.status(500).json({
            success: false,
            message: 'Cannot get bookings',
        });
    }
};


// @desc    Get single booking
// @route   GET /api/v1/bookings/:id
// @access  Private
exports.getBooking = async (req, res) => {
    const booking = await Booking.findById(req.params.id)
        .populate('user')
        .populate('car')
        .populate('provider');

    if (!booking) {
        return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    res.status(200).json({ success: true, data: booking });
};

// @desc    Create booking
// @route   POST /api/v1/bookings
// @access  Private/User
exports.createBooking = async (req, res) => {
    try {
        const { car, provider, pickupLocation, returnLocation, pickupDate, returnDate } = req.body;

        // Check if user has active bookings (pending or confirmed)
        const activeBookings = await Booking.find({
            user: req.user.id,
            status: { $in: ['pending', 'confirmed'] }
        });

        if (activeBookings.length >= 3) {
            return res.status(400).json({
                success: false,
                message: 'You have reached the maximum limit of 3 active bookings'
            });
        }

        // Create the booking with the logged-in user's ID
        const booking = await Booking.create({
            user: req.user.id,
            car,
            provider,
            pickupLocation,
            returnLocation,
            pickupDate,
            returnDate,
            status: 'pending'
        });

        // Populate the provider details in the response
        const populatedBooking = await Booking.findById(booking._id)
            .populate('provider', 'name address telephone')
            .populate('car', 'name type plateNumber pricePerDay');

        res.status(201).json({
            success: true,
            data: populatedBooking
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({
            success: false,
            message: 'Failed to create booking'
        });
    }
};

// @desc    Update booking
// @route   PUT /api/v1/bookings/:id
// @access  Private
exports.updateBooking = async (req, res) => {
    try {
        let booking = await Booking.findById(req.params.id);

        if (!booking) {
            return res.status(404).json({
                success: false,
                message: 'Booking not found',
            });
        }

        // Check permission: Only the owner of the booking or an admin can update this booking.
        if (booking.user.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(401).json({
                success: false,
                message: 'Not authorized to update this booking',
            });
        }

        booking = await Booking.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
        });

        res.status(200).json({
            success: true,
            data: booking,
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            message: 'Cannot update booking',
        });
    }
};


// @desc    Delete booking
// @route   DELETE /api/v1/bookings/:id
// @access  Private/User or Admin
exports.deleteBooking = async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id);

        if (!booking) {
            return res.status(404).json({
                success: false,
                message: 'Booking not found'
            });
        }

        // Check permission: Only the owner of the booking or an admin can delete this booking
        if (booking.user.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(401).json({
                success: false,
                message: 'Not authorized to delete this booking'
            });
        }

        await booking.deleteOne();

        res.status(200).json({
            success: true,
            message: 'Booking deleted successfully'
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            message: 'Cannot delete booking'
        });
    }
};

