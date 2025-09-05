// Import required dependencies for building the server
const express = require("express"); // Web framework for Node.js
const mongoose = require("mongoose"); // MongoDB object modeling tool
const cors = require("cors"); // Enable Cross-Origin Resource Sharing
const User = require("./models/User"); // Import User model for database operations

// Create Express application instance
const app = express();

/**
 * CORS Configuration
 * Defines which origins are allowed to access our API
 * This prevents unauthorized cross-origin requests
 */
const allowedOrigins = [
  "https://sample-login-plum.vercel.app",
  "http://localhost:3000", // For local development
  "http://localhost:5173"  // For Vite development server
];

// Configure CORS middleware with security settings
app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (like mobile apps, Postman, curl)
    if (!origin) return callback(null, true);
    
    // Check if the origin is in our allowed list
    if (allowedOrigins.indexOf(origin) !== -1) {
      return callback(null, true);
    }
    
    // Reject requests from unauthorized origins
    const msg = "The CORS policy for this site does not allow access from the specified Origin.";
    return callback(new Error(msg), false);
  },
  credentials: true, // Enable credentials (cookies, authorization headers)
}));

// Middleware to parse incoming JSON requests
// This populates req.body with the parsed JSON data
app.use(express.json({ limit: '10mb' }));

// Middleware to parse URL-encoded data from forms
app.use(express.urlencoded({ extended: true }));

/**
 * Database Connection
 * Connect to MongoDB Atlas using Mongoose
 * Includes error handling and connection monitoring
 */
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(
      "mongodb+srv://pradeeparul2005_db_user:Nhb2ag8jzykkebvJ@loginmern.bq0avqi.mongodb.net/login_db?retryWrites=true&w=majority&appName=LoginMERN",
      {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      }
    );
    
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error("MongoDB connection error:", error);
    process.exit(1); // Exit process with failure
  }
};

// Initialize database connection
connectDB();

/**
 * Input validation helper function
 * Validates and sanitizes user input to prevent injection attacks
 * @param {string} input - Input string to validate
 * @param {string} fieldName - Name of the field being validated
 * @param {number} minLength - Minimum required length
 * @param {number} maxLength - Maximum allowed length
 * @returns {Object} - Validation result with isValid boolean and error message
 */
const validateInput = (input, fieldName, minLength = 1, maxLength = 100) => {
  if (!input || typeof input !== 'string') {
    return { isValid: false, error: `${fieldName} is required` };
  }
  
  const trimmedInput = input.trim();
  
  if (trimmedInput.length < minLength) {
    return { isValid: false, error: `${fieldName} must be at least ${minLength} characters long` };
  }
  
  if (trimmedInput.length > maxLength) {
    return { isValid: false, error: `${fieldName} cannot exceed ${maxLength} characters` };
  }
  
  return { isValid: true, value: trimmedInput };
};

/**
 * POST /api/signup - User Registration Endpoint
 * Creates a new user account with name, username, and password
 * Includes comprehensive validation and error handling
 */
