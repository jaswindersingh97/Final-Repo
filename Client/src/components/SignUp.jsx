import React, { useState } from 'react';
import styles from './SignUp.module.css';
import authApi from '../api/authApi';

function SignUp() {
  const [user, setUser] = useState({ name: "", email: "", password: "" });
  const [pass, setPass] = useState({ pass: "", confirmpass: "" });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const validateForm = () => {
    if (!user.name || !user.email || !pass.pass || !pass.confirmpass) {
      setError("All fields are required.");
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(user.email)) {
      setError("Invalid email format.");
      return false;
    }
    if (pass.pass !== pass.confirmpass) {
      setError("Passwords do not match.");
      return false;
    }
    return true;
  };

  const submitHandler = async (e) => {
    e.preventDefault();
    setError(""); // Clear previous errors

    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const response = await apiHandler(); // Wait for the API call to finish
      console.log("API Response:", response);
      alert("Sign up successful!");
    } catch (error) {
      if (error.response && error.response.data) {
        // If there's a specific error message from the API, display it
        setError(error.response.data.error || "An error occurred. Please try again.");
      } else {
        setError("An error occurred. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const apiHandler = async () => {
    const endpoints = "/signup";
    try {
      const response = await authApi({
        endpoints,
        user: { ...user, password: pass.pass }, // Assign password here
      });
      return response;
    } catch (error) {
      // Throw the error so it can be caught in submitHandler
      throw error;
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUser((prev) => ({
      ...prev,
      [name]: value,
    }));
    setError(""); // Reset error on input change
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPass((prev) => ({
      ...prev,
      [name]: value,
    }));
    setError(""); // Reset error on input change
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className={styles.container}>
      <form onSubmit={submitHandler}>
        <p>Name:</p>
        <input
          type="text"
          name="name"
          value={user.name}
          onChange={handleInputChange}
          placeholder="Enter your name"
        />

        <p>Email Address:</p>
        <input
          type="email"
          name="email"
          value={user.email}
          onChange={handleInputChange}
          placeholder="Enter your Email"
        />

        <p>Password:</p>
        <div className={styles.passwordContainer}>
          <input
            type={showPassword ? "text" : "password"}
            name="pass"
            value={pass.pass}
            onChange={handlePasswordChange}
            placeholder="Enter your password"
          />
          <button
            type="button"
            onClick={togglePasswordVisibility}
            className={styles.toggleButton}
          >
            {showPassword ? "Hide" : "Show"}
          </button>
        </div>

        <p>Confirm Password:</p>
        <div className={styles.passwordContainer}>
          <input
            type={showPassword ? "text" : "password"}
            name="confirmpass"
            value={pass.confirmpass}
            onChange={handlePasswordChange}
            placeholder="Confirm Password"
          />
          <button
            type="button"
            onClick={togglePasswordVisibility}
            className={styles.toggleButton}
          >
            {showPassword ? "Hide" : "Show"}
          </button>
        </div>

        {error && <p className={styles.error}>{error}</p>} {/* Error message */}

        <button type="submit" disabled={isLoading}>
          {isLoading ? "Signing up..." : "Sign Up"}
        </button>
      </form>
    </div>
  );
}

export default SignUp;
