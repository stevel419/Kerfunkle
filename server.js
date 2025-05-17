require('dotenv').config();

// Environment variable validation
const requiredEnvVars = [
    'STRIPE_SECRET_KEY', 
    'DB_URI', 
    'JWT_SECRET', 
    'EMAIL_USER', 
    'EMAIL_PASS',
    'NODE_ENV',
    'ALLOWED_ORIGINS'
];
requiredEnvVars.forEach(envVar => {
    if (!process.env[envVar]) {
        console.error(`Missing required environment variable: ${envVar}`);
        process.exit(1);
    }
});

// Express setup
const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

// Security packages
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const { body, validationResult } = require('express-validator');

// Service dependencies
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const nodemailer = require('nodemailer');
const mongoose = require('mongoose');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET;

// Logging
const winston = require('winston');
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
  ],
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple(),
  }));
}

// Global error handler middleware
const errorHandler = (err, req, res, next) => {
  logger.error({
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method
  });
  
  if (process.env.NODE_ENV === 'production') {
    return res.status(500).json({ message: 'Internal server error' });
  } else {
    return res.status(500).json({ 
      message: err.message,
      stack: err.stack 
    });
  }
};

// Security middleware
const allowedOrigins = process.env.ALLOWED_ORIGINS.split(',');

app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (mobile apps, curl, etc.)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) === -1) {
      return callback(new Error('Not allowed by CORS'), false);
    }
    return callback(null, true);
  },
  credentials: true
}));

// Content Security Policy setup
app.use(helmet());
app.use(helmet.contentSecurityPolicy({
  directives: {
    defaultSrc: ["'self'"],
    scriptSrc: ["'self'", "js.stripe.com"],
    styleSrc: ["'self'", "'unsafe-inline'"],
    imgSrc: ["'self'", "data:", "*.stripe.com"],
    connectSrc: ["'self'", "api.stripe.com"],
    frameSrc: ["'self'", "js.stripe.com", "hooks.stripe.com"],
    fontSrc: ["'self'"]
  }
}));

// Anti-brute force protections
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, message: 'Too many requests, please try again later.' }
});

const loginLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 10, // limit each IP to 10 login attempts per hour
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, message: 'Too many login attempts, please try again later.' }
});

app.use(express.json({ limit: '10kb' })); // Limit payload size
app.use(mongoSanitize()); // Prevent NoSQL injection
app.use('/api', apiLimiter); // Apply rate limiting to all API routes

//Connect to MongoDB
mongoose.connect(process.env.DB_URI, { 
    serverApi: { version: '1', strict: true, deprecationErrors: true },
    connectTimeoutMS: 5000
})
.then(() => logger.info("Connected to MongoDB"))
.catch(err => {
    logger.error("MongoDB connection error:", err);
    process.exit(1);
});

//Define mongoose schema
const userSchema = new mongoose.Schema({
    email: { 
      type: String, 
      required: true, 
      unique: true,
      trim: true,
      lowercase: true,
    },
    code: { type: String, required: true },
    codeExpiration: { type: Date, required: true },
    createdAt: { type: Date, default: Date.now },
    lastLogin: { type: Date },
    loginAttempts: { type: Number, default: 0 }
});
  
const cartSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    items: [
      {
        priceId: { type: String, required: true },
        prodNum: { type: String, required: true },
        imgsrc: { type: String, required: true },
        prodName: { type: String, required: true },
        prodPrice: { type: String, required: true },
        quantity: { type: Number, required: true, min: 1 },
      },
    ],
    updatedAt: { type: Date, default: Date.now }
});
// Expire carts after 30 days of inactivity
cartSchema.index({ updatedAt: 1 }, { expireAfterSeconds: 30 * 24 * 60 * 60 });
// Schema methods
userSchema.methods.generateCode = function() {
    this.code = crypto.randomInt(0, 1000000).toString().padStart(6, '0');
    this.codeExpiration = Date.now() + 15 * 60 * 1000; // 15 minutes
    return this.code;
};

userSchema.methods.isValidCode = function(code) {
    return this.code === code && Date.now() < this.codeExpiration;
};
  
userSchema.methods.incrementLoginAttempts = function() {
    this.loginAttempts += 1;
    return this.save();
};
  
userSchema.methods.resetLoginAttempts = function() {
    this.loginAttempts = 0;
    this.lastLogin = Date.now();
    return this.save();
};

// Create models
const User = mongoose.model('User', userSchema);
const Cart = mongoose.model('Cart', cartSchema);

