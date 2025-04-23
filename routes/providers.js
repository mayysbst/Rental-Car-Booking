const express = require('express');
const mongoose = require('mongoose');
const {
    getProviders,
    getProvider,
    createProvider,
    updateProvider,
    deleteProvider,
    getProviderLocations
} = require('../controllers/providerController');

const Car = require('../models/Car');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');

// Existing provider routes
router.route('/')
    .get(getProviders)
    .post(protect, authorize('admin'), createProvider);

router.route('/locations').get(getProviderLocations);

router.route('/:id')
    .get(getProvider)
    .put(protect, authorize('admin'), updateProvider)
    .delete(protect, authorize('admin'), deleteProvider);

// Add the new route for getting provider's cars
router.get('/:providerId/cars', async (req, res) => {
    try {
        const providerId = req.params.providerId;
        
        if (!mongoose.Types.ObjectId.isValid(providerId)) {
            return res.status(400).json({
                success: false,
                message: `Invalid provider ID format: ${providerId}`
            });
        }

        // Fix: Change providerId to provider in the query
        const cars = await Car.find({ 
            provider: providerId,
            available: true  // Only get available cars
        });
        
        res.json({
            success: true,
            data: cars
        });
    } catch (error) {
        console.error('Error details:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching provider cars',
            error: error.message
        });
    }
});

module.exports = router;
