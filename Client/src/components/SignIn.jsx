import React, { useState } from 'react';
import styles from './Signin.module.css';
import authApi from '../api/authApi';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function SignIn() {
  const navigate = useNavigate();
  const { setToken } = useAuth();
  const [user, setUser] = useState({
    email: "",
    password: ""
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const changeHandler = (e) => {
    const { name, value } = e.target;
    setUser((prevData) => ({
      ...prevData,
      [name]: value
    }));
    setError(""); // Reset error on input change
  };

  const apiHandler = async () => {
    const endpoints = "/signin";
    try {
      const response = await authApi({ endpoints, user });
      return response;
    } catch (error) {
      if (error.response && error.response.data) {
        throw new Error(error.response.data.error || "Invalid login credentials");
      }
      throw new Error("An error occurred while logging in. Please try again.");
    }
  };

  const validateForm = () => {
    if (!user.email || !user.password) {
      setError("Both fields are required.");
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(user.email)) {
      setError("Invalid email format.");
      return false;
    }
    return true;
  };

  const submitHandler = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const { token, id } = await apiHandler(); // Wait for the API call
      console.log("Submit Response:", token);
      localStorage.setItem("token", token);
      localStorage.setItem("id", id);
      setToken(token); // Update the token in context
      navigate("/chatPage");
    } catch (error) {
      setError(error.message); // Set error message if API fails
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <form onSubmit={submitHandler}>
        <p>Email Address:</p>
        <input 
          type='email'
          name='email'
          value={user.email}
          onChange={changeHandler}
          placeholder='Enter your Email Address'
        />
        <p>Password:</p>
        <input 
          type='password'
          name='password'
          value={user.password}
          onChange={changeHandler}
          placeholder='Password'
        />
        {error && <p className={styles.error}>{error}</p>} {/* Display error messages */}
        <button type="submit" disabled={isLoading}>
          {isLoading ? "Logging in..." : "Login"}
        </button>
      </form>
    </div>
  );
}

export default SignIn;
