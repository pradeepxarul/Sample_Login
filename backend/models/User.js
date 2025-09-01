// Import mongoose for defining database schema & model
const mongoose = require("mongoose");

// Define User schema: how user data is structured in MongoDB
const UserSchema = new mongoose.Schema({
  username: String, // Username field of type String
  password: String, // Password field of type String (plaintext for demo purposes)
});

// Export a mongoose model named "User" to perform database operations on `users` collection
module.exports = mongoose.model("User", UserSchema);
