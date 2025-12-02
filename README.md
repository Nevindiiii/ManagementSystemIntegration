# Management System (MS)

A full-stack web application built with React (TypeScript) frontend and Node.js/Express backend, featuring user management, product management, authentication, and real-time communication.

## 🏗️ System Architecture

```
MS/
├── frontend/          # React + TypeScript + Vite
├── backend/           # Node.js + Express + MongoDB
├── .env              # Environment variables
└── README.md         # This file
```

## 🚀 Tech Stack

### Frontend
- **React 19** with TypeScript
- **Vite** for build tooling
- **TailwindCSS** for styling
- **Radix UI** for components
- **React Router** for navigation
- **TanStack Query** for data fetching
- **Zustand** for state management
- **Socket.IO Client** for real-time features

### Backend
- **Node.js** with Express
- **MongoDB** with Mongoose ODM
- **JWT** for authentication
- **Socket.IO** for real-time communication
- **AWS S3** for file storage
- **Nodemailer** for email services
- **Multer** for file uploads

## 📋 Core Features

### 1. Authentication System
- **User Registration** with auto-generated passwords
- **Email-based Login** with JWT tokens
- **Role-based Access Control** (Admin/User)
- **Password Reset** functionality
- **Session Management** with HTTP-only cookies

### 2. User Management
- **User CRUD Operations** (Create, Read, Update, Delete)
- **User Profile Management** with image uploads
- **Pagination** and **Search** functionality
- **Data Tables** with sorting and filtering

### 3. Product Management
- **Product CRUD Operations**
- **Manual Product Entry**
- **Product Categories** and **Analytics**
- **Bulk Operations**

### 4. Dashboard & Analytics
- **Admin Dashboard** with statistics
- **Activity Charts** and **Category Charts**
- **Real-time Data Updates**
- **System Health Monitoring**

### 5. Communication Features
- **Contact Form** with email integration
- **Real-time Notifications** via Socket.IO
- **Email Services** for user communications

## 🔧 System Functions & Handlers

### 11 Main Logic Functions Implementation

#### 1. Frontend Integration (DummyJSON API Call)
```typescript
// Frontend: services/dummyApi.ts
import axios from 'axios';

interface Product {
  id: number;
  title: string;
  price: number;
  category: string;
  image: string;
}

export const fetchDummyProducts = async (): Promise<Product[]> => {
  try {
    const response = await axios.get('https://dummyjson.com/products');
    return response.data.products;
  } catch (error) {
    throw new Error('Failed to fetch products');
  }
};

// React Component Usage
const ProductList: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const data = await fetchDummyProducts();
        setProducts(data);
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };
    loadProducts();
  }, []);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {products.map(product => (
        <div key={product.id} className="border p-4 rounded">
          <h3>{product.title}</h3>
          <p>${product.price}</p>
        </div>
      ))}
    </div>
  );
};
```

#### 2. MongoDB Integration
```javascript
// Backend: config/database.js
const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('Database connection error:', error);
    process.exit(1);
  }
};

// User Model: models/User.js
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['admin', 'user'], default: 'user' },
  avatar: String,
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);

// Database Operations
const User = require('../models/User');

// Create User
const createUser = async (userData) => {
  const user = new User(userData);
  return await user.save();
};

// Find Users with Pagination
const getUsers = async (page = 1, limit = 10) => {
  const skip = (page - 1) * limit;
  const users = await User.find()
    .select('-password')
    .skip(skip)
    .limit(limit)
    .sort({ createdAt: -1 });
  const total = await User.countDocuments();
  return { users, total, pages: Math.ceil(total / limit) };
};
```

