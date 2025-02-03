const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';  // You should store this in a secure place, like environment variables

// Middleware function to authorize users
const authorize = (req, res, next) => {
  const authHeader = req.header('Authorization');

  // Check if the Authorization header is present
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Access Denied. No token provided.' });
  }

  // Extract the token from the Authorization header
  const token = authHeader.split(' ')[1];

  try {
    // Verify the token (assuming secretKey is your secret used to sign the token)
    const decoded = jwt.verify(token, JWT_SECRET);
    // Attach the decoded user to the request object
    req.user = decoded;

    // Proceed to the next middleware/route
    next();
  } catch (error) {
    return res.status(400).json({ message: 'Invalid Token' });
  }
};

module.exports = authorize;
