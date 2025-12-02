import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { createServer } from "http";
import { Server } from "socket.io";
import { application } from "./config/application.js";
import connectDB from "./config/db.js";
import userRoutes from "./Routes/usersRoutes.js";
import authRoutes from "./Routes/authRoutes.js";
import protectedRoutes from "./Routes/protectedRoutes.js";
import settingsRoutes from "./Routes/settingsRoutes.js";
import productsRoutes from "./Routes/productsRoutes.js";
import uploadRoutes from "./Routes/uploadRoutes.js";
import profileRoutes from "./Routes/profileRoutes.js";
import contactRoutes from "./Routes/contact.js";
const app = express();
const httpServer = createServer(app);

// Correct, simplified CORS setup
const allowedOrigins = [
  application.CLIENT_URL,
  "http://localhost:5174",
  "http://localhost:3000",
];

// Socket.IO setup
const io = new Server(httpServer, {
  cors: {
    origin: allowedOrigins,
    credentials: true,
  },
});

// Socket.IO connection handling
io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
});

// Make io accessible to routes
app.set("io", io);

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  })
);

//Handle preflight requests for all routes safely
app.options(/.*/, (req, res) => {
  res.header("Access-Control-Allow-Origin", req.headers.origin || "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization, X-Requested-With"
  );
  res.header("Access-Control-Allow-Credentials", "true");
  return res.sendStatus(200);
});


// Middlewares
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(cookieParser());
app.use('/uploads', express.static('uploads'));

// Connect DB
connectDB();

// Routes
app.use("/api/users", userRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/protected", protectedRoutes);
app.use("/api/settings", settingsRoutes);
app.use("/api/products", productsRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/contact", contactRoutes);

app.get("/", (req, res) => {
  res.send("Server is running");
});

// 404 handler
app.use("/api", (req, res) => {
  res.status(404).json({
    success: false,
    message: `API endpoint not found: ${req.method} ${req.originalUrl}`,
  });
});

httpServer.listen(application.PORT, () => console.log(` Server running on port ${application.PORT}`));
