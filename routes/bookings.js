const express = require('express');
const {
    getBookings,
    getBooking,
    createBooking,
    updateBooking,
    deleteBooking
} = require('../controllers/bookingController');

const router = express.Router();

const { protect, authorize } = require('../middleware/auth');

router.route('/')
    .get(protect,authorize('admin', 'user'), getBookings) // View All Bookings (user, admin)
    .post(protect, authorize('user'), createBooking); // Only user create booking

router.route('/:id')
    .get(protect, getBooking) // View Single Booking
    .put(protect, authorize('user', 'admin'), updateBooking) // User or Admin can edit
    .delete(protect, authorize('user', 'admin'), deleteBooking); // User or Admin can delete

module.exports = router;
