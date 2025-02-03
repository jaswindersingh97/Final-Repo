const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: { // to save the name
        type: String,
        required: true,
        trim: true, // Removes any leading or trailing whitespaces
    },
    email: { // to save the unique email id
        type: String,
        required: true,
        unique: true, // Ensures no duplicate emails
        trim: true,
        lowercase: true, // Converts the email to lowercase
    },
    password: { // To save the hashed password
        select: false,
        type: String,
        required: true,
    },
    isActive: {  // To track if user is online
        type: Boolean,
        default: false 
    },
    lastActive: { // To track the last time user was online
         type: Date
    },
    createdAt: {
        type: Date,
        default: Date.now, // Automatically sets the current date
    }
});

// Create a Mongoose model from the schema
const User = mongoose.model('User', userSchema);

module.exports = User;
