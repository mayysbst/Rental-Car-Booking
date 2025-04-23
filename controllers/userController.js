const User = require('../models/User');

//@desc     Get current user profile
//@route    GET /api/v1/users/me
//@access   Private/User
exports.getMe = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        res.status(200).json({ success: true, data: user });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};

//@desc     Update user profile
//@route    PUT /api/v1/users/me
//@access   Private/User
exports.updateMe = async (req, res, next) => {
    try {
        const fieldsToUpdate = {
            name: req.body.name,
            telephone: req.body.telephone,
        };

        const user = await User.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
            new: true,
            runValidators: true,
        });

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        res.status(200).json({ success: true, data: user });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};

//@desc     Delete user profile
//@route    DELETE /api/v1/users/me
//@access   Private/User
exports.deleteMe = async (req, res, next) => {
    try {
        await User.findByIdAndDelete(req.user.id);

        res.status(200).json({ success: true, message: 'User deleted successfully' });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};
