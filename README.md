# Bug Logger - Full Stack MERN Application

A comprehensive bug tracking and project management application built with the MERN stack (MongoDB, Express.js, React, Node.js).

## Features

### Authentication
- User registration and login with JWT authentication
- Role-based access (Admin/Developer)
- Secure password hashing with bcrypt
- Persistent login sessions

### Project Management
- Create and view projects
- Responsive project dashboard
- Project-specific issue tracking

### Issue/Ticket Management
- Create, read, update, and delete issues
- Priority levels (Low, Medium, High)
- Status tracking (Open, Closed)
- Detailed issue descriptions
- Issue filtering and sorting

### UI/UX
- Modern, responsive design using Tailwind CSS
- Clean and intuitive interface
- Mobile-friendly layout
- Real-time updates

## Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for fast development
- **Tailwind CSS** for styling
- **shadcn/ui** for UI components
- **Lucide React** for icons

### Backend
- **Node.js** with Express.js
- **MongoDB** with Mongoose ODM
- **JWT** for authentication
- **bcryptjs** for password hashing
- **CORS** for cross-origin requests

## Getting Started

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local installation or MongoDB Atlas)
- npm or yarn package manager

### Installation

1. **Clone the repository**
   \`\`\`bash
   git clone <repository-url>
   cd bug-logger
   \`\`\`

2. **Install Backend Dependencies**
   \`\`\`bash
   cd scripts
   npm install
   \`\`\`

3. **Install Frontend Dependencies**
   \`\`\`bash
   cd ..
   npm install
   \`\`\`

4. **Setup Environment Variables**
   Create a `.env` file in the scripts directory:
   \`\`\`env
   MONGODB_URI=mongodb://localhost:27017/buglogger
   JWT_SECRET=your-super-secret-jwt-key
   PORT=5000
   \`\`\`

5. **Setup Database**
   \`\`\`bash
   cd scripts
   node setup-database.js
   \`\`\`

6. **Start the Backend Server**
   \`\`\`bash
   node server.js
   \`\`\`

7. **Start the Frontend Development Server**
   \`\`\`bash
   cd ..
   npm run dev
   \`\`\`

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Projects
- `GET /api/projects` - Get all projects
- `POST /api/projects` - Create new project

### Issues
- `GET /api/issues/:projectId` - Get issues for project
- `POST /api/issues` - Create new issue
- `PUT /api/issues/:id` - Update issue
- `DELETE /api/issues/:id` - Delete issue

## User Roles

### Admin
- Full access to all features
- Can manage all projects and issues
- First registered user becomes Admin

### Developer
- Can create and manage projects
- Can create, edit, and delete issues
- Standard user role for subsequent registrations

## Database Schema

### Users
\`\`\`javascript
{
  email: String (unique),
  password: String (hashed),
  role: String (Admin/Developer),
  timestamps: true
}
\`\`\`

### Projects
\`\`\`javascript
{
  name: String,
  description: String,
  creator: ObjectId (User reference),
  timestamps: true
}
\`\`\`

### Issues
\`\`\`javascript
{
  title: String,
  description: String,
  priority: String (low/medium/high),
  status: String (open/closed),
  project: ObjectId (Project reference),
  timestamps: true
}
\`\`\`

## Development

### Frontend Development
The frontend is built with React and uses modern hooks and functional components. Key features:
- TypeScript for type safety
- Responsive design with Tailwind CSS
- Component-based architecture
- State management with React hooks

### Backend Development
The backend follows RESTful API principles:
- Express.js for routing and middleware
- Mongoose for MongoDB object modeling
- JWT for stateless authentication
- Error handling and validation

## Deployment

### Frontend Deployment
Build the frontend for production:
\`\`\`bash
npm run build
\`\`\`

### Backend Deployment
The backend can be deployed to platforms like:
- Heroku
- Vercel
- DigitalOcean
- AWS

Make sure to set environment variables in your deployment platform.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.
