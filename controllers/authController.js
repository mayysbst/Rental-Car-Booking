const User = require('../models/User');
const sendEmail = require('../utils/sendEmail');
const crypto = require('crypto');

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
    try{
        const {email, password} = req.body;
        
        //Validate email & password
        if(!email || !password){
            return res.status(400).json({success:false, error:'Please provide email and password'});
        }
        
        //Check for user
        const user = await User.findOne({email}).select('+password');
        
        if(!user){
            return res.status(400).json({success:false, error:'Invalid credentials'});
        }
        
        //Check if password matches
        const isMatch = await user.matchPassword(password);
        
        if(!isMatch){
            return res.status(401).json({success:false, error:'Invalid credentials'});
        }
        
        //Create token
        //const token = user.getSignedJwtToken();
        //res.status(200).json({success:true, token});
        sendTokenResponse(user, 200, res);
    }catch(err){
        res.status(401).json({success:false, msg:'Cannot convert email or password to string'});
    }
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
exports.forgotPassword = async (req, res) => {
    let user; // Declare user variable in outer scope

    try {
        user = await User.findOne({ email: req.body.email });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Generate reset token
        const resetToken = user.getResetPasswordToken(); // Use the model method

        // Save the user with the reset token
        await user.save({ validateBeforeSave: false });

        // Create reset url
        const resetUrl = `http://localhost:5173/reset-password/${resetToken}`;

        const message = `You are receiving this email because you has requested the reset of a password. Please click on the following link to reset your password: \n\n ${resetUrl}`;

        await sendEmail({
            email: user.email,
            subject: 'Reset Your Password',
            message: message
        });

        res.status(200).json({
            success: true,
            message: 'Email sent'
        });

    } catch (err) {
        console.error('Forgot password error:', err);

        if (user) {
            // Reset user fields
            user.resetPasswordToken = undefined;
            user.resetPasswordExpire = undefined;
            await user.save({ validateBeforeSave: false });
        }

        return res.status(500).json({
            success: false,
            message: 'Email could not be sent'
        });
    }
};

//@desc     Reset password
//@route    PUT /api/v1/auth/resetpassword/:id
//@access   Public
exports.resetPassword = async (req, res, next) => {
    try {
        // Log the received token
        console.log('Received reset token:', req.params.resetToken);

        // Get hashed token
        const resetPasswordToken = crypto
            .createHash('sha256')
            .update(req.params.resetToken)
            .digest('hex');
            
        // Log the hashed token
        console.log('Hashed token:', resetPasswordToken);

        const user = await User.findOne({
            resetPasswordToken,
            resetPasswordExpire: { $gt: Date.now() }
        });

        // Log user search result
        console.log('Found user:', user ? 'Yes' : 'No');
        if (user) {
            console.log('Token expiry:', user.resetPasswordExpire);
            console.log('Current time:', new Date());
        }

        if (!user) {
            return res.status(400).json({
                success: false,
                message: 'Invalid or expired reset token'
            });
        }

        // Set new password
        user.password = req.body.password;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;

        await user.save();

        sendTokenResponse(user, 200, res);
    } catch (err) {
        console.error('Reset password error:', err);
        res.status(500).json({
            success: false,
            message: 'Could not reset password',
            error: err.message
        });
    }
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

    res.status(statusCode).cookie('token', token, options).json({
        success: true,
        _id: user._id,
        name: user.name,
        telephone: user.telephone,
        email: user.email,
        role: user.role,
        token: token
    });
}