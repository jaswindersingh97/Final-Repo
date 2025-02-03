import React from 'react';
import { Navigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode'; // Named import for jwt-decode

const ProtectedRoute = ({ element: Component }) => {
  const token = localStorage.getItem('token');

  if (!token) {
    return <Navigate to="/" />;
  }

  try {
    // Decode the token to check for expiration
    const decodedToken = jwtDecode(token);

    // Check if the token is expired (exp is in seconds, Date.now() is in milliseconds)
    if (decodedToken.exp * 1000 < Date.now()) {
      localStorage.removeItem('token'); // Optionally clear the expired token
      localStorage.removeItem('id');
      return <Navigate to="/" />;
    }

    // If the token is valid, render the protected component
    return <Component />;
  } catch (error) {
    // Handle any errors from decoding the token (e.g., invalid format)
    return <Navigate to="/" />;
  }
};

export default ProtectedRoute;
