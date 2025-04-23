const express = require('express');
const {
    getCars,
    getCar,
    createCar,
    updateCar,
    deleteCar
} = require('../controllers/carController');

const router = express.Router();

const { protect, authorize } = require('../middleware/auth');

router.route('/')
    .get(getCars)
    .post(protect, authorize('admin'), createCar); // Admin create car

router.route('/:id')
    .get(getCar)
    .put(protect, authorize('admin'), updateCar) // Admin update car
    .delete(protect, authorize('admin'), deleteCar); // Admin delete car

module.exports = router;
