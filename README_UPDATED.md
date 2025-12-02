# Management System (MS) - Complete Implementation Guide

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

### 1. API Integration & Backend Routes

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
GET    /          # Get all users with pagination & search
POST   /add       # Create new user with validation
GET    /:id       # Get specific user by ID
PUT    /:id       # Update user information
DELETE /:id       # Delete user with Socket.IO notification
```

#### Product Routes (`/api/products`)
```javascript
GET    /          # Get all products with filtering
POST   /          # Create new product
PUT    /:id       # Update product
DELETE /:id       # Delete product
```

#### File Upload Routes (`/api/upload`)
```javascript
POST   /profile-image    # Upload profile image to AWS S3
```

#### Profile & Settings Routes
```javascript
GET    /api/profile      # Get user profile
PUT    /api/profile      # Update profile information
GET    /api/settings     # Get system settings
PUT    /api/settings     # Update settings
```

#### Contact Routes (`/api/contact`)
```javascript
POST   /          # Send contact form email via Nodemailer
```

### 2. MongoDB Integration & Database Models

#### User Model (UserModels.js)
```javascript
const userSchema = new mongoose.Schema({
  id: { type: Number, required: true, unique: true },
  firstName: { type: String, required: true, maxlength: 50 },
  lastName: { type: String, required: true, maxlength: 50 },
  age: { type: Number, required: true, min: 1, max: 120 },
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true },
  birthDate: { type: Date, required: true }
}, { timestamps: true });
```

#### Auth Model (AuthModels.js)
```javascript
const authSchema = new mongoose.Schema({
  name: { type: String, required: true, maxlength: 50 },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true, minlength: 6 },
  role: { type: String, enum: ['user', 'admin'], default: 'user' }
}, { timestamps: true });

// Password hashing middleware
authSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});
```

#### Database Connection (db.js)
```javascript
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

### 3. User Authentication & JWT Implementation

#### JWT Token Generation & Verification
```javascript
// Generate JWT Token
export const generateToken = (user) => {
  return jwt.sign(
    {
      userId: user._id,
      email: user.email,
      name: user.name,
      role: user.role || "user",
    },
    process.env.JWT_SECRET,
    { expiresIn: "1h" }
  );
};

// Verify Token Middleware
export const verifyToken = async (req, res, next) => {
  try {
    const token = req.cookies.auth_token;
    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Access denied. No token provided."
      });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await AuthUser.findById(decoded.userId).select("-password");
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid token. User not found."
      });
    }
    
    req.user = user;
    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Token expired. Please login again."
      });
    }
    res.status(401).json({ success: false, message: "Invalid token." });
  }
};
```

#### Login Process with HTTP-Only Cookies
```javascript
// Login Route
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  
  // Find user and validate password
  const user = await Auth.findOne({ email });
  const isPasswordValid = await user.comparePassword(password);
  
  if (!isPasswordValid) {
    return res.status(401).json({
      success: false,
      message: "Invalid email or password"
    });
  }
  
  // Generate JWT token
  const token = generateToken(user);
  
  // Set HTTP-only cookie
  res.cookie("auth_token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  });
  
  res.json({
    success: true,
    message: "Login successful",
    token: token,
    user: { id: user._id, name: user.name, email: user.email }
  });
});
```

### 4. Role-Based Authentication

#### Role Verification Middleware
```javascript
// Check Admin Role
export const requireAdmin = async (req, res, next) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: "Access denied. Admin privileges required."
      });
    }
    next();
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error checking user permissions"
    });
  }
};

// Protected Route Usage
router.get('/admin-only', verifyToken, requireAdmin, (req, res) => {
  res.json({ message: "Admin access granted" });
});
```

#### Frontend Route Protection
```typescript
// Protected Route Component
export const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('http://localhost:5001/api/auth/verify', {
          credentials: 'include'
        });
        setIsAuthenticated(response.ok);
      } catch (error) {
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, []);
  
  if (loading) return <div>Loading...</div>;
  if (!isAuthenticated) return <Navigate to="/" replace />;
  
  return <>{children}</>;
};
```

### 5. Backend Pagination Handling

#### User Pagination Implementation
```javascript
// GET all users with pagination
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    const totalUsers = await User.countDocuments();
    const users = await User.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    
    res.json({
      success: true,
      users: users.map(user => ({
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        age: user.age,
        email: user.email,
        phone: user.phone,
        birthDate: user.birthDate.toISOString().split('T')[0]
      })),
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalUsers / limit),
        totalUsers: totalUsers,
        limit: limit,
        hasNextPage: page < Math.ceil(totalUsers / limit),
        hasPrevPage: page > 1
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Unable to load users',
      error: error.message
    });
  }
});
```

