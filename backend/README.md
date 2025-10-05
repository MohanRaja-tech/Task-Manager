# Task Manager Backend API

A secure Node.js/Express backend API for the Task Manager application with MongoDB Atlas integration and JWT authentication.

## 🚀 Features

- **Authentication System**: Secure signup/login with JWT tokens
- **Password Security**: Bcrypt password hashing with salt rounds
- **Database**: MongoDB Atlas cloud database integration
- **Validation**: Input validation with express-validator
- **Security**: Helmet, CORS, rate limiting protection
- **Error Handling**: Comprehensive error handling middleware
- **Environment**: Configuration with dotenv

## 📁 Project Structure

```
backend/
├── src/
│   ├── config/
│   │   └── database.js          # MongoDB connection setup
│   ├── controllers/
│   │   └── authController.js    # Authentication logic
│   ├── middleware/
│   │   ├── auth.js              # JWT authentication middleware
│   │   └── errorHandler.js      # Error handling & rate limiting
│   ├── models/
│   │   └── User.js              # User schema & methods
│   ├── routes/
│   │   └── auth.js              # Authentication routes
│   └── server.js                # Express app entry point
├── .env                         # Environment variables
├── .gitignore                   # Git ignore rules
├── package.json                 # Dependencies & scripts
└── README.md                    # This file
```

## 🛠️ Installation & Setup

1. **Navigate to backend directory:**
   ```bash
   cd backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Environment Setup:**
   The `.env` file is already configured with MongoDB Atlas connection string.
   Update `JWT_SECRET` in production!

4. **Start development server:**
   ```bash
   npm run dev
   ```

5. **Or start production server:**
   ```bash
   npm start
   ```

## 🔌 API Endpoints

### Base URL: `http://localhost:5000`

### Public Endpoints

- `GET /` - API welcome message
- `GET /health` - Health check endpoint
- `POST /api/auth/signup` - User registration
- `POST /api/auth/login` - User login

### Protected Endpoints (Requires JWT Token)

- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update user profile
- `GET /api/auth/test` - Test authentication

## 📝 API Usage Examples

### 1. User Signup
```bash
POST /api/auth/signup
Content-Type: application/json

{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "Password123"
}
```

### 2. User Login
```bash
POST /api/auth/login
Content-Type: application/json

{
  "identifier": "john@example.com", // email or username
  "password": "Password123"
}
```

### 3. Get Profile (Protected)
```bash
GET /api/auth/profile
Authorization: Bearer <your_jwt_token>
```

### 4. Update Profile (Protected)
```bash
PUT /api/auth/profile
Authorization: Bearer <your_jwt_token>
Content-Type: application/json

{
  "username": "newusername",
  "email": "newemail@example.com"
}
```

## 🔒 Authentication Flow

1. User signs up or logs in
2. Server validates credentials
3. JWT token is generated and returned
4. Client stores token (localStorage/sessionStorage)
5. Client includes token in Authorization header for protected routes
6. Server validates token on each protected request

## 🛡️ Security Features

- **Rate Limiting**: 100 requests per 15 minutes (general), 5 requests per 15 minutes (auth)
- **CORS**: Configured for frontend URL
- **Helmet**: Security headers
- **Password Hashing**: Bcrypt with 12 salt rounds
- **JWT**: Secure token-based authentication
- **Input Validation**: Express-validator for request validation
- **Error Handling**: Comprehensive error responses

## 🗄️ Database Schema

### User Model
```javascript
{
  username: String (required, unique, 3-20 chars)
  email: String (required, unique, valid email)
  password: String (required, min 6 chars, hashed)
  role: String (enum: 'user', 'admin', default: 'user')
  isActive: Boolean (default: true)
  lastLogin: Date
  createdAt: Date (auto)
  updatedAt: Date (auto)
}
```

## 🔧 Environment Variables

```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database
JWT_SECRET=your_super_secret_key
JWT_EXPIRES_IN=7d
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:3000
```

## 📊 Response Format

### Success Response
```json
{
  "success": true,
  "message": "Operation successful",
  "data": {
    "user": {...},
    "token": "jwt_token"
  }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error description",
  "errors": [...] // Optional validation errors
}
```

## 🚀 Deployment

1. **Environment**: Update `.env` with production values
2. **Database**: Ensure MongoDB Atlas connection works
3. **JWT Secret**: Use a strong, unique secret key
4. **CORS**: Update CLIENT_URL for production frontend
5. **Process Manager**: Use PM2 or similar for production

## 🧪 Testing

Test the API using tools like:
- Postman
- Insomnia
- curl
- Thunder Client (VS Code extension)

## 📝 Notes

- JWT tokens expire in 7 days (configurable)
- Passwords must contain uppercase, lowercase, and numbers
- Usernames can only contain letters, numbers, and underscores
- All authentication endpoints have rate limiting
- MongoDB connection includes retry logic and error handling
