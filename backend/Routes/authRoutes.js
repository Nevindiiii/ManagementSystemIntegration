import express from "express";
import Auth from "../Models/AuthModels.js";
import { generateToken, refreshToken } from "../Middleware/authMiddleware.js";
import crypto from "crypto";
import nodemailer from "nodemailer";

const router = express.Router();

// Generate random password
const generatePassword = () => {
  return crypto.randomBytes(8).toString('hex');
};

// Send password via email
const sendPasswordEmail = async (name, email, password) => {
  console.log('📧 Attempting to send email to:', email);
  console.log('📧 Using EMAIL_USER:', process.env.EMAIL_USER);
  
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Your Account Password - Management System',
    html: `
      <h2>Welcome ${name}!</h2>
      <p>Your account has been created successfully.</p>
      <p><strong>Your Login Credentials:</strong></p>
      <p>Email: <strong>${email}</strong></p>
      <p>Password: <strong>${password}</strong></p>
      <p style="color: red;">⚠️ Please login and change your password immediately for security.</p>
      <br>
      <p>Best regards,</p>
      <p>Management System Team</p>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Email sent successfully! Message ID:', info.messageId);
    return info;
  } catch (error) {
    console.error('❌ Transporter sendMail error:', error);
    throw error;
  }
};

// Register new user with auto-generated password
router.post("/register", async (req, res) => {
  try {
    const { name, email } = req.body;

    console.log("Registration request:", { name, email });

    // Validate required fields
    if (!name || !email) {
      return res.status(400).json({
        success: false,
        message: "Name and email are required",
      });
    }

    // Check if user already exists
    const existingUser = await Auth.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User already exists with this email",
      });
    }

    // Generate random password
    const generatedPassword = generatePassword();

    // Create new user
    const newUser = new Auth({
      name,
      email,
      password: generatedPassword,
      role: req.body.role || "user",
    });

    await newUser.save();

    console.log("User registered successfully:", newUser.name);

    // Send password via email
    try {
      await sendPasswordEmail(name, email, generatedPassword);
      console.log("✅ Password email sent successfully to:", email);
    } catch (emailError) {
      console.error('❌ Email sending failed:', emailError.message);
      if (emailError.stack) console.error('Stack:', emailError.stack);
      // Continue even if email fails
    }

    res.status(201).json({
      success: true,
      message: "User registered successfully. Password sent to your email.",
    });
  } catch (error) {
    console.error("Registration error:", error);

    if (error.name === "ValidationError") {
      const errors = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors,
      });
    }

    res.status(500).json({
      success: false,
      message: "Server error during registration",
    });
  }
});

// Refresh token
router.post("/refresh", refreshToken);

// Login user
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    console.log("Login request:", { email });

    // Validate required fields
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    // Find user by email
    const user = await Auth.findOne({ email });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Generate JWT token
    const token = generateToken(user);

    // Set token as httpOnly cookie
    res.cookie("auth_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    });

    console.log("User logged in successfully:", user.name);

    res.json({
      success: true,
      message: "Login successful",
      token: token, 
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      success: false,
      message: "Server error during login",
    });
  }
});

// Verify auth cookie exists
router.get("/verify", (req, res) => {
  const token = req.cookies.auth_token;
  if (!token) {
    return res.status(401).json({ success: false, message: "No token found" });
  }
  res.json({ success: true, message: "Token exists" });
});

// Logout user
router.post("/logout", (req, res) => {
  res.clearCookie("auth_token");
  res.json({
    success: true,
    message: "Logged out successfully",
  });
});

// GET list of auth users 
router.get("/users", async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const total = await Auth.countDocuments();
    const users = await Auth.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    res.json({
      success: true,
      users: users.map((u) => ({
        id: u._id,
        name: u.name,
        email: u.email,
        role: u.role,
        createdAt: u.createdAt,
      })),
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalUsers: total,
        limit: limit,
      },
    });
  } catch (error) {
    console.error("Error fetching auth users:", error);
    res
      .status(500)
      .json({
        success: false,
        message: "Unable to fetch users",
        error: error.message,
      });
  }
});

export default router;