app.post("/api/signup", async (req, res) => {
  try {
    // Extract user data from request body
    const { name, username, password } = req.body;
    
    console.log(`Signup attempt for username: ${username}`);
    
    // Validate name field
    const nameValidation = validateInput(name, "Name", 2, 50);
    if (!nameValidation.isValid) {
      console.warn(`Signup validation failed: ${nameValidation.error}`);
      return res.status(400).json({ error: nameValidation.error });
    }
    
    // Validate username field
    const usernameValidation = validateInput(username, "Username", 3, 20);
    if (!usernameValidation.isValid) {
      console.warn(`Signup validation failed: ${usernameValidation.error}`);
      return res.status(400).json({ error: usernameValidation.error });
    }
    
    // Additional username format validation
    const usernameRegex = /^[a-zA-Z0-9_]+$/;
    if (!usernameRegex.test(usernameValidation.value)) {
      console.warn(`Signup validation failed: Invalid username format`);
      return res.status(400).json({ 
        error: "Username can only contain letters, numbers, and underscores" 
      });
    }
    
    // Validate password field
    const passwordValidation = validateInput(password, "Password", 6, 100);
    if (!passwordValidation.isValid) {
      console.warn(`Signup validation failed: ${passwordValidation.error}`);
      return res.status(400).json({ error: passwordValidation.error });
    }
    
    // Check if username already exists in database
    const existingUser = await User.findOne({ 
      username: usernameValidation.value.toLowerCase() 
    });
    
    if (existingUser) {
      console.warn(`Signup failed: Username already exists: ${usernameValidation.value}`);
      return res.status(409).json({ 
        error: "Username already exists. Please choose a different one." 
      });
    }
    
    // Create new user document
    const newUser = new User({
      name: nameValidation.value,
      username: usernameValidation.value.toLowerCase(),
      password: passwordValidation.value // In production, hash this password!
    });
    
    // Save user to database
    const savedUser = await newUser.save();
    
    console.log(`User created successfully: ${savedUser.username}`);
    
    // Return success response (password is automatically excluded by schema transform)
    res.status(201).json({ 
      message: "Account created successfully! You can now log in.",
      user: savedUser
    });
    
  } catch (error) {
    console.error("Signup error:", error);
    
    // Handle specific MongoDB errors
    if (error.name === 'ValidationError') {
      const errorMessage = Object.values(error.errors)[0].message;
      return res.status(400).json({ error: errorMessage });
    }
    
    if (error.code === 11000) {
      // Duplicate key error (username already exists)
      return res.status(409).json({ 
        error: "Username already exists. Please choose a different one." 
      });
    }
    
    // Generic server error
    res.status(500).json({ error: "Internal server error. Please try again." });
  }
});

/**
 * POST /api/login - User Authentication Endpoint
 * Authenticates user with username and password
 * Enhanced with better validation and security logging
 */
app.post("/api/login", async (req, res) => {
  try {
    // Extract credentials from request body
    const { username, password } = req.body;
    
    console.log(`Login attempt for username: ${username}`);
    
    // Validate input fields
    const usernameValidation = validateInput(username, "Username", 1, 20);
    const passwordValidation = validateInput(password, "Password", 1, 100);
    
    if (!usernameValidation.isValid) {
      console.warn(`Login validation failed: ${usernameValidation.error}`);
      return res.status(400).json({ error: usernameValidation.error });
    }
    
    if (!passwordValidation.isValid) {
      console.warn(`Login validation failed: ${passwordValidation.error}`);
      return res.status(400).json({ error: passwordValidation.error });
    }
    
    // Find user in database (case-insensitive username search)
    const user = await User.findOne({ 
      username: usernameValidation.value.toLowerCase() 
    });
    
    // Check if user exists
    if (!user) {
      console.warn(`Login failed: User not found: ${usernameValidation.value}`);
      // Use generic message to prevent username enumeration attacks
      return res.status(401).json({ error: "Invalid username or password" });
    }
    
    // Verify password (in production, use bcrypt.compare for hashed passwords)
    if (user.password !== passwordValidation.value) {
      console.warn(`Login failed: Invalid password for user: ${user.username}`);
      return res.status(401).json({ error: "Invalid username or password" });
    }
    
    // Authentication successful
    console.log(`Login successful for user: ${user.username}`);
    
    // Return success response with user info (password excluded by schema)
    res.json({ 
      message: `Welcome back, ${user.name}!`,
      user: user
    });
    
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Internal server error. Please try again." });
  }
});

/**
 * Health check endpoint
 * Useful for monitoring server status and database connectivity
 */
app.get("/api/health", async (req, res) => {
  try {
    // Check database connection
    const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
    
    res.json({
      status: 'OK',
      timestamp: new Date().toISOString(),
      database: dbStatus,
      uptime: process.uptime()
    });
  } catch (error) {
    res.status(500).json({ 
      status: 'ERROR', 
      message: 'Health check failed' 
    });
  }
});

/**
 * Catch-all route for undefined endpoints
 * Returns 404 for any route that doesn't exist
 */
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

/**
 * Global error handling middleware
 * Catches any unhandled errors and returns appropriate response
 */
app.use((error, req, res, next) => {
  console.error('Unhandled error:', error);
  res.status(500).json({ error: 'Internal server error' });
});

// Define server port (use environment variable or default to 5000)
const PORT = process.env.PORT || 5000;

// Start the server and listen for incoming requests
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Health check available at: http://localhost:${PORT}/api/health`);
});

// Handle graceful shutdown
process.on('SIGINT', async () => {
  console.log('Received SIGINT. Closing server gracefully...');
  await mongoose.connection.close();
  process.exit(0);
});
