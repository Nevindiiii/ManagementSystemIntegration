# Management System Integration

## Overview

A full-stack management system with React frontend and Node.js backend

## Tech Stack

### Frontend

- React 18 + TypeScript
- Vite (Build tool)
- Tailwind CSS
- Shadcn/ui Components
- Zustand (State management)
- React Query (Data fetching)
- React Router (Navigation)

### Backend

- Node.js + Express
- MongoDB (Database)
- JWT Authentication
- Bcrypt (Password hashing)
- CORS enabled

## Setup Instructions

### Prerequisites

- Node.js (v16+)
- MongoDB
- Git

### Installation

1. **Clone repository**

```bash
git clone <repository-url>
cd MS
```

2. **Backend Setup**

```bash
cd backend
npm install
# Create .env file
cp .env.example .env
# Edit .env with your MongoDB connection
npm start
```

3. **Frontend Setup**

```bash
cd frontend
npm install
# Create .env file
cp .env.example .env
npm run dev
```

## Environment Variables

### Backend (.env)

```
MONGO_URI=mongodb://localhost:27017/management_system
JWT_SECRET=your_jwt_secret_key
PORT=5000
```

### Frontend (.env)

```
VITE_API_URL=http://localhost:5000/api
```

## JWT Implementation

### Token Management

- JWT tokens stored in HTTP-only cookies for security
- Automatic token refresh mechanism
- Secure cookie configuration with SameSite and Secure flags
- Token expiration handling

### Security Features

- HTTP-only cookies prevent XSS attacks
- Secure flag ensures HTTPS-only transmission
- SameSite attribute prevents CSRF attacks
- Automatic logout on token expiration

## Features

### Authentication

- User registration
- Login/Logout
- JWT token management with HTTP-only cookies
- Secure token storage and automatic refresh
- Protected routes

### User Management

- User CRUD operations
- Profile management
- Role-based access

### Product Management

- Product CRUD operations
- Data tables with pagination
- Search and filter

### UI Components

- Responsive design
- Dark/Light theme support
- Modern UI with Shadcn components
- Data visualization

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user (sets HTTP-only cookie)
- `POST /api/auth/logout` - Logout user (clears cookie)
- `GET /api/auth/verify` - Verify JWT token

### Users

- `GET /api/users` - Get all users (paginated)
- `GET /api/users/:id` - Get user by ID
- `POST /api/users` - Create new user
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

### Products

- `GET /api/products` - Get all products (paginated)
- `GET /api/products/:id` - Get product by ID
- `POST /api/products` - Create new product
- `PUT /api/products/:id` - Update product
- `DELETE /api/products/:id` - Delete product

### Profile

- `GET /api/profile/:userId` - Get user profile
- `PUT /api/profile/:userId` - Update user profile
- `POST /api/profile/upload` - Upload profile image

### Settings

- `GET /api/settings` - Get app settings
- `PUT /api/settings` - Update app settings

### Contact

- `POST /api/contact` - Submit contact form

### File Upload

- `POST /api/upload` - Upload files (images, documents)

### Protected Routes

- `GET /api/protected/dashboard` - Dashboard data (requires auth)

## Project Structure

