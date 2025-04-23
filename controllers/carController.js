const Car = require('../models/Car');

//@desc     Get all cars
//@route    GET /api/v1/cars
//@access   Public
exports.getCars = async (req, res, next) => {
    try {
        const cars = await Car.find().populate('provider', 'name telephone');

        res.status(200).json({
            success: true,
            count: cars.length,
            data: cars,
        });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};

//@desc     Get single car
//@route    GET /api/v1/cars/:id
//@access   Public
exports.getCar = async (req, res, next) => {
    try {
        const car = await Car.findById(req.params.id).populate('provider', 'name telephone');

        if (!car) {
            return res.status(404).json({ success: false, message: 'Car not found' });
        }

        res.status(200).json({ success: true, data: car });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};

//@desc     Create new car
//@route    POST /api/v1/cars
//@access   Private (Admin)
exports.createCar = async (req, res, next) => {
    try {
        const car = await Car.create(req.body);

        res.status(201).json({ success: true, data: car });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};

//@desc     Update car
//@route    PUT /api/v1/cars/:id
//@access   Private (Admin)
exports.updateCar = async (req, res, next) => {
    try {
        const car = await Car.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
        });

        if (!car) {
            return res.status(404).json({ success: false, message: 'Car not found' });
        }

        res.status(200).json({ success: true, data: car });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};

//@desc     Delete car
//@route    DELETE /api/v1/cars/:id
//@access   Private (Admin)
exports.deleteCar = async (req, res, next) => {
    try {
        const car = await Car.findByIdAndDelete(req.params.id);

        if (!car) {
            return res.status(404).json({ success: false, message: 'Car not found' });
        }

        res.status(200).json({ success: true, message: 'Car deleted successfully' });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};