#### Frontend Pagination Hook
```typescript
// usePagination Hook
export const usePagination = (initialPage = 1, initialLimit = 10) => {
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [limit, setLimit] = useState(initialLimit);
  
  const goToPage = (page: number) => setCurrentPage(page);
  const nextPage = () => setCurrentPage(prev => prev + 1);
  const prevPage = () => setCurrentPage(prev => Math.max(1, prev - 1));
  
  return {
    currentPage,
    limit,
    setLimit,
    goToPage,
    nextPage,
    prevPage
  };
};
```

### 6. Backend Notification Handling (Socket.IO)

#### Socket.IO Server Setup
```javascript
// Server.js - Socket.IO Configuration
const io = new Server(httpServer, {
  cors: {
    origin: ["http://localhost:5173", "http://localhost:5174"],
    credentials: true,
  },
});

// Socket connection handling
io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);
  
  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
});

// Make io accessible to routes
app.set("io", io);
```

#### Real-time Notifications in Routes
```javascript
// User Creation with Socket Notification
router.post('/add', async (req, res) => {
  try {
    const savedUser = await newUser.save();
    
    // Emit Socket.IO event
    const io = req.app.get('io');
    io.emit('user:added', {
      id: savedUser.id,
      firstName: savedUser.firstName,
      lastName: savedUser.lastName,
      email: savedUser.email,
    });
    
    res.status(201).json({ success: true, message: "User created" });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// User Update with Socket Notification
router.put('/:id', async (req, res) => {
  try {
    const updatedUser = await User.findOneAndUpdate(/* ... */);
    
    // Emit Socket.IO event
    const io = req.app.get('io');
    io.emit('user:updated', {
      id: updatedUser.id,
      firstName: updatedUser.firstName,
      lastName: updatedUser.lastName,
      email: updatedUser.email,
    });
    
    res.json({ success: true, message: "User updated" });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// User Deletion with Socket Notification
router.delete('/:id', async (req, res) => {
  try {
    const deletedUser = await User.findOneAndDelete({ id: userId });
    
    // Emit Socket.IO event
    const io = req.app.get('io');
    io.emit('user:deleted', {
      id: deletedUser.id,
      firstName: deletedUser.firstName,
      lastName: deletedUser.lastName,
    });
    
    res.json({ success: true, message: "User deleted" });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});
```

#### Frontend Socket.IO Integration
```typescript
// useSocket Hook
export const useSocket = () => {
  const socketRef = useRef<Socket | null>(null);
  const addNotification = useNotificationStore((state) => state.addNotification);

  useEffect(() => {
    socketRef.current = io('http://localhost:5001', {
      transports: ['websocket', 'polling'],
    });

    const socket = socketRef.current;

    // Listen for user added event
    socket.on('user:added', (data) => {
      const message = `${data.firstName} ${data.lastName} (ID: ${data.id})`;
      addNotification({
        type: 'added',
        title: 'New User Added',
        message,
      });
      toast.success(`New user added: ${data.firstName} ${data.lastName}`, {
        description: `ID: ${data.id} | Email: ${data.email}`,
      });
    });

    // Listen for user updated event
    socket.on('user:updated', (data) => {
      toast.info(`User updated: ${data.firstName} ${data.lastName}`);
    });

    // Listen for user deleted event
    socket.on('user:deleted', (data) => {
      toast.error(`User deleted: ${data.firstName} ${data.lastName}`);
    });

    return () => socket.disconnect();
  }, [addNotification]);

  return socketRef.current;
};
```

### 7. Email Services Integration

#### Nodemailer.js Implementation
```javascript
// Email Service (emailService.js)
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransporter({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Send Contact Form Email
export const sendContactEmail = async (name, email, subject, message) => {
  // Email to admin
  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: 'admin@company.com',
    subject: `Contact Form: ${subject}`,
    html: `
      <h2>New Contact Message</h2>
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Subject:</strong> ${subject}</p>
      <p><strong>Message:</strong></p>
      <p>${message}</p>
    `,
  });

  // Auto-reply to user
  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Thank you for contacting us!',
    html: `
      <h2>Thank You for Reaching Out!</h2>
      <p>Dear ${name},</p>
      <p>We have received your message and will get back to you soon.</p>
      <p><strong>Your Message:</strong></p>
      <p><em>${message}</em></p>
    `,
  });
};

// Send Auto-Generated Password Email
const sendPasswordEmail = async (name, email, password) => {
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
      <p style="color: red;">⚠️ Please login and change your password immediately.</p>
    `,
  };
  
  return await transporter.sendMail(mailOptions);
};
```

#### EmailJS Frontend Integration
```typescript
// EmailJS Service (emailService.ts)
import emailjs from '@emailjs/browser';

const SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID;
const WELCOME_TEMPLATE_ID = import.meta.env.VITE_EMAILJS_WELCOME_TEMPLATE_ID;
const PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

export const sendWelcomeEmail = async (userName: string, userEmail: string) => {
  try {
    const templateParams = {
      name: userName,
      to_name: userName,
      email: userEmail,
      app_name: 'Management System',
      from_name: 'Management System Team',
    };

    const response = await emailjs.send(
      SERVICE_ID,
      WELCOME_TEMPLATE_ID,
      templateParams,
      PUBLIC_KEY
    );
    
    console.log('Email sent successfully:', response);
    return response;
  } catch (error: any) {
    console.error('Failed to send welcome email:', error);
    throw error;
  }
};
```

### 8. File Upload Handling

#### AWS S3 Integration
```javascript
// AWS S3 Upload Route (uploadRoutes.js)
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import multer from 'multer';

const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

router.post('/profile-image', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const fileName = `profiles/profile-${Date.now()}-${req.file.originalname}`;
    
    const command = new PutObjectCommand({
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: fileName,
      Body: req.file.buffer,
      ContentType: req.file.mimetype
    });
    
    await s3Client.send(command);
    const imageUrl = `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileName}`;
    
    res.json({ url: imageUrl });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Upload failed', message: error.message });
  }
});
```

#### Cloudinary Integration
```typescript
// Cloudinary Upload (cloudinary.ts)
import axios from 'axios';

export interface CloudinaryResponse {
  secure_url: string;
  public_id: string;
  url: string;
}