```
MS/
├── backend/                           # Node.js + Express Server
│   ├── config/
│   │   └── db.js                      # MongoDB connection configuration
│   ├── Middleware/
│   │   └── authMiddleware.js          # JWT authentication middleware
│   ├── Models/                        # Mongoose schemas
│   │   ├── AuthModels.js              # Authentication user model
│   │   ├── ProductModels.js           # Product data model
│   │   ├── ProfileModels.js           # User profile model
│   │   ├── SettingsModels.js          # App settings model
│   │   └── UserModels.js              # User management model
│   ├── Routes/                        # API endpoint definitions
│   │   ├── authRoutes.js              # Login, register, logout
│   │   ├── contact.js                 # Contact form handler
│   │   ├── contactRoutes.js           # Contact API routes
│   │   ├── productsRoutes.js          # Product CRUD operations
│   │   ├── profileRoutes.js           # User profile management
│   │   ├── protectedRoutes.js         # JWT-protected endpoints
│   │   ├── settingsRoutes.js          # Settings management
│   │   ├── uploadRoutes.js            # File upload handling
│   │   └── usersRoutes.js             # User CRUD operations
│   ├── scripts/                       # Database migration scripts
│   │   ├── add-role-to-authusers.js   # Add role field to users
│   │   ├── migrate-profile-images-to-s3.js  # S3 migration script
│   │   └── test-user.js               # Test user creation
│   ├── uploads/                       # Local file storage
│   │   └── profiles/                  # Profile image uploads
│   ├── utils/
│   │   └── emailService.js            # Email sending utility
│   ├── .env                           # Environment variables
│   ├── .env.example                   # Environment template
│   ├── package.json                   # Backend dependencies
│   └── server.js                      # Express app entry point
│
├── frontend/                          # React + TypeScript + Vite
│   ├── .husky/                        # Git hooks
│   │   ├── commit-msg                 # Commit message linting
│   │   ├── pre-commit                 # Pre-commit checks
│   │   └── pre-push                   # Pre-push validation
│   ├── public/
│   │   └── vite.svg                   # Static assets
│   ├── src/
│   │   ├── apis/                      # API client functions
│   │   │   ├── product.ts             # Product API calls
│   │   │   └── user.ts                # User API calls
│   │   ├── assets/                    # Images, icons, etc.
│   │   │   └── react.svg
│   │   ├── components/
│   │   │   ├── auth/                  # Route protection
│   │   │   │   ├── ProtectedRoute.tsx # Auth-required wrapper
│   │   │   │   └── PublicRoute.tsx    # Public-only wrapper
│   │   │   ├── customUi/              # Custom reusable components
│   │   │   │   ├── ActivityChart.tsx  # Activity visualization
│   │   │   │   ├── CategoryChart.tsx  # Category charts
│   │   │   │   ├── delete-alert.tsx   # Delete confirmation
│   │   │   │   ├── form.tsx           # Form wrapper
│   │   │   │   ├── loading.tsx        # Loading states
│   │   │   │   ├── NotificationPanel.tsx  # Notifications
│   │   │   │   ├── pagination.tsx     # Pagination controls
│   │   │   │   ├── rows-per-page-select.tsx
│   │   │   │   └── success-alert.tsx  # Success messages
│   │   │   ├── data-table/            # Table components
│   │   │   │   ├── columns.tsx        # Column definitions
│   │   │   │   ├── data-table.tsx     # Main table component
│   │   │   │   └── table-columns-dropdown.tsx
│   │   │   ├── form/                  # Form components
│   │   │   │   ├── add-post-form.tsx
│   │   │   │   └── user-details-dialog.tsx
│   │   │   ├── layout/                # App layout structure
│   │   │   │   ├── layout-header.tsx  # Header component
│   │   │   │   └── layout.tsx         # Main layout wrapper
│   │   │   ├── navbar/                # Navigation components
│   │   │   │   ├── app-sidebar.tsx    # Sidebar navigation
│   │   │   │   ├── FloatingNavbar.tsx # Floating nav
│   │   │   │   └── navItem.tsx        # Nav item component
│   │   │   ├── ui/                    # Shadcn UI components
│   │   │   │   ├── alert-dialog.tsx
│   │   │   │   ├── avatar.tsx
│   │   │   │   ├── badge.tsx
│   │   │   │   ├── birth-date-age-picker.tsx
│   │   │   │   ├── button.tsx
│   │   │   │   ├── calendar.tsx
│   │   │   │   ├── card.tsx
│   │   │   │   ├── checkbox.tsx
│   │   │   │   ├── date-picker.tsx
│   │   │   │   ├── dialog.tsx
│   │   │   │   ├── dropdown-menu.tsx
│   │   │   │   ├── form.tsx
│   │   │   │   ├── input.tsx
│   │   │   │   ├── label.tsx
│   │   │   │   ├── navigation-menu.tsx
│   │   │   │   ├── pagination.tsx
│   │   │   │   ├── phone-input.tsx
│   │   │   │   ├── popover.tsx
│   │   │   │   ├── select.tsx
│   │   │   │   ├── separator.tsx
│   │   │   │   ├── sheet.tsx
│   │   │   │   ├── sidebar.tsx
│   │   │   │   ├── skeleton.tsx
│   │   │   │   ├── switch.tsx
│   │   │   │   ├── table.tsx
│   │   │   │   ├── tabs.tsx
│   │   │   │   └── tooltip.tsx
│   │   │   ├── user-profile/          # Profile components
│   │   │   │   ├── profile-modal.tsx
│   │   │   │   └── profile.tsx
│   │   │   └── ErrorBoundary.tsx      # Error handling
│   │   ├── constants/                 # App constants
│   │   │   ├── navItems.constant.ts   # Navigation items
│   │   │   └── routes.constant.ts     # Route definitions
│   │   ├── contexts/
│   │   │   └── AuthContext.tsx        # Authentication context
│   │   ├── hooks/                     # Custom React hooks
│   │   │   ├── use-mobile.ts          # Mobile detection
│   │   │   ├── useAppTable.ts         # Table state management
│   │   │   ├── useAuthUsers.ts        # Auth user operations
│   │   │   ├── usePagination.ts       # Pagination logic
│   │   │   ├── useProductQueries.ts   # Product data fetching
│   │   │   ├── useServerStatus.ts     # Server health check
│   │   │   ├── useSettings.ts         # Settings management
│   │   │   ├── useSocket.ts           # WebSocket connection
│   │   │   ├── useTheme.ts            # Theme switching
│   │   │   ├── useUser.ts             # User operations
│   │   │   └── useUserQueries.ts      # User data fetching
│   │   ├── lib/
│   │   │   └── utils.ts               # Utility functions
│   │   ├── libs/
│   │   │   └── axios.ts               # Axios configuration
│   │   ├── pages/                     # Page components
│   │   │   ├── admin/
│   │   │   │   └── Dashboard.tsx      # Admin dashboard
│   │   │   ├── auth/
│   │   │   │   ├── loging.tsx         # Login page
│   │   │   │   └── signup.tsx         # Registration page
│   │   │   ├── authUsers/
│   │   │   │   └── index.tsx          # Auth users management
│   │   │   ├── contact/
│   │   │   │   └── Contact.tsx        # Contact form page
│   │   │   ├── NotFound/
│   │   │   │   └── NotFound.tsx       # 404 page
│   │   │   ├── pageA/                 # Users section
│   │   │   │   ├── tables/
│   │   │   │   │   └── table-columns/
│   │   │   │   │       └── users-table.tsx
│   │   │   │   └── users.tsx          # Users page
│   │   │   ├── pageB/                 # Products section
│   │   │   │   ├── tables/
│   │   │   │   │   └── table-columns/
│   │   │   │   │       ├── manual-product-columns.tsx
│   │   │   │   │       └── product-columns.tsx
│   │   │   │   ├── manual-products.tsx
│   │   │   │   └── products.tsx       # Products page
│   │   │   ├── profile/               # User profile page
│   │   │   └── settings/
│   │   │       └── Settings.tsx       # Settings page
│   │   ├── services/
│   │   │   └── authService.ts         # Auth API service
│   │   ├── store/                     # Zustand state stores
│   │   │   ├── notificationStore.ts   # Notification state
│   │   │   ├── postStore.ts           # Post state
│   │   │   ├── settingsStore.ts       # Settings state
│   │   │   └── userStore.ts           # User state
│   │   ├── utils/                     # Utility functions
│   │   │   ├── cloudinary.ts          # Cloudinary integration
│   │   │   ├── functions.ts           # Helper functions
│   │   │   ├── helpers.ts             # General helpers
│   │   │   ├── upload.ts              # File upload utils
│   │   │   └── userStorage.ts         # Local storage utils
│   │   ├── App.tsx                    # Root component
│   │   ├── index.css                  # Global styles
│   │   ├── main.tsx                   # App entry point
│   │   └── vite-env.d.ts              # Vite type definitions
│   ├── .commitlintrc.json             # Commit message rules
│   ├── .env                           # Environment variables
│   ├── .env.example                   # Environment template
│   ├── .gitignore                     # Git ignore rules
│   ├── .prettierignore                # Prettier ignore rules
│   ├── .prettierrc                    # Prettier config
│   ├── commitlint.config.js           # Commitlint config
│   ├── components.json                # Shadcn config
│   ├── eslint.config.js               # ESLint config
│   ├── index.html                     # HTML entry point
│   ├── package.json                   # Frontend dependencies
│   ├── tsconfig.json                  # TypeScript config
│   ├── vite.config.ts                 # Vite config
│   └── yarn.lock                      # Yarn lock file
│
├── .env                               # Root environment variables
├── .gitignore                         # Root git ignore
├── CONTACT_FORM_GUIDE.md              # Contact form documentation
└── README.md                          # This file
```

