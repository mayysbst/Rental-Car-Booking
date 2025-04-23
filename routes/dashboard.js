const express = require('express');
const { getDashboardData } = require('../controllers/dashboardController');

const router = express.Router();

const { protect, authorize } = require('../middleware/auth');

router.get('/', protect, authorize('admin'), getDashboardData);

module.exports = router;
