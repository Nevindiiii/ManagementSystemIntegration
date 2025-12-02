import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { welcomeTemplate } from "../utils/emailTemplates.js";
import { sendEmail } from "../services/email.service.js";

const generatePassword = () => Math.random().toString(36).slice(-8);
const generateToken = (userId, email, name, role = "user") =>
  jwt.sign({ userId, email, name, role }, process.env.JWT_SECRET, {
    expiresIn: "24h",
  });

export const registerUser = async (req, res) => {
  try {
    const { name, email } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ message: "User already exists" });

    const password = generatePassword();
    const hashedPassword = await bcrypt.hash(password, 12);
    const user = new User({ name, email, password: hashedPassword });
    await user.save();

    const { to, subject, html } = welcomeTemplate(name, email, password);
    await sendEmail({ to, subject, html });

    const token = generateToken(user._id, user.email, user.name, user.role);
    res.status(201).json({
      message: "User registered successfully",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: "Invalid credentials" });

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword)
      return res.status(401).json({ message: "Invalid credentials" });

    const token = generateToken(user._id, user.email, user.name, user.role);
    res.json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const verifyToken = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ message: "No token provided" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select("-password");
    if (!user) return res.status(401).json({ message: "Invalid token" });

    res.json({
      valid: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(401).json({ message: "Invalid token" });
  }
};