#### 3. Backend Notification Handler
```javascript
// Backend: services/notificationService.js
const socketIo = require('socket.io');

class NotificationService {
  constructor(server) {
    this.io = socketIo(server, {
      cors: { origin: process.env.CLIENT_URL, methods: ['GET', 'POST'] }
    });
    this.setupSocketHandlers();
  }

  setupSocketHandlers() {
    this.io.on('connection', (socket) => {
      console.log('Client connected:', socket.id);

      socket.on('join-room', (userId) => {
        socket.join(`user-${userId}`);
      });

      socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
      });
    });
  }

  sendNotification(userId, notification) {
    this.io.to(`user-${userId}`).emit('notification', {
      id: Date.now(),
      message: notification.message,
      type: notification.type,
      timestamp: new Date()
    });
  }

  broadcastNotification(notification) {
    this.io.emit('broadcast-notification', notification);
  }
}

// Usage in routes
const notificationService = require('../services/notificationService');

app.post('/api/users', async (req, res) => {
  try {
    const user = await createUser(req.body);
    // Send notification
    notificationService.broadcastNotification({
      message: `New user ${user.name} registered`,
      type: 'success'
    });
    res.status(201).json(user);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});
```

#### 4. User Authentication
```javascript
// Backend: controllers/authController.js
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);
    
    // Create user
    const user = new User({
      name,
      email,
      password: hashedPassword
    });
    
    await user.save();
    
    // Generate token
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: { id: user._id, name: user.name, email: user.email }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    // Generate token
    const token = jwt.sign(
      { userId: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    res.json({
      message: 'Login successful',
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { register, login };
```

#### 5. JWT Integration
```javascript
// Backend: middleware/auth.js
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ message: 'Access token required' });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user) {
      return res.status(401).json({ message: 'Invalid token' });
    }
    
    req.user = user;
    next();
  } catch (error) {
    return res.status(403).json({ message: 'Invalid or expired token' });
  }
};

// Frontend: utils/auth.ts
class AuthService {
  private tokenKey = 'auth_token';
  
  setToken(token: string): void {
    localStorage.setItem(this.tokenKey, token);
  }
  
  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }
  
  removeToken(): void {
    localStorage.removeItem(this.tokenKey);
  }
  
  isAuthenticated(): boolean {
    const token = this.getToken();
    if (!token) return false;
    
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.exp > Date.now() / 1000;
    } catch {
      return false;
    }
  }
}

export const authService = new AuthService();

// Axios Interceptor
import axios from 'axios';

axios.interceptors.request.use((config) => {
  const token = authService.getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

#### 6. Pagination Handling from Backend
```javascript
// Backend: controllers/userController.js
const getUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || '';
    const sortBy = req.query.sortBy || 'createdAt';
    const sortOrder = req.query.sortOrder === 'asc' ? 1 : -1;
    
    const skip = (page - 1) * limit;
    
    // Build search query
    const searchQuery = search ? {
      $or: [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ]
    } : {};
    
    // Get users with pagination
    const users = await User.find(searchQuery)
      .select('-password')
      .sort({ [sortBy]: sortOrder })
      .skip(skip)
      .limit(limit);
    
    const total = await User.countDocuments(searchQuery);
    const totalPages = Math.ceil(total / limit);
    
    res.json({
      users,
      pagination: {
        currentPage: page,
        totalPages,
        totalUsers: total,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Frontend: hooks/usePagination.ts
import { useState, useEffect } from 'react';
import axios from 'axios';

interface PaginationData {
  currentPage: number;
  totalPages: number;
  totalUsers: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export const usePagination = (endpoint: string) => {
  const [data, setData] = useState([]);
  const [pagination, setPagination] = useState<PaginationData | null>(null);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  
  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await axios.get(endpoint, {
        params: { page, search, limit: 10 }
      });
      setData(response.data.users);
      setPagination(response.data.pagination);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchData();
  }, [page, search]);
  
  return {
    data,
    pagination,
    loading,
    page,
    setPage,
    search,
    setSearch,
    refetch: fetchData
  };
};
```

#### 7. Role-based and Permission Handling
```javascript
// Backend: middleware/roleAuth.js
const checkRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Insufficient permissions' });
    }
    
    next();
  };
};

