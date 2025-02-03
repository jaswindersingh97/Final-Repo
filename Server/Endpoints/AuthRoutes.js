const express = require('express');
const router = express.Router();

// Controllers for signup and signin (you'll create these functions)
const { signup, signin } = require('../controllers/authController');

// Route for user signup
router.post('/signup', signup);

// Route for user signin
router.post('/signin', signin);

// Route for users search
module.exports = router;
