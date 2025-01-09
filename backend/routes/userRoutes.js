const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Division = require("../models/Division");
const Credential = require("../models/Credential");

const router = express.Router();

// Middleware to verify JWT and extract user information
const authenticate = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1]; // Extract token from "Bearer <token>"
  if (!token) {
    return res
      .status(401)
      .json({ message: "Access denied. No token provided." });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Attach user info (id and role) to the request object
    next();
  } catch (err) {
    res.status(401).json({ message: "Invalid or expired token." });
  }
};

// Registration Endpoint
router.post("/register", async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    // Check if user already exists
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new user with the "Normal" role by default
    const newUser = await User.create({
      username,
      password: hashedPassword,
      role: "Normal",
    });

    // Generate a JWT
    const token = jwt.sign(
      { id: newUser._id, role: newUser.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.status(201).json({ message: "User registered successfully", token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// Login Endpoint
router.post("/login", async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    // Check if user exists
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Compare passwords
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Generate a JWT
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.status(200).json({ message: "Login successful", token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// Endpoint to view a division's credential repository
router.get("/division/:id/repository", authenticate, async (req, res) => {
  const divisionId = req.params.id;

  try {
    // Find the division
    const division = await Division.findById(divisionId).populate(
      "credentials"
    );

    if (!division) {
      return res.status(404).json({ message: "Division not found." });
    }

    // Check if the user has access rights
    const userHasAccess =
      req.user.role === "Admin" ||
      req.user.role === "Management" ||
      division._id.equals(req.user.divisions);

    if (!userHasAccess) {
      return res
        .status(403)
        .json({ message: "You do not have access to this repository." });
    }

    // Return the credentials
    res.status(200).json({ credentials: division.credentials });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Server error. Unable to fetch credentials." });
  }
});

// Endpoint to add a credential to a specific repository
router.post("/division/:id/credential", authenticate, async (req, res) => {
  const divisionId = req.params.id;
  const { service, username, password } = req.body;

  if (!service || !username || !password) {
    return res.status(400).json({ message: "All fields are required." });
  }

  try {
    // Find the division
    const division = await Division.findById(divisionId);

    if (!division) {
      return res.status(404).json({ message: "Division not found." });
    }

    // Check if the user has the right to add credentials
    const userHasAccess =
      req.user.role === "Admin" ||
      req.user.role === "Management" ||
      division._id.equals(req.user.divisions);
    if (!userHasAccess) {
      return res.status(403).json({
        message:
          "You do not have permission to add credentials to this repository.",
      });
    }

    // Create the new credential
    const newCredential = await Credential.create({
      service,
      username,
      password,
      division: division._id,
    });

    // Add the credential to the division's credentials array
    division.credentials.push(newCredential._id);
    await division.save();

    res.status(201).json({
      message: "Credential added successfully.",
      credential: newCredential,
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Server error. Unable to add credential." });
  }
});
// Endpoint to update a specific credential
router.put("/credential/:id", authenticate, async (req, res) => {
  const credentialId = req.params.id;
  const { service, username, password } = req.body;

  if (!service && !username && !password) {
    return res
      .status(400)
      .json({
        message:
          "At least one field (service, username, or password) must be provided.",
      });
  }

  try {
    // Find the credential
    const credential = await Credential.findById(credentialId);

    if (!credential) {
      return res.status(404).json({ message: "Credential not found." });
    }

    // Check if the user has the right to update the credential
    const userHasAccess =
      req.user.role === "Admin" ||
      req.user.role === "Management" ||
      credential.division.equals(req.user.divisions);
    if (!userHasAccess) {
      return res
        .status(403)
        .json({
          message: "You do not have permission to update this credential.",
        });
    }

    // Update the credential fields
    if (service) credential.service = service;
    if (username) credential.username = username;
    if (password) credential.password = password;

    // Save the updated credential
    const updatedCredential = await credential.save();

    res
      .status(200)
      .json({
        message: "Credential updated successfully.",
        credential: updatedCredential,
      });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Server error. Unable to update credential." });
  }
});

module.exports = router;
