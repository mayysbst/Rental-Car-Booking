const express = require('express');
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');
const connectDB = require('./config/db');
const cors = require('cors');
const mongoSanitize = require('express-mongo-sanitize');
const helmet = require('helmet');
const { xss } = require('express-xss-sanitizer');
const rateLimit = require('express-rate-limit');
const hpp = require('hpp');

// Route files
const providers = require('./routes/providers');
const auth = require('./routes/auth');
const bookings = require('./routes/bookings');
const cars = require('./routes/cars');
const users = require('./routes/users');
const dashboard = require('./routes/dashboard');

// Load env vars
dotenv.config({ path: './config/config.env' });

// Connect to database
connectDB();

const app = express();

// Enable CORS
app.use(cors());

// Add body parser
app.use(express.json());

// Sanitize data
app.use(mongoSanitize());

// Set security headers
app.use(helmet());

// Prevent XSS attacks
app.use(xss());

// Rate Limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 500, // Limit each IP to 500 requests per window
    message: 'Too many requests from this IP, please try again later.',
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    // Add some flexibility for development
    skip: (req) => {
        return process.env.NODE_ENV === 'development';
    }
});

// Apply rate limiter to all routes
app.use('/api/', limiter);

// Prevent http param pollution
app.use(hpp());

// Cookie parser
app.use(cookieParser());

// Mount routers
app.use('/api/v1/providers', providers);
app.use('/api/v1/auth', auth);
app.use('/api/v1/bookings', bookings);
app.use('/api/v1/cars', cars);
app.use('/api/v1/users', users);
app.use('/api/v1/dashboard', dashboard);

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`));

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
    console.log(`Error: ${err.message}`);
    server.close(() => process.exit(1));
});
