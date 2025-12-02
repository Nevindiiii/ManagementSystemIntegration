import jwt from "jsonwebtoken";
import { application } from "../config/application.js";
import AuthUser from "../Models/AuthModels.js";

// JWT Token generation
export const generateToken = (user) => {
  return jwt.sign(
    {
      userId: user._id,
      email: user.email,
      name: user.name,
      role: user.role || "user", 
    },
    application.JWT_SECRET,
    { expiresIn: application.JWT_EXPIRES_IN }
  );
};

// JWT Token verification middleware
export const verifyToken = async (req, res, next) => {
  try {
    const token = req.cookies.auth_token;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Access denied. No token provided.",
      });
    }

    const decoded = jwt.verify( // Verification
      token,
      application.JWT_SECRET
    );
    const user = await AuthUser.findById(decoded.userId).select("-password");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid token. User not found.",
      });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Token expired. Please login again.",
      });
    }

    res.status(401).json({
      success: false,
      message: "Invalid token.",
    });
  }
};

// Refresh token
export const refreshToken = async (req, res) => {
  try {
    const token = req.cookies.auth_token;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Refresh token required",
      });
    }

    const decoded = jwt.verify(
      token,
      application.JWT_SECRET
    );
    const user = await AuthUser.findById(decoded.userId);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found",
      });
    }

    const newToken = generateToken(user);

    // Set new token
    res.cookie("auth_token", newToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 1000, // 1 hour
    });

    res.json({
      success: true,
      token: newToken, 
      user: {
      
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    res.status(401).json({
      success: false,
      message: "Invalid refresh token",
    });
  }
};

export default verifyToken;
