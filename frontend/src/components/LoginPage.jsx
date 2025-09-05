import React, { useState } from "react";
import axios from 'axios';

/**
 * LoginPage component - handles user authentication
 * Uses axios instead of fetch for HTTP requests
 * Provides form validation and error handling
 */
export default function LoginPage() {
  // State to store form input values (username and password)
  const [form, setForm] = useState({ 
    username: "", 
    password: "" 
  });
  
  // State to store and display error messages to user
  const [error, setError] = useState("");
  
  // State to show loading status during API calls
  const [loading, setLoading] = useState(false);

  /**
   * Handles input field changes for both username and password
   * Updates the form state dynamically based on input name attribute
   * @param {Event} e - Input change event
   */
  const handleChange = (e) => {
    setForm({ 
      ...form, 
      [e.target.name]: e.target.value 
    });
  };

  /**
   * Handles login form submission
   * Sends POST request to backend login API using axios
   * Shows success message or error based on response
   * @param {Event} e - Form submit event
   */
  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent default form submission behavior
    setError(""); // Clear any existing error messages
    setLoading(true); // Show loading state
    
    try {
      // Send POST request using axios with form data
      const response = await axios.post("https://sample-login-sz4w.onrender.com/api/login", form, {
        headers: {
          "Content-Type": "application/json"
        },
        timeout: 10000 // 10 second timeout
      });
      
      // Show success message on successful login
      alert(response.data.message);
      
      // Optionally clear form after successful login
      setForm({ username: "", password: "" });
      
    } catch (error) {
      // Handle different types of errors
      if (error.response) {
        // Server responded with error status
        setError(error.response.data.error || "Login failed");
      } else if (error.request) {
        // Request was made but no response received
        setError("No response from server. Please check your connection.");
      } else {
        // Something else happened
        setError("An unexpected error occurred");
      }
    } finally {
      setLoading(false); // Hide loading state
    }
  };

  // Render login form UI
  return (
    <div className="login-container">
      <h2>Login</h2>
      <form onSubmit={handleSubmit} className="login-form">
        <div className="form-group">
          <input
            type="text"
            name="username"
            value={form.username}
            onChange={handleChange}
            placeholder="Enter your username"
            required
            disabled={loading}
          />
        </div>
        
        <div className="form-group">
          <input
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            placeholder="Enter your password"
            required
            disabled={loading}
          />
        </div>
        
        <button type="submit" disabled={loading}>
          {loading ? "Logging in..." : "Login"}
        </button>
        
        {/* Display error message if exists */}
        {error && <p className="error-message">{error}</p>}
      </form>
    </div>
  );
}
