import React, { useState } from "react";
import axios from 'axios';

/**
 * SignupPage component - handles user registration
 * Collects user's name, username, and password
 * Validates input and communicates with backend API
 */
export default function SignupPage() {
  // State to store form input values (name, username, password)
  const [form, setForm] = useState({ 
    name: "", 
    username: "", 
    password: "" 
  });
  
  // State to store and display error messages
  const [error, setError] = useState("");
  
  // State to show loading status during API calls
  const [loading, setLoading] = useState(false);
  
  // State to show success message
  const [success, setSuccess] = useState("");

  /**
   * Handles input field changes for name, username, and password
   * Updates the form state dynamically based on input name attribute
   * @param {Event} e - Input change event
   */
  const handleChange = (e) => {
    setForm({ 
      ...form, 
      [e.target.name]: e.target.value 
    });
    
    // Clear error and success messages when user starts typing
    if (error) setError("");
    if (success) setSuccess("");
  };

  /**
   * Validates form data before submission
   * Checks for required fields and basic password requirements
   * @returns {boolean} - True if form is valid, false otherwise
   */
  const validateForm = () => {
    if (!form.name.trim()) {
      setError("Name is required");
      return false;
    }
    
    if (!form.username.trim()) {
      setError("Username is required");
      return false;
    }
    
    if (form.username.length < 3) {
      setError("Username must be at least 3 characters long");
      return false;
    }
    
    if (!form.password) {
      setError("Password is required");
      return false;
    }
    
    if (form.password.length < 6) {
      setError("Password must be at least 6 characters long");
      return false;
    }
    
    return true;
  };

  /**
   * Handles signup form submission
   * Validates form data and sends POST request to backend signup API
   * Shows success message or error based on response
   * @param {Event} e - Form submit event
   */
  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent default form submission behavior
    
    // Validate form before making API call
    if (!validateForm()) {
      return;
    }
    
    setLoading(true); // Show loading state
    
    try {
      // Send POST request using axios with form data
      const response = await axios.post("https://sample-login-sz4w.onrender.com/api/signup", form, {
        headers: {
          "Content-Type": "application/json"
        },
        timeout: 10000 // 10 second timeout
      });
      
      // Show success message
      setSuccess(response.data.message);
      
      // Clear form after successful signup
      setForm({ name: "", username: "", password: "" });
      
    } catch (error) {
      // Handle different types of errors
      if (error.response) {
        // Server responded with error status
        setError(error.response.data.error || "Signup failed");
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

  // Render signup form UI
  return (
    <div className="signup-container">
      <h2>Sign Up</h2>
      <form onSubmit={handleSubmit} className="signup-form">
        <div className="form-group">
          <input
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="Enter your full name"
            required
            disabled={loading}
          />
        </div>
        
        <div className="form-group">
          <input
            type="text"
            name="username"
            value={form.username}
            onChange={handleChange}
            placeholder="Choose a username"
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
            placeholder="Create a password (min. 6 characters)"
            required
            disabled={loading}
          />
        </div>
        
        <button type="submit" disabled={loading}>
          {loading ? "Creating Account..." : "Sign Up"}
        </button>
        
        {/* Display error message if exists */}
        {error && <p className="error-message">{error}</p>}
        
        {/* Display success message if exists */}
        {success && <p className="success-message">{success}</p>}
      </form>
    </div>
  );
}
