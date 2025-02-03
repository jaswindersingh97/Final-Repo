const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';

// Controller for user signup
const signup = async (req, res) => {
    const { name, email, password } = req.body;
    
    // Validate input data
    if (!name || !email || !password) {
        return res.status(400).json({ error: 'Please provide all required fields' });
    }

    try {
        // Check if the user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ error: 'User already exists with this email' });
        }

        // Hash password before storing it
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create a new user
        const newUser = new User({
            name,
            email,
            password: hashedPassword,
        });

        // Save the user in the database
        await newUser.save();

        res.status(201).json({ message: 'User signed up successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error signing up user', details: error.message });
    }
};

// Controller for user signin with JWT
const signin = async (req, res) => {
    const { email, password } = req.body;

    // Validate input data
    if (!email || !password) {
        return res.status(400).json({ error: 'Please provide both email and password' });
    }

    try {
        // Find the user by email and include the password in the query
        const user = await User.findOne({ email }).select('+password');

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Compare the password with the hashed password stored in the database
        const isMatch = await bcrypt.compare(password, user.password);
        
        if (!isMatch) {
            return res.status(400).json({ error: 'Invalid credentials' });
        }

        // Generate a JWT token if the credentials are valid
        const token = jwt.sign(
            { _id: user._id, userName: user.name, email: user.email },  // Payload data
            JWT_SECRET,  // Secret key
            { expiresIn: '24h' }  // Token expiration time
        );

        // Send back the token and user details
        res.status(200).json({ 
            message: 'User signed in successfully', 
            token: "Bearer " + token,   // Send the JWT token to the client
            id: user._id
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error signing in user', details: error.message });
    }
};

module.exports = { signup, signin };
