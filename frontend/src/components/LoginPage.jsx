import React, { useState } from "react";

// Functional React component for the login page UI and logic
export default function LoginPage() {
  // useState hook to create `form` state object with username and password fields
  // `setForm` updates the form state
  const [form, setForm] = useState({ username: "", password: "" });

  // useState hook for `error` message string shown below form
  const [error, setError] = useState("");

  // Handles change in input fields (username/password)
  const handleChange = (e) =>
    // Update form state by copying existing and replacing only the changed field based on input name
    setForm({ ...form, [e.target.name]: e.target.value });

  // Handles login form submission
  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent default browser form submission which reloads page
    setError(""); // Clear any existing error messages

    try {
      // Send POST request to backend login API with username and password in JSON format
      const res = await fetch("https://sample-login-sz4w.onrender.com/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" }, // Tell server request body is JSON
        body: JSON.stringify(form), // Convert JS form state object to JSON string
      });

      const data = await res.json(); // Parse JSON response body from server

      if (!res.ok) setError(data.error); // If HTTP status not 2xx, show backend error message
      else alert(data.message); // Show alert on successful login
    } catch {
      setError("Server error"); // Handle network or unexpected errors
    }
  };

  // Render login form UI
  return (
    <div
      style={{
        maxWidth: 400,
        margin: "4rem auto",
        padding: 20,
        border: "1px solid #ddd",
        borderRadius: 8,
      }}
    >
      <h1 style={{ textAlign: "center", marginBottom: 20 }}>Login</h1>

      {/* Form element handles submission with handleSubmit */}
      <form onSubmit={handleSubmit}>

        {/* Username input field */}
        <label>
          Username
          <input
            name="username" // Input's name attribute must match form state key
            value={form.username} // Controlled component value linked to React state
            onChange={handleChange} // Update state on input change
            required
            style={{ width: "100%", marginBottom: 10, padding: 8 }}
          />
        </label>
        <br />

        {/* Password input field */}
        <label>
          Password
          <input
            name="password"
            type="password" // Mask input as password field
            value={form.password}
            onChange={handleChange}
            required
            style={{ width: "100%", marginBottom: 10, padding: 8 }}
          />
        </label>
        <br />

        {/* Show error message if error state is non-empty */}
        {error && <p style={{ color: "red", marginBottom: 10 }}>{error}</p>}

        {/* Submit button */}
        <button
          type="submit"
          style={{
            width: "100%",
            padding: 10,
            backgroundColor: "#007bff",
            color: "white",
            border: "none",
            borderRadius: 4,
          }}
        >
          Login
        </button>
      </form>
    </div>
  );
}