const checkPermission = (permission) => {
  return async (req, res, next) => {
    try {
      const userPermissions = await getUserPermissions(req.user.id);
      
      if (!userPermissions.includes(permission)) {
        return res.status(403).json({ message: 'Permission denied' });
      }
      
      next();
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };
};

// Usage in routes
app.get('/api/admin/users', authenticateToken, checkRole(['admin']), getUsers);
app.delete('/api/users/:id', authenticateToken, checkPermission('delete_user'), deleteUser);

// Frontend: components/ProtectedRoute.tsx
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: string;
  requiredPermission?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requiredRole, 
  requiredPermission 
}) => {
  const { user, isAuthenticated } = useAuth();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  if (requiredRole && user?.role !== requiredRole) {
    return <Navigate to="/unauthorized" replace />;
  }
  
  if (requiredPermission && !user?.permissions?.includes(requiredPermission)) {
    return <Navigate to="/unauthorized" replace />;
  }
  
  return <>{children}</>;
};

export default ProtectedRoute;
```

#### 8. React File Upload Cloudinary
```typescript
// Frontend: components/CloudinaryUpload.tsx
import { useState } from 'react';
import axios from 'axios';

interface CloudinaryUploadProps {
  onUploadSuccess: (url: string) => void;
  onUploadError: (error: string) => void;
}

const CloudinaryUpload: React.FC<CloudinaryUploadProps> = ({ 
  onUploadSuccess, 
  onUploadError 
}) => {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => setPreview(reader.result as string);
      reader.readAsDataURL(file);
      uploadToCloudinary(file);
    }
  };
  
  const uploadToCloudinary = async (file: File) => {
    setUploading(true);
    
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', 'your_upload_preset');
    formData.append('cloud_name', 'your_cloud_name');
    
    try {
      const response = await axios.post(
        'https://api.cloudinary.com/v1_1/your_cloud_name/image/upload',
        formData
      );
      
      onUploadSuccess(response.data.secure_url);
    } catch (error) {
      onUploadError('Upload failed');
    } finally {
      setUploading(false);
    }
  };
  
  return (
    <div className="upload-container">
      <input
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        disabled={uploading}
        className="hidden"
        id="file-upload"
      />
      <label
        htmlFor="file-upload"
        className="cursor-pointer bg-blue-500 text-white px-4 py-2 rounded"
      >
        {uploading ? 'Uploading...' : 'Choose File'}
      </label>
      {preview && (
        <img src={preview} alt="Preview" className="mt-4 w-32 h-32 object-cover" />
      )}
    </div>
  );
};

export default CloudinaryUpload;
```

#### 9. React File Upload AWS S3
```typescript
// Backend: routes/upload.js
const AWS = require('aws-sdk');
const multer = require('multer');
const multerS3 = require('multer-s3');

// Configure AWS
AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION
});

const s3 = new AWS.S3();

// Multer S3 configuration
const upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: process.env.AWS_S3_BUCKET,
    metadata: (req, file, cb) => {
      cb(null, { fieldName: file.fieldname });
    },
    key: (req, file, cb) => {
      const fileName = `uploads/${Date.now()}-${file.originalname}`;
      cb(null, fileName);
    }
  }),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files allowed'));
    }
  }
});

