import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import LoginPage from "./components/LoginPage";
import SignupPage from "./components/SignupPage";

/**
 * Main App component that sets up routing between Login and Signup pages
 * Uses React Router for client-side navigation
 */
export default function App() {
  return (
    <Router>
      <div className="app-container">
        {/* Navigation bar with links to Login and Signup pages */}
        <nav className="nav-bar">
          <Link to="/login" className="nav-link">Login</Link>
          <Link to="/signup" className="nav-link">Sign Up</Link>
        </nav>
        
        {/* Routes configuration - defines which component to render for each path */}
        <Routes>
          <Route path="/" element={<LoginPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
        </Routes>
      </div>
    </Router>
  );
}
