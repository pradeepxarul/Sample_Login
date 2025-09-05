// Import mongoose for defining database schema and model
const mongoose = require("mongoose");

/**
 * User Schema Definition
 * Defines the structure of user documents in MongoDB
 * Includes validation and indexing for optimal performance
 */
const UserSchema = new mongoose.Schema({
  // Full name of the user (required field)
  name: {
    type: String,
    required: [true, "Name is required"],
    trim: true, // Removes whitespace from beginning and end
    minlength: [2, "Name must be at least 2 characters long"],
    maxlength: [50, "Name cannot exceed 50 characters"]
  },
  
  // Username for login (required, unique field)
  username: {
    type: String,
    required: [true, "Username is required"],
    unique: true, // Ensures no duplicate usernames
    trim: true,
    lowercase: true, // Convert to lowercase for consistency
    minlength: [3, "Username must be at least 3 characters long"],
    maxlength: [20, "Username cannot exceed 20 characters"],
    match: [/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscores"]
  },
  
  // User password (in production, this should be hashed)
  password: {
    type: String,
    required: [true, "Password is required"],
    minlength: [6, "Password must be at least 6 characters long"]
  }
}, {
  // Add timestamps for createdAt and updatedAt
  timestamps: true,
  
  // Optimize JSON output (remove password from JSON responses)
  toJSON: {
    transform: function(doc, ret) {
      delete ret.password; // Never send password in API responses
      return ret;
    }
  }
});

// Create index on username for faster queries
UserSchema.index({ username: 1 });

// Export mongoose model for User collection
// This allows us to perform CRUD operations on the users collection
module.exports = mongoose.model("User", UserSchema);