// Upload endpoint
app.post('/api/upload', upload.single('file'), (req, res) => {
  try {
    res.json({
      message: 'File uploaded successfully',
      fileUrl: req.file.location,
      fileName: req.file.key
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Frontend: components/S3Upload.tsx
import { useState } from 'react';
import axios from 'axios';

const S3Upload: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadedUrl, setUploadedUrl] = useState<string>('');
  
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  };
  
  const handleUpload = async () => {
    if (!file) return;
    
    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    
    try {
      const response = await axios.post('/api/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      setUploadedUrl(response.data.fileUrl);
      alert('File uploaded successfully!');
    } catch (error) {
      console.error('Upload error:', error);
      alert('Upload failed');
    } finally {
      setUploading(false);
    }
  };
  
  return (
    <div className="p-4">
      <input type="file" onChange={handleFileChange} accept="image/*" />
      <button
        onClick={handleUpload}
        disabled={!file || uploading}
        className="ml-2 bg-blue-500 text-white px-4 py-2 rounded disabled:opacity-50"
      >
        {uploading ? 'Uploading...' : 'Upload to S3'}
      </button>
      {uploadedUrl && (
        <div className="mt-4">
          <p>Uploaded successfully!</p>
          <img src={uploadedUrl} alt="Uploaded" className="w-32 h-32 object-cover" />
        </div>
      )}
    </div>
  );
};

export default S3Upload;
```

#### 10. EmailJS
```typescript
// Frontend: services/emailService.ts
import emailjs from '@emailjs/browser';

interface EmailData {
  to_name: string;
  from_name: string;
  message: string;
  reply_to: string;
}

class EmailService {
  private serviceId = process.env.VITE_EMAILJS_SERVICE_ID!;
  private templateId = process.env.VITE_EMAILJS_TEMPLATE_ID!;
  private publicKey = process.env.VITE_EMAILJS_PUBLIC_KEY!;
  
  constructor() {
    emailjs.init(this.publicKey);
  }
  
  async sendEmail(emailData: EmailData): Promise<void> {
    try {
      const response = await emailjs.send(
        this.serviceId,
        this.templateId,
        emailData
      );
      console.log('Email sent successfully:', response.status, response.text);
    } catch (error) {
      console.error('Email send failed:', error);
      throw new Error('Failed to send email');
    }
  }
  
  async sendContactForm(formData: {
    name: string;
    email: string;
    subject: string;
    message: string;
  }): Promise<void> {
    const emailData: EmailData = {
      to_name: 'Admin',
      from_name: formData.name,
      message: `Subject: ${formData.subject}\n\nMessage: ${formData.message}`,
      reply_to: formData.email
    };
    
    return this.sendEmail(emailData);
  }
}

export const emailService = new EmailService();

// Frontend: components/ContactForm.tsx
import { useState } from 'react';
import { emailService } from '../services/emailService';

const ContactForm: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [sending, setSending] = useState(false);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    
    try {
      await emailService.sendContactForm(formData);
      alert('Message sent successfully!');
      setFormData({ name: '', email: '', subject: '', message: '' });
    } catch (error) {
      alert('Failed to send message. Please try again.');
    } finally {
      setSending(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto p-4">
      <input
        type="text"
        placeholder="Name"
        value={formData.name}
        onChange={(e) => setFormData({...formData, name: e.target.value})}
        required
        className="w-full p-2 mb-4 border rounded"
      />
      <input
        type="email"
        placeholder="Email"
        value={formData.email}
        onChange={(e) => setFormData({...formData, email: e.target.value})}
        required
        className="w-full p-2 mb-4 border rounded"
      />
      <input
        type="text"
        placeholder="Subject"
        value={formData.subject}
        onChange={(e) => setFormData({...formData, subject: e.target.value})}
        required
        className="w-full p-2 mb-4 border rounded"
      />
      <textarea
        placeholder="Message"
        value={formData.message}
        onChange={(e) => setFormData({...formData, message: e.target.value})}
        required
        rows={4}
        className="w-full p-2 mb-4 border rounded"
      />
      <button
        type="submit"
        disabled={sending}
        className="w-full bg-blue-500 text-white p-2 rounded disabled:opacity-50"
      >
        {sending ? 'Sending...' : 'Send Message'}
      </button>
    </form>
  );
};

export default ContactForm;
```

#### 11. Nodemailer.js
```javascript
// Backend: services/emailService.js
const nodemailer = require('nodemailer');
const fs = require('fs').promises;
const path = require('path');

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransporter({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });
  }
  
  async sendWelcomeEmail(name, email, password) {
    const htmlTemplate = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          .container { max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; }
          .header { background-color: #4CAF50; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; }
          .password-box { background-color: #f0f0f0; padding: 15px; border-radius: 5px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Welcome to Management System</h1>
          </div>
          <div class="content">
            <h2>Hello ${name}!</h2>
            <p>Your account has been created successfully. Here are your login credentials:</p>
            <div class="password-box">
              <strong>Email:</strong> ${email}<br>
              <strong>Password:</strong> ${password}
            </div>
            <p>Please change your password after first login for security.</p>
            <p>Best regards,<br>Management System Team</p>
          </div>
        </div>
      </body>
      </html>
    `;
    
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Welcome to Management System - Your Account Details',
      html: htmlTemplate
    };
    
    try {
      const result = await this.transporter.sendMail(mailOptions);
      console.log('Welcome email sent:', result.messageId);
      return result;
    } catch (error) {
      console.error('Error sending welcome email:', error);
      throw error;
    }
  }
  
  async sendPasswordResetEmail(email, resetToken) {
    const resetUrl = `${process.env.CLIENT_URL}/reset-password?token=${resetToken}`;
    
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Password Reset Request',
      html: `
        <h2>Password Reset Request</h2>
        <p>You requested a password reset. Click the link below to reset your password:</p>
        <a href="${resetUrl}" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Reset Password</a>
        <p>This link will expire in 1 hour.</p>
        <p>If you didn't request this, please ignore this email.</p>
      `
    };
    
    return await this.transporter.sendMail(mailOptions);
  }
  
  async sendNotificationEmail(email, subject, message) {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: subject,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>${subject}</h2>
          <p>${message}</p>
          <hr>
          <p><small>This is an automated message from Management System.</small></p>
        </div>
      `
    };
    
    return await this.transporter.sendMail(mailOptions);
  }
  
  async sendBulkEmails(recipients, subject, message) {
    const promises = recipients.map(recipient => 
      this.sendNotificationEmail(recipient.email, subject, message)
    );
    
    try {
      const results = await Promise.allSettled(promises);
      const successful = results.filter(result => result.status === 'fulfilled').length;
      const failed = results.filter(result => result.status === 'rejected').length;
      
      return { successful, failed, total: recipients.length };
    } catch (error) {
      console.error('Bulk email error:', error);
      throw error;
    }
  }
}

module.exports = new EmailService();

// Usage in controllers
const emailService = require('../services/emailService');

// In user registration
const registerUser = async (req, res) => {
  try {
    const { name, email } = req.body;
    const password = generateRandomPassword();
    
    // Create user
    const user = await createUser({ name, email, password });
    
    // Send welcome email
    await emailService.sendWelcomeEmail(name, email, password);
    
    res.status(201).json({ message: 'User created and email sent' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Password reset
const requestPasswordReset = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    const resetToken = generateResetToken();
    user.resetToken = resetToken;
    user.resetTokenExpiry = Date.now() + 3600000; // 1 hour
    await user.save();
    
    await emailService.sendPasswordResetEmail(email, resetToken);
    
    res.json({ message: 'Password reset email sent' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
```

### Backend API Endpoints

#### Authentication Routes (`/api/auth`)
```javascript
POST /register    # Register new user with auto-generated password
POST /login       # User login with JWT token generation
POST /logout      # Clear authentication cookies
POST /refresh     # Refresh JWT tokens
GET  /verify      # Verify authentication status
GET  /users       # Get paginated list of authenticated users
```

#### User Management Routes (`/api/users`)
```javascript
GET    /          # Get all users with pagination
POST   /          # Create new user
GET    /:id       # Get specific user by ID
PUT    /:id       # Update user information
DELETE /:id       # Delete user
```

#### Product Routes (`/api/products`)
```javascript
GET    /          # Get all products with filtering
POST   /          # Create new product
PUT    /:id       # Update product
DELETE /:id       # Delete product
```

#### Profile Routes (`/api/profile`)
```javascript
GET    /          # Get user profile
PUT    /          # Update profile information
POST   /upload    # Upload profile image
```

#### Settings Routes (`/api/settings`)
```javascript
GET    /          # Get system settings
PUT    /          # Update settings
```

### Frontend Components Structure

#### Core Components
- **Layout System**: Header, Sidebar, Main content area
- **Authentication**: Login/Signup forms, Protected routes
- **Data Tables**: Reusable table components with pagination
- **Forms**: User forms, Product forms with validation
- **UI Components**: Buttons, Modals, Alerts, Charts

#### Page Components
- **Dashboard**: Admin overview with analytics
- **Users**: User management with CRUD operations
- **Products**: Product management interface
- **Profile**: User profile management
- **Settings**: System configuration
- **Contact**: Contact form and communication

### Key System Handlers

#### 1. Authentication Handler
```javascript
// JWT Token Generation
const generateToken = (user) => {
  return jwt.sign(
    { userId: user._id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '24h' }
  );
};

// Password Hashing
const hashPassword = async (password) => {
  return await bcrypt.hash(password, 12);
};
```

#### 2. Database Connection Handler
```javascript
// MongoDB Connection with Error Handling
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      tls: true,
      retryWrites: true,
      w: 'majority'
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error("MongoDB Connection Error:", error.message);
    process.exit(1);
  }
};
```

#### 3. File Upload Handler
```javascript
// Multer Configuration for File Uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/profiles/');
  },
  filename: (req, file, cb) => {
    const uniqueName = `profile-${Date.now()}-${file.originalname}`;
    cb(null, uniqueName);
  }
});
```

#### 4. Real-time Communication Handler
```javascript
// Socket.IO Connection Management
io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);
  
  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
});
```

#### 5. Email Service Handler
```javascript
// Nodemailer Configuration
const sendPasswordEmail = async (name, email, password) => {
  const transporter = nodemailer.createTransporter({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
  
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Your Account Password',
    html: `<h2>Welcome ${name}!</h2>
           <p>Password: <strong>${password}</strong></p>`
  };
  
  return await transporter.sendMail(mailOptions);
};
```

## 🛠️ Installation & Setup

### Prerequisites
- Node.js (v18+)
- MongoDB (local or cloud)
- Git

### 1. Clone Repository
```bash
git clone <repository-url>
cd MS
```

### 2. Backend Setup
```bash
cd backend
npm install
# or
yarn install

# Create .env file
cp .env.example .env
# Configure your environment variables
```

### 3. Frontend Setup
```bash
cd frontend
npm install
# or
yarn install

# Create .env file
cp .env.example .env
```

### 4. Environment Variables

#### Backend (.env)
```env
MONGO_URI=mongodb://localhost:27017/management_system
JWT_SECRET=your_jwt_secret_key
EMAIL_USER=your_gmail@gmail.com
EMAIL_PASS=your_app_password
AWS_ACCESS_KEY_ID=your_aws_key
AWS_SECRET_ACCESS_KEY=your_aws_secret
AWS_REGION=us-east-1
AWS_S3_BUCKET=your-bucket-name
PORT=5001
NODE_ENV=development
```

#### Frontend (.env)
```env
VITE_API_URL=http://localhost:5001
VITE_SOCKET_URL=http://localhost:5001
```

## 🚀 Running the Application

### Development Mode
```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

### Production Mode
```bash
# Backend
cd backend
npm start

# Frontend
cd frontend
npm run build
npm run preview
```

## 📊 System Workflow

### 1. User Registration Flow
1. Admin creates user account
2. System generates random password
3. Password sent via email
4. User logs in and can change password

### 2. Authentication Flow
1. User submits login credentials
2. Server validates against database
3. JWT token generated and stored in HTTP-only cookie
4. Client receives token for API requests

### 3. Data Management Flow
1. Frontend makes API requests
2. Backend validates authentication
3. Database operations performed
4. Real-time updates via Socket.IO
5. Response sent to client

### 4. File Upload Flow
1. User selects file
2. Frontend uploads to backend
3. Multer processes file
4. File stored locally or AWS S3
5. Database updated with file path

## 🔒 Security Features

- **JWT Authentication** with HTTP-only cookies
- **Password Hashing** with bcrypt
- **CORS Configuration** for cross-origin requests
- **Input Validation** on both client and server
- **SQL Injection Protection** via Mongoose
- **File Upload Security** with type validation

## 📱 Responsive Design

- Mobile-first approach
- Responsive data tables
- Adaptive navigation
- Touch-friendly interfaces

## 🧪 Testing & Quality

- **ESLint** for code linting
- **Prettier** for code formatting
- **Husky** for git hooks
- **TypeScript** for type safety
- **Error Boundaries** for error handling

## 📈 Performance Optimizations

- **React Query** for data caching
- **Lazy Loading** for components
- **Image Optimization**
- **Database Indexing**
- **Connection Pooling**

## 🤝 Contributing

1. Fork the repository
2. Create feature branch
3. Make changes
4. Run tests
5. Submit pull request

## 📄 License

This project is licensed under the ISC License.

## 🆘 Support

For support and questions:
- Check the documentation
- Review error logs
- Contact the development team

---

