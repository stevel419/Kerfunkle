require('dotenv').config();
//set up express
const express = require('express');
const app = express();
//set up stripe
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
//set up port
const port = process.env.port || 3000;
//set up cross origins 
const cors = require('cors');
//set up nodemailer
const nodemailer = require('nodemailer');
//set up mongoose
const mongoose = require('mongoose');
//set up crypto
const crypto = require('crypto');
//set up jwt
const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET;

//RECONFIGURE BEFORE PRODUCTION
app.use(cors());
app.use(express.json());

//Connect to MongoDB
try {
    mongoose.connect(process.env.DB_URI, { serverApi: { version: '1', strict: true, deprecationErrors: true } });
    console.log("Connected to MongoDB");
} catch (e) {
    console.error(e);
}

//Define mongoose schema
const userSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    code: { type: String, required: true },
    codeExpiration: { type: Date, required: true },
    createdAt: { type: Date, default: Date.now },
});
const User = mongoose.model('User', userSchema);

const cartSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    items: [
        {
            priceId: { type: String, required: true },
            prodNum: { type: String, required: true },
            imgsrc: { type: String, required: true },
            prodName: { type: String, required: true },
            prodPrice: { type: String, required: true },
            quantity: { type: Number, required: true },
        },
    ],
});
const Cart = mongoose.model('Cart', cartSchema);

//Send login code via email
const sendLoginCode = async (email, code) => {
    let transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        }
    });
    let info = await transporter.sendMail({
        from: 'Kerfunkle',
        to: email,
        subject: code + ' is your login code',
        text: 'Your login code: ' + code + '\nThis code can only be used once. It expires in 15 minutes.',
    });
    console.log("Message sent!");
};

//Route to send login code
app.post('/send-login-code', async (req, res) => {
    const { email } = req.body;

    let user = await User.findOne({ email });
    if (!user) {
        user = new User({
            email,
            code: crypto.randomInt(0, 1000000).toString().padStart(6, '0'),
            codeExpiration: Date.now() + 15 * 60 * 1000,
        });
        await user.save();
    }
    else {
        user.code = crypto.randomInt(0, 1000000).toString().padStart(6, '0');
        user.codeExpiration = Date.now() + 15 * 60 * 1000;
        await user.save();
    }

    try {
        await sendLoginCode(email, user.code);
        res.send({ success: true });
    } catch (e) {
        res.send({ success: false });
    }
});

//Route to verify login code
app.post('/verify-login-code', async(req, res) => {
    const { email, code } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
        return res.status(404).send({ message: 'User not found.' });
    }
    else {
        if (user.code === code && Date.now() < user.codeExpiration) {
            const token = jwt.sign({ email: user.email, userId: user._id }, JWT_SECRET, { expiresIn: '2h' });
            res.send({ success: true, token });
        } 
        else {
            res.send({ success: false });
        }
    }
});

//Middleware to authenticate JWT
const authenticateJWT = (req, res, next) => {
    const token = req.header('Authorization')?.split(' ')[1];

    if (!token) {
        return res.status(404).send({ message: 'Access denied. No token provided.' });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(404).send({ message: 'Invalid token.' });
        }
        req.user = user;
        next();
    });
}

//Add to cart for users
app.post('/add-to-cart', authenticateJWT, async (req, res) => {
    const userId = req.user.userId;
    const { priceId, prodNum, imgsrc, prodName, prodPrice, quantity } = req.body;

    let cart = await Cart.findOne({ userId });

    if (!cart) {
        return res.status(404).send({ message: 'Cart not found' });
    }

    const itemIndex = cart.items.findIndex(item => item.priceId === priceId);

    if (itemIndex >= 0) {
        cart.items[itemIndex].quantity += quantity;
    }
    else {
        cart.items.push({ priceId, prodNum, imgsrc, prodName, prodPrice, quantity });
    }
    await cart.save();

    res.send( { success: true } );
});

//Update cart info for users
app.post('/update-cart', authenticateJWT, async (req, res) => {
    const userId = req.user.userId;
    const { cartItems } = req.body;
    
    let cart = await Cart.findOne({ userId });
    
    if (!cart) {
        cart = new Cart({ userId, items: [] });
    }
    if (cartItems.length !== 0) {
        cartItems.forEach(item => {
            if (!(cart.items.find(i => i.prodNum === item.prodNum))) {
                cart.items.push(item);
            }
        });
    }
    await cart.save();

    res.send({ cart: cart.items });
});

//Update DB info for users
app.post('/update-DB', authenticateJWT, async (req, res) => {
    const userId = req.user.userId;
    const { cartItems } = req.body;

    let cart = await Cart.findOne({ userId });

    if (!cart) {
        return res.status(404).send({ message: 'Cart not found' });
    }
    cart.items = cartItems;

    await cart.save();

    res.send({ success: true });
});

//Create stripe checkout
app.post('/create-checkout-session', async (req, res) => {
    try {
        const { cartItems } = req.body;

        if (!cartItems || cartItems.length === 0) {
            return res.status(400).send({ error: "Cart is empty" });
        }

        const session = await stripe.checkout.sessions.create({
            ui_mode: 'embedded',
            line_items: cartItems,
            mode: 'payment',
            billing_address_collection: 'auto',
            shipping_address_collection: {
                allowed_countries: [ 'US', 'CA', 'MX', 'AU', 'GB', 'DE', 'FR', 'IT', 'JP', 'SG', 'KR',
                    'BR', 'NL', 'NZ'],
                    //'AL', 'DZ', 'AD', 'AR', 'AM', 'AW', 'AU', 'AT', 'BD', 
                    //'BB', 'BY', 'BZ', 'BR', 'BG', 'KH', 'CL', 'CN', 'CO', 'CR', 'DO', 
                    //'EC', 'EG', 'SV', 'EE', 'FJ', 'FI', 'FR', 'DE', 'GH', 'GI', 'GT', 'HN', 
                    //'HK', 'IN', 'ID', 'IL', 'IT', 'JM', 'JP', 'JO', 'KZ', 'KE', 'LY', 'LT', 
                    //'LU', 'MY', 'MT', 'FM', 'MC', 'MA', 'NL', 'NC', 'NZ', 'NG', 'OM', 'PK', 
                    //'PA', 'PE', 'PH', 'KN', 'MF', 'SA', 'RS', 'SG', 'SK', 'SI', 'ZA', 'KR', 
                    //'ES', 'LK', 'TZ', 'TW', 'TH', 'TT', 'TN', 'UG', 'VE', 'ZW'],
            },
            //RECONFIGURE BEFORE PRODUCTION - https://www.yourdomain.com/return.html?session_id={CHECKOUT_SESSION_ID}
            return_url: 'http://localhost:5500/frontend/return.html?session_id={CHECKOUT_SESSION_ID}'
        });
        
        res.send({ clientSecret: session.client_secret });
    } catch(e) {
        res.status(500).send({error: e.message});
    }
});

//Redirect to return page
app.get('/session-status', async (req, res) => {
    const session = await stripe.checkout.sessions.retrieve(req.query.session_id);
      
    res.send({
        status: session.status,
        customer_email: session.customer_details.email
    });
});
    
app.listen(port, () => {
    console.log('Running on port ' + port);
});