export const uploadToCloudinary = async (file: File): Promise<string> => {
  const cloudName = import.meta.env.VITE_CLOUD_NAME;
  const uploadPreset = import.meta.env.VITE_CLOUD_UPLOAD_PRESET;
  const folder = import.meta.env.VITE_CLOUD_FOLDER || 'products';

  if (!cloudName || !uploadPreset) {
    throw new Error('Cloudinary configuration missing');
  }

  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', uploadPreset);
  formData.append('folder', folder);

  try {
    const response = await axios.post<CloudinaryResponse>(
      `https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`,
      formData
    );
    return response.data.secure_url;
  } catch (error) {
    console.error('Cloudinary upload failed:', error);
    throw new Error('Failed to upload image');
  }
};
```

### 9. Page-wise File Handling

#### Dashboard Page Files
```
/pages/admin/Dashboard.tsx          # Main dashboard with analytics
/components/customUi/ActivityChart.tsx    # User activity charts
/components/customUi/CategoryChart.tsx    # Category distribution charts
/hooks/useServerStatus.ts           # Server health monitoring
```

#### User Management Page Files
```
/pages/pageA/users.tsx              # User listing page
/pages/pageA/tables/table-columns/users-table.tsx  # User table columns
/components/form/user-details-dialog.tsx  # User form dialog
/hooks/useUserQueries.ts            # User API queries
/apis/user.ts                       # User API endpoints
```

#### Product Management Page Files
```
/pages/pageB/products.tsx           # Product listing page
/pages/pageB/manual-products.tsx    # Manual product entry
/pages/pageB/tables/table-columns/product-columns.tsx  # Product table
/hooks/useProductQueries.ts         # Product API queries
/apis/product.ts                    # Product API endpoints
```

#### Authentication Page Files
```
/pages/auth/loging.tsx              # Login page
/pages/auth/signup.tsx              # Signup page
/components/auth/ProtectedRoute.tsx # Route protection
/components/auth/PublicRoute.tsx    # Public route handling
/contexts/AuthContext.tsx           # Authentication context
/services/authService.ts            # Auth API services
```

#### Profile Management Page Files
```
/pages/profile/                     # Profile page directory
/components/user-profile/profile.tsx      # Profile component
/components/user-profile/profile-modal.tsx # Profile edit modal
/hooks/useUser.ts                   # User profile hooks
```

#### Settings Page Files
```
/pages/settings/Settings.tsx       # Settings page
/hooks/useSettings.ts               # Settings management
/store/settingsStore.ts             # Settings state management
```

#### Contact Page Files
```
/pages/contact/Contact.tsx          # Contact form page
/services/emailService.ts           # EmailJS integration
/backend/Routes/contact.js          # Contact API route
/backend/utils/emailService.js      # Nodemailer service
```

#### Common UI Components Files
```
/components/ui/                     # Radix UI components
/components/customUi/               # Custom UI components
/components/data-table/             # Reusable data tables
/components/layout/                 # Layout components
/components/navbar/                 # Navigation components
```

#### State Management Files
```
/store/userStore.ts                 # User state (Zustand)
/store/postStore.ts                 # Post state management
/store/notificationStore.ts         # Notification state
/store/settingsStore.ts             # Settings state
```

#### Utility Files
```
/utils/functions.ts                 # Helper functions
/utils/helpers.ts                   # Utility helpers
/utils/upload.ts                    # File upload utilities
/utils/cloudinary.ts                # Cloudinary integration
/utils/userStorage.ts               # Local storage utilities
```

#### Backend Model Files
```
/backend/Models/UserModels.js       # User database model
/backend/Models/AuthModels.js       # Authentication model
/backend/Models/ProductModels.js    # Product database model
/backend/Models/ProfileModels.js    # Profile model
/backend/Models/SettingsModels.js   # Settings model
```

#### Backend Route Files
```
/backend/Routes/usersRoutes.js      # User CRUD operations
/backend/Routes/authRoutes.js       # Authentication routes
/backend/Routes/productsRoutes.js   # Product management
/backend/Routes/profileRoutes.js    # Profile management
/backend/Routes/uploadRoutes.js     # File upload handling
/backend/Routes/settingsRoutes.js   # Settings management
/backend/Routes/contact.js          # Contact form handling
```

#### Backend Middleware Files
```
/backend/Middleware/authMiddleware.js  # JWT authentication
/backend/utils/emailService.js      # Email utilities
/backend/config/db.js               # Database configuration
```

## 🛠️ Installation & Setup

### Prerequisites
- Node.js (v18+)
- MongoDB (local or cloud)
- Git
- Gmail account (for email services)
- AWS S3 account (for file uploads)
- Cloudinary account (optional)

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
# Database Configuration
MONGO_URI=mongodb://localhost:27017/management_system
# or MongoDB Atlas
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/management_system

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_here

# Email Configuration (Nodemailer)
EMAIL_USER=your_gmail@gmail.com
EMAIL_PASS=your_gmail_app_password

# AWS S3 Configuration
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
AWS_REGION=us-east-1
AWS_BUCKET_NAME=your-s3-bucket-name

# Server Configuration
PORT=5001
NODE_ENV=development
```

#### Frontend (.env)
```env
# API Configuration
VITE_API_URL=http://localhost:5001
VITE_SOCKET_URL=http://localhost:5001

# EmailJS Configuration
VITE_EMAILJS_SERVICE_ID=your_emailjs_service_id
VITE_EMAILJS_WELCOME_TEMPLATE_ID=your_template_id
VITE_EMAILJS_PUBLIC_KEY=your_emailjs_public_key

# Cloudinary Configuration (Optional)
VITE_CLOUD_NAME=your_cloudinary_cloud_name
VITE_CLOUD_UPLOAD_PRESET=your_upload_preset
VITE_CLOUD_FOLDER=products
```

### 5. Email Service Setup

#### Gmail App Password Setup
1. Enable 2-Factor Authentication on Gmail
2. Go to Google Account Settings
3. Security → App passwords
4. Generate app password for "Mail"
5. Use this password in `EMAIL_PASS`

#### EmailJS Setup
1. Create account at [EmailJS](https://www.emailjs.com/)
2. Create email service (Gmail/Outlook)
3. Create email template
4. Get Service ID, Template ID, and Public Key

### 6. AWS S3 Setup
1. Create AWS account
2. Create S3 bucket
3. Create IAM user with S3 permissions
4. Get Access Key and Secret Key
5. Configure CORS policy for bucket

### 7. MongoDB Setup
#### Local MongoDB
```bash
# Install MongoDB locally
# Start MongoDB service
mongod --dbpath /path/to/data/directory
```

#### MongoDB Atlas (Cloud)
1. Create account at [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create cluster
3. Create database user
4. Whitelist IP addresses
5. Get connection string

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

**Built with ❤️ using modern web technologies**