// Send login code via email
const sendLoginCode = async (email, code) => {
    try {
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            }
        });
      
        await transporter.verify(); // Verify connection configuration
      
        const info = await transporter.sendMail({
            from: '"Kerfunkle" <no-reply@kerfukle.com>',
            to: email,
            subject: `${code} is your login code`,
            text: `Your login code: ${code}\nThis code can only be used once. It expires in 15 minutes.`,
            html: `<div style="font-family: Arial, sans-serif; max-width: 600px;">
            <h2>Your login code</h2>
            <p style="font-size: 24px; font-weight: bold;">${code}</p>
            <p>This code can only be used once and will expire in 15 minutes.</p>
            <p>If you didn't request this code, you can safely ignore this email.</p>
            </div>`
        });
      
        logger.info(`Login code sent to ${email}`);
        return true;
    } catch (e) {
        logger.error('Email sending error:', e);
        throw new Error('Failed to send login code');
    }
};

// Route to send login code
app.post('/api/send-login-code', loginLimiter, 
    [
        body('email').isEmail().withMessage('Please provide a valid email').normalizeEmail()
    ], async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
          return res.status(400).json({ success: false, errors: errors.array() });
        }
        
        const { email } = req.body;
        
        let user = await User.findOne({ email });
        if (!user) {
          user = new User({ email });
        }
        
        const code = user.generateCode();
        await user.save();
        
        const emailSent = await sendLoginCode(email, code);
        
        if (!emailSent) {
          return res.status(500).json({ success: false, message: 'Failed to send login code' });
        }
        
        res.json({ success: true });
    } catch (error) {
        next(error);
    }
});

// Route to verify login code
app.post('/api/verify-login-code', loginLimiter,
    [
        body('email').isEmail().withMessage('Please provide a valid email').normalizeEmail(),
        body('code').isLength({ min: 6, max: 6 }).withMessage('Code must be 6 characters')
    ], async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
          return res.status(400).json({ success: false, errors: errors.array() });
        }
        
        const { email, code } = req.body;
        
        const user = await User.findOne({ email });
        if (!user) {
          return res.status(404).json({ success: false, message: 'User not found' });
        }
        
        await user.incrementLoginAttempts();
        
        if (user.loginAttempts > 5) {
          return res.status(429).json({ 
            success: false, 
            message: 'Too many failed attempts. Please request a new code.' 
          });
        }
        
        if (!user.isValidCode(code)) {
          return res.status(400).json({ success: false, message: 'Invalid or expired code' });
        }
        
        // Reset login attempts and update last login time
        await user.resetLoginAttempts();
        
        // Generate token with appropriate options
        const token = jwt.sign({ email: user.email, userId: user._id }, JWT_SECRET, { expiresIn: '2h', issuer: 'kerfunkle-shop'});
        
        res.json({ 
          success: true, 
          token,
          expiresIn: 7200 // 2 hours
        });
    } catch (error) {
        next(error);
    }
});  

// Middleware to authenticate JWT
const authenticateJWT = (req, res, next) => {
    try {
        const authHeader = req.header('Authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ success: false, message: 'Access denied. No token provided.' });
        }
      
        const token = authHeader.split(' ')[1];
      
        jwt.verify(token, JWT_SECRET, (err, user) => {
            if (err) {
                if (err.name === 'TokenExpiredError') {
                    return res.status(401).json({ success: false, message: 'Token expired' });
                }
                return res.status(403).json({ success: false, message: 'Invalid token' });
            }
            req.user = user;
            next();
        });
    } catch (error) {
        logger.error('JWT authentication error:', error);
        return res.status(500).json({ success: false, message: 'Authentication error' });
    }
};

// Add to cart for users
app.post('/api/add-to-cart', authenticateJWT,
    [
        body('priceId').notEmpty().withMessage('Price ID is required'),
        body('prodNum').notEmpty().withMessage('Product number is required'),
        body('imgsrc').notEmpty().withMessage('Image source is required'),
        body('prodName').notEmpty().withMessage('Product name is required'),
        body('prodPrice').notEmpty().withMessage('Product price is required'),
        body('quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1')
    ], async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ success: false, errors: errors.array() });
        }
        
        const userId = req.user.userId;
        const { priceId, prodNum, imgsrc, prodName, prodPrice, quantity } = req.body;
        
        let cart = await Cart.findOne({ userId });
        
        if (!cart) {
            cart = new Cart({ userId, items: [] });
        }
        
        const itemIndex = cart.items.findIndex(item => item.priceId === priceId);
        
        if (itemIndex >= 0) {
            cart.items[itemIndex].quantity += quantity;
        } else {
            cart.items.push({ priceId, prodNum, imgsrc, prodName, prodPrice, quantity });
        }
        
        cart.updatedAt = Date.now();
        await cart.save();
        
        res.json({ success: true, cartItemCount: cart.items.length });
    } catch (error) {
        next(error);
    }
});