## Key Dependencies

### Backend

- **express** (v5.1.0) - Web framework
- **mongoose** (v8.19.3) - MongoDB ODM
- **jsonwebtoken** (v9.0.2) - JWT authentication
- **bcryptjs** (v3.0.3) - Password hashing
- **multer** (v2.0.2) - File upload handling
- **socket.io** (v4.8.1) - Real-time communication
- **nodemailer** (v7.0.10) - Email service
- **@aws-sdk/client-s3** (v3.939.0) - AWS S3 integration
- **cookie-parser** (v1.4.7) - Cookie handling
- **cors** (v2.8.5) - Cross-origin resource sharing

### Frontend

- **react** (v19.0.0) - UI library
- **typescript** (v5.7.2) - Type safety
- **vite** (v6.2.0) - Build tool
- **@tanstack/react-query** (v5.90.5) - Data fetching & caching
- **@tanstack/react-table** (v8.21.3) - Table management
- **react-router-dom** (v7.9.4) - Routing
- **zustand** (v5.0.8) - State management
- **axios** (v1.12.2) - HTTP client
- **react-hook-form** (v7.65.0) - Form handling
- **zod** (v4.1.12) - Schema validation
- **tailwindcss** (v4.1.17) - Styling
- **shadcn/ui** - UI component library
- **lucide-react** (v0.548.0) - Icons
- **chart.js** (v4.5.1) - Data visualization
- **socket.io-client** (v4.8.1) - WebSocket client

