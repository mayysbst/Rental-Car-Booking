const Provider = require('../models/Provider');
const Car = require('../models/Car');

//@desc     Get all providers
//@route    GET /api/v1/providers
//@access   Public
exports.getProviders = async (req, res, next) => {
    let query;

    const reqQuery = { ...req.query };
    const removeFields = ['select', 'sort', 'page', 'limit'];

    removeFields.forEach(param => delete reqQuery[param]);

    let queryStr = JSON.stringify(reqQuery);
    queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`);

    query = Provider.find(JSON.parse(queryStr)).populate('cars');

    if (req.query.select) {
        const fields = req.query.select.split(',').join(' ');
        query = query.select(fields);
    }

    if (req.query.sort) {
        const sortBy = req.query.sort.split(',').join(' ');
        query = query.sort(sortBy);
    } else {
        query = query.sort('-createdAt');
    }

    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 25;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;

    try {
        const total = await Provider.countDocuments();
        query = query.skip(startIndex).limit(limit);

        const providers = await query;

        const pagination = {};
        if (endIndex < total) {
            pagination.next = { page: page + 1, limit };
        }
        if (startIndex > 0) {
            pagination.prev = { page: page - 1, limit };
        }

        res.status(200).json({
            success: true,
            count: providers.length,
            data: providers,
            pagination
        });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};

//@desc     Get single provider
//@route    GET /api/v1/providers/:id
//@access   Public
exports.getProvider = async (req, res, next) => {
    try {
        const provider = await Provider.findById(req.params.id).populate('cars');

        if (!provider) {
            return res.status(404).json({ success: false, message: 'Provider not found' });
        }

        res.status(200).json({ success: true, data: provider });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};

//@desc     Create new provider
//@route    POST /api/v1/providers
//@access   Private
exports.createProvider = async (req, res, next) => {
    try {
        const provider = await Provider.create(req.body);
        res.status(201).json({ success: true, data: provider });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};

//@desc     Update provider
//@route    PUT /api/v1/providers/:id
//@access   Private
exports.updateProvider = async (req, res, next) => {
    try {
        const provider = await Provider.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        if (!provider) {
            return res.status(404).json({ success: false, message: 'Provider not found' });
        }

        res.status(200).json({ success: true, data: provider });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};

//@desc     Delete provider and its cars
//@route    DELETE /api/v1/providers/:id
//@access   Private
exports.deleteProvider = async (req, res, next) => {
    try {
        const provider = await Provider.findById(req.params.id);

        if (!provider) {
            return res.status(404).json({ success: false, message: `Provider not found with id of ${req.params.id}` });
        }

        // Delete all cars belonging to this provider
        await Car.deleteMany({ provider: req.params.id });

        await Provider.deleteOne({ _id: req.params.id });

        res.status(200).json({ success: true, message: 'Provider and related cars deleted' });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};

//@desc     Get all providers location (Google Map)
//@route    GET /api/v1/providers/locations
//@access   Public
exports.getProviderLocations = async (req, res, next) => {
    try {
        const providers = await Provider.find().select('name telephone address location');

        res.status(200).json({
            success: true,
            count: providers.length,
            data: providers
        });
    } catch (err) {
        res.status(400).json({
            success: false,
            error: err.message
        });
    }
};
