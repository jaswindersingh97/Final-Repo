import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import HomePage from './pages/HomePage';
import ChatPage from './pages/ChatPage';
import { AuthProvider, useAuth } from './context/AuthContext';

const ProtectedRoute = ({ element: Component }) => {
  const { isTokenValid } = useAuth();
  return isTokenValid() ? <Component /> : <Navigate to="/" />;
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Redirect signed-in users to ChatPage if they try to access HomePage */}
          <Route 
            path="/" 
            element={<AuthRedirect />} 
          />
          {/* Protect ChatPage route */}
          <Route 
            path="/chatPage" 
            element={<ProtectedRoute element={ChatPage} />} 
          />
          {/* Optionally handle unknown routes */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

const AuthRedirect = () => {
  const { isTokenValid } = useAuth();
  return isTokenValid() ? <Navigate to="/chatPage" /> : <HomePage />;
};

export default App;