### Development Tools

- **ESLint** (v9.21.0) - Code linting
- **Prettier** (v3.5.3) - Code formatting
- **Husky** (v8.0.0) - Git hooks
- **Commitlint** (v19.8.0) - Commit message linting
- **lint-staged** (v15.5.0) - Pre-commit linting

## Development

### Running in Development

```bash
# Backend (Terminal 1)
cd backend
npm install
npm run dev

# Frontend (Terminal 2)
cd frontend
npm install
npm run dev
```

### Available Scripts

#### Backend

```bash
npm start              # Start production server
npm run dev            # Start development server
npm run migrate:profiles  # Migrate profile images to S3
```

#### Frontend

```bash
npm run dev            # Start dev server (http://localhost:5173)
npm run build          # Build for production
npm run preview        # Preview production build
npm run lint           # Run ESLint
npm run lint:fix       # Fix ESLint errors
npm run format         # Check code formatting
npm run format:write   # Format code with Prettier
npm run type-check     # TypeScript type checking
npm run validate       # Run all checks (format, lint, build)
npm run validate:fix   # Fix all issues and build
```

### Building for Production

```bash
# Frontend build
cd frontend
npm run build
# Output: dist/ folder

# Backend (production mode)
cd backend
npm start
```

## Database Scripts

```bash
# Add role field to existing auth users
node scripts/add-role-to-authusers.js

# Migrate profile images to AWS S3
node scripts/migrate-profile-images-to-s3.js

# Create test user
node scripts/test-user.js
```