// Update cart info for users
app.post('/api/update-cart', authenticateJWT,
    [
        body('cartItems').isArray().withMessage('Cart items must be an array')
    ], async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ success: false, errors: errors.array() });
        }
        
        const userId = req.user.userId;
        const { cartItems } = req.body;
        
        let cart = await Cart.findOne({ userId });
        
        if (!cart) {
            cart = new Cart({ userId, items: [] });
        }
        
        if (cartItems.length !== 0) {
            cartItems.forEach(item => {
                if (!cart.items.find(i => i.prodNum === item.prodNum)) {
                    cart.items.push(item);
                }
            });
        }
        
        cart.updatedAt = Date.now();
        await cart.save();
        
        res.json({ success: true, cart: cart.items });
    } catch (error) {
        next(error);
    }
});

// Update DB info for users
app.post('/api/update-DB', authenticateJWT,
    [
        body('cartItems').isArray().withMessage('Cart items must be an array')
    ], async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
          return res.status(400).json({ success: false, errors: errors.array() });
        }
        
        const userId = req.user.userId;
        const { cartItems } = req.body;
        
        let cart = await Cart.findOne({ userId });
        
        if (!cart) {
            return res.status(404).json({ success: false, message: 'Cart not found' });
        }
        
        cart.items = cartItems;
        cart.updatedAt = Date.now();
        await cart.save();
        
        res.json({ success: true });
    } catch (error) {
        next(error);
    }
});

// Create stripe checkout
app.post('/create-checkout-session',
    [
        body('cartItems').isArray().notEmpty().withMessage('Cart items are required')
    ], async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ success: false, errors: errors.array() });
        }
        
        const { cartItems } = req.body;
        
        if (!cartItems || cartItems.length === 0) {
            return res.status(400).json({ success: false, message: "Cart is empty" });
        }
        
        const session = await stripe.checkout.sessions.create({
            ui_mode: 'embedded',
            line_items: cartItems,
            mode: 'payment',
            billing_address_collection: 'auto',
            shipping_address_collection: {
                allowed_countries: [
                    'US', 'CA', 'MX', 'AU', 'GB', 'DE', 'FR', 'IT', 'JP', 'SG', 'KR',
                    'BR', 'NL', 'NZ'
                ],
                //'AL', 'DZ', 'AD', 'AR', 'AM', 'AW', 'AU', 'AT', 'BD', 
                //'BB', 'BY', 'BZ', 'BR', 'BG', 'KH', 'CL', 'CN', 'CO', 'CR', 'DO', 
                //'EC', 'EG', 'SV', 'EE', 'FJ', 'FI', 'FR', 'DE', 'GH', 'GI', 'GT', 'HN', 
                //'HK', 'IN', 'ID', 'IL', 'IT', 'JM', 'JP', 'JO', 'KZ', 'KE', 'LY', 'LT', 
                //'LU', 'MY', 'MT', 'FM', 'MC', 'MA', 'NL', 'NC', 'NZ', 'NG', 'OM', 'PK', 
                //'PA', 'PE', 'PH', 'KN', 'MF', 'SA', 'RS', 'SG', 'SK', 'SI', 'ZA', 'KR', 
                //'ES', 'LK', 'TZ', 'TW', 'TH', 'TT', 'TN', 'UG', 'VE', 'ZW'],
            },
            return_url: `${process.env.FRONTEND_URL}/return.html?session_id={CHECKOUT_SESSION_ID}`
        });
        
        res.json({ success: true, clientSecret: session.client_secret });
    } catch (error) {
        logger.error('Stripe checkout error:', error);
        res.status(400).json({ success: false, message: error.message || 'Error creating checkout session' });
    }
});

// Redirect to return page
app.get('/session-status', async (req, res, next) => {
    try {
        if (!req.query.session_id) {
            return res.status(400).json({ success: false, message: 'Session ID is required' });
        }
      
        const session = await stripe.checkout.sessions.retrieve(req.query.session_id);
      
        res.json({
            success: true,
            status: session.status,
            customer_email: session.customer_details.email
        });
    } catch (error) {
        logger.error('Stripe session status error:', error);
        res.status(400).json({ success: false, message: error.message || 'Error retrieving session status' });
    }
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'UP' });
});

// Apply global error handler
app.use(errorHandler);

// Graceful shutdown function
process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

function gracefulShutdown() {
    logger.info('Received shutdown signal, closing connections...');
  
    setTimeout(() => {
        logger.error('Could not close connections in time, forcefully shutting down');
        process.exit(1);
    }, 10000);
  
    server.close(() => {
        logger.info('HTTP server closed');
    
        mongoose.connection.close(false, () => {
            logger.info('MongoDB connection closed');
            process.exit(0);
        });
    });
}

// Start server
const server = app.listen(port, () => {
    logger.info(`Server running on port ${port} in ${process.env.NODE_ENV} mode`);
});