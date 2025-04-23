const express = require('express');
const {
    getMe,
    updateMe,
    deleteMe
} = require('../controllers/userController');

const router = express.Router();

const { protect } = require('../middleware/auth');

router.route('/me')
    .get(protect, getMe) // View my profile
    .put(protect, updateMe) // Edit my profile
    .delete(protect, deleteMe); // Delete my account

module.exports = router;
