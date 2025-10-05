# Task Manager - Full Stack Application

A comprehensive task management application built with React.js frontend and Node.js backend, featuring user authentication, admin panel, task timer functionality, and more.

## 🚀 Features

- **User Authentication**: Secure login/signup with JWT tokens
- **Task Management**: Create, edit, delete, and organize tasks
- **Task Timer**: Start/stop timers to track time spent on tasks
- **Priority & Status**: Set task priorities and track status
- **Admin Panel**: Administrative dashboard with user management
- **Responsive Design**: Mobile-friendly interface
- **Real-time Updates**: Live task updates and notifications

## 🛠️ Tech Stack

### Frontend
- **React.js** with Vite
- **Framer Motion** for animations
- **Lucide React** for icons
- **Date-fns** for date formatting
- **React Router** for navigation

### Backend
- **Node.js** with Express.js
- **MongoDB** with Mongoose ODM
- **JWT** for authentication
- **Express Validator** for input validation
- **Google OAuth** integration

## 📦 Project Structure

```
Task-Manager/
├── react-app/          # Frontend React application
│   ├── src/
│   │   ├── components/  # React components
│   │   ├── contexts/    # React contexts (Auth, etc.)
│   │   ├── services/    # API services
│   │   └── config/      # Configuration files
│   └── package.json
├── backend/            # Backend Node.js application
│   ├── src/
│   │   ├── controllers/ # Route controllers
│   │   ├── middleware/  # Express middleware
│   │   ├── models/      # MongoDB models
│   │   ├── routes/      # API routes
│   │   └── config/      # Database config
│   └── package.json
└── README.md
```

## 🚀 Deployment

### Deploying to Vercel

#### Prerequisites
1. GitHub account
2. Vercel account
3. MongoDB Atlas database

#### Backend Deployment (Vercel)
1. **Prepare your repository**:
   ```bash
   git add .
   git commit -m "Prepare for deployment"
   git push origin master
   ```

2. **Deploy Backend to Vercel**:
   - Create `vercel.json` in backend directory:
   ```json
   {
     "version": 2,
     "builds": [
       {
         "src": "src/server.js",
         "use": "@vercel/node"
       }
     ],
     "routes": [
       {
         "src": "/(.*)",
         "dest": "src/server.js"
       }
     ]
   }
   ```

3. **Set Environment Variables in Vercel**:
   - Go to Vercel Dashboard → Project → Settings → Environment Variables
   - Add these variables:
   ```
   MONGODB_URI=your_mongodb_atlas_connection_string
   JWT_SECRET=your_jwt_secret_key
   JWT_EXPIRES_IN=7d
   NODE_ENV=production
   GOOGLE_CLIENT_ID=your_google_client_id
   GOOGLE_CLIENT_SECRET=your_google_client_secret
   CLIENT_URL=https://your-frontend-domain.vercel.app
   ```

#### Frontend Deployment (Vercel)
1. **Set Frontend Environment Variables**:
   ```
   VITE_API_URL=https://your-backend-domain.vercel.app/api
   VITE_AUTH_URL=https://your-backend-domain.vercel.app/api/auth
   ```

2. **Deploy Frontend**:
   - Import your GitHub repository to Vercel
   - Set root directory to `react-app`
   - Build command: `npm run build`
   - Output directory: `dist`

### Environment Variables

#### Backend (.env)
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/taskmanager
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRES_IN=7d
PORT=5000
NODE_ENV=production
CLIENT_URL=https://your-frontend-domain.vercel.app
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

#### Frontend (.env)
```env
VITE_API_URL=https://your-backend-domain.vercel.app/api
VITE_AUTH_URL=https://your-backend-domain.vercel.app/api/auth
```

## 🔧 Local Development

### Prerequisites
- Node.js (v18 or higher)
- MongoDB (local or Atlas)
- Git

### Setup

1. **Clone the repository**:
   ```bash
   git clone https://github.com/MohanRaja-tech/Task-Manager.git
   cd Task-Manager
   ```

2. **Backend Setup**:
   ```bash
   cd backend
   npm install
   cp .env.example .env
   # Edit .env with your configuration
   npm start
   ```

3. **Frontend Setup**:
   ```bash
   cd react-app
   npm install
   cp .env.example .env
   # Edit .env with your configuration
   npm run dev
   ```

4. **Access the application**:
   - Frontend: http://localhost:5173
   - Backend: http://localhost:5000

## 🔐 Admin Access

Default admin credentials:
- **Email**: admin@gmail.com
- **Password**: admin@2006

## 📝 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile

### Tasks
- `GET /api/tasks` - Get all user tasks
- `POST /api/tasks` - Create new task
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task
- `PATCH /api/tasks/:id/start` - Start task timer
- `PATCH /api/tasks/:id/stop` - Stop task timer

### Admin
- `GET /api/admin/stats` - Get admin statistics
- `GET /api/admin/users` - Get all users
- `GET /api/admin/login-attempts` - Get login attempts

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🔒 Security Notes

- Never commit `.env` files or API keys to version control
- Use strong JWT secrets in production
- Enable CORS only for trusted domains
- Regularly update dependencies
- Use HTTPS in production

## 📞 Support

For support, email mohankarthikeyan2006@gmail.com or create an issue in the repository.

---

**Happy Task Managing! 🎯**