## Code Quality & Standards

### Git Hooks (Husky)

- **pre-commit**: Runs lint-staged (Prettier + ESLint) and TypeScript build
- **pre-push**: Runs full production build check
- **commit-msg**: Validates commit messages using Commitlint

### Commit Message Format

Follows [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: add new feature
fix: bug fix
docs: documentation changes
style: code style changes
refactor: code refactoring
test: add tests
chore: maintenance tasks
```

### Code Formatting

- **Prettier**: Automatic code formatting
- **ESLint**: Code quality and best practices
- **TypeScript**: Type safety and IntelliSense

## Deployment

### Frontend Deployment

1. Build the application:
   ```bash
   cd frontend
   npm run build
   ```
2. Deploy `dist/` folder to:
   - Vercel
   - Netlify
   - AWS S3 + CloudFront
   - Any static hosting service

### Backend Deployment

1. Set environment variables on hosting platform
2. Deploy to:
   - AWS EC2
   - Heroku
   - DigitalOcean
   - Railway
   - Render

### Environment Configuration

Ensure all environment variables are set:

- MongoDB connection string
- JWT secret key
- AWS S3 credentials (if using)
- Email service credentials (if using)
- CORS allowed origins

## Troubleshooting

### Common Issues

**MongoDB Connection Error**

```bash
# Check MongoDB is running
mongod --version
# Start MongoDB service
sudo systemctl start mongod  # Linux
brew services start mongodb-community  # macOS
```

**Port Already in Use**

```bash
# Change PORT in .env file
# Backend: PORT=5001
# Frontend: Update VITE_API_URL accordingly
```

**CORS Errors**

- Verify CORS configuration in backend/server.js
- Check VITE_API_URL in frontend/.env
- Ensure credentials are included in API requests

**JWT Token Issues**

- Clear browser cookies
- Check JWT_SECRET is set in backend/.env
- Verify token expiration settings

## Testing

### Manual Testing

1. Start backend and frontend servers
2. Test authentication flow (register, login, logout)
3. Test CRUD operations for users and products
4. Test file upload functionality
5. Test protected routes

### API Testing

Use tools like:

- Postman
- Thunder Client (VS Code extension)
- curl commands

## Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'feat: add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

### Contribution Guidelines

- Follow existing code style
- Write meaningful commit messages
- Update documentation as needed
- Test your changes thoroughly
- Ensure all checks pass before submitting PR

## License

MIT License

## Support

For issues and questions:

- Create an issue in the repository
- Contact the development team
- Check CONTACT_FORM_GUIDE.md for contact form setup

## Roadmap

- [ ] Add unit and integration tests
- [ ] Implement role-based access control (RBAC)
- [ ] Add email verification for registration
- [ ] Implement password reset functionality
- [ ] Add data export/import features
- [ ] Implement advanced search and filtering
- [ ] Add real-time notifications
- [ ] Create mobile-responsive design improvements
- [ ] Add API rate limiting
- [ ] Implement caching strategies

## Acknowledgments

- [Shadcn/ui](https://ui.shadcn.com/) - UI component library
- [TanStack Query](https://tanstack.com/query) - Data fetching
- [Zustand](https://zustand-demo.pmnd.rs/) - State management
- [Tailwind CSS](https://tailwindcss.com/) - Styling framework
