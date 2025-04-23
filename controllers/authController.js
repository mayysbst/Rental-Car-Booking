const User = require('../models/User');

//@desc     Register user
//@route    POST /api/v1/auth/register
//@access   Public
exports.register = async (req, res, next) => {
    try {
        const { name, telephone, email, password } = req.body;

        const user = await User.create({
            name,
            telephone,
            email,
            password,
        });

        sendTokenResponse(user, 200, res);

    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};

//@desc     Login user
//@route    POST /api/v1/auth/login
//@access   Public
exports.login = async (req, res, next) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }

    const user = await User.findOne({ email }).select('+password');

    if (!user) {
        return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
        return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    sendTokenResponse(user, 200, res);
};

//@desc     Get current logged in user
//@route    GET /api/v1/auth/me
//@access   Private
exports.getMe = async (req, res, next) => {
    const user = await User.findById(req.user.id);

    res.status(200).json({ success: true, data: user });
};

//@desc     Logout user
//@route    GET /api/v1/auth/logout
//@access   Private
exports.logout = (req, res, next) => {
    res.cookie('token', 'none', {
        expires: new Date(Date.now() + 10 * 1000),
        httpOnly: true,
    });

    res.status(200).json({ success: true, message: 'User logged out successfully' });
};

//@desc     Forgot password
//@route    POST /api/v1/auth/forgotpassword
//@access   Public
exports.forgotPassword = async (req, res, next) => {
    const user = await User.findOne({ email: req.body.email });

    if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Simulate sending email
    res.status(200).json({ success: true, message: 'Email sent with password reset instructions' });
};

//@desc     Reset password
//@route    PUT /api/v1/auth/resetpassword/:id
//@access   Public
exports.resetPassword = async (req, res, next) => {
    const user = await User.findById(req.params.id);

    if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
    }

    user.password = req.body.password;
    await user.save();

    sendTokenResponse(user, 200, res);
};

// Send Token Function
const sendTokenResponse = (user, statusCode, res) => {
    const token = user.getSignedJwtToken();

    const options = {
        expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000),
        httpOnly: true,
    };

    if (process.env.NODE_ENV === 'production') {
        options.secure = true;
    }

    res.status(statusCode).json({
        success: true,
        _id: user._id,
        name: user.name,
        telephone: user.telephone,
        email: user.email,
        role: user.role, // <---- เพิ่มบรรทัดนี้ สำคัญมาก!
        token,
    });
};
