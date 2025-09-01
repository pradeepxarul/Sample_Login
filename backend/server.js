// Import Express framework to build HTTP server and routes
const express = require("express");

// Import Mongoose to interact with MongoDB database
const mongoose = require("mongoose");

// Import CORS middleware to allow frontend to access backend from different origin
const cors = require("cors");

// Import User model to query user data from the database
const User = require("./models/User");

// Create an Express app instance
const app = express();

// Allowed origins array for CORS
const allowedOrigins = ["https://sample-login-plum.vercel.app"];

// Enable CORS for specified origins only (and allow no-origin requests like Postman)
app.use(cors({
  origin: function(origin, callback) {
    if (!origin) return callback(null, true);  // Allow requests with no origin (e.g. Postman)
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = "The CORS policy for this site does not allow access from the specified Origin.";
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true, // Enable cookies and credential headers if needed
}));

// Parse incoming JSON request bodies and populate req.body property
app.use(express.json());

// Connect to MongoDB Atlas database with Mongoose
mongoose
  .connect(
    "mongodb+srv://pradeeparul2005_db_user:Nhb2ag8jzykkebvJ@loginmern.bq0avqi.mongodb.net/login_db?retryWrites=true&w=majority&appName=LoginMERN",
    { useNewUrlParser: true, useUnifiedTopology: true }
  )
  .then(() => console.log("MongoDB connected")) // Log success on connection
  .catch((err) => {
    console.error("MongoDB connection error:", err); // Log any connection errors
    process.exit(1); // Exit application if DB connection fails
  });

// Define POST route at /api/login for user login
app.post("/api/login", async (req, res) => {
  try {
    // Destructure username and password from incoming JSON request body
    const { username, password } = req.body;

    // Basic validation: check if fields are provided
    if (!username || !password) {
      console.warn("Login request missing username or password");
      // Respond with HTTP 400 Bad Request and error message in JSON
      return res.status(400).json({ error: "Username and password required" });
    }

    // Query MongoDB users collection for a user document matching username
    const user = await User.findOne({ username });

    // If user not found, respond with HTTP 401 Unauthorized and error message
    if (!user) {
      console.warn(`Login failed: user not found: ${username}`);
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Check if provided password matches the stored user password
    // (Note: plaintext for this demo; in real app use hashed passwords)
    if (user.password !== password) {
      console.warn(`Login failed: invalid password for user: ${username}`);
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // If all checks pass, login successful
    console.log(`Login successful for user: ${username}`);
    // Respond to client with success message JSON
    res.json({ message: "Login successful" });
  } catch (err) {
    // Catch unexpected errors and respond with HTTP 500 Internal Server Error
    console.error("Login error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Start the server listening at port 5000
app.listen(5000, () => console.log("Server running on port 5000"));
