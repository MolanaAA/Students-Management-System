# Student Management System

A comprehensive MERN (MongoDB, Express.js, React.js, Node.js) stack application for managing students, courses, and academic records in educational institutions.

## 🚀 Features

### Core Functionality
- **Student Management**: Add, edit, delete, and view student records
- **Course Management**: Create and manage courses with detailed information
- **User Authentication**: Secure login/register system with JWT tokens
- **Role-based Access**: Support for admin, faculty, and student roles
- **Dashboard Analytics**: Visual charts and statistics for data insights
- **Responsive Design**: Modern UI built with React Bootstrap

### Student Features
- Complete student profiles with personal information
- Academic records including GPA tracking
- Course enrollment management
- Emergency contact information
- Student status tracking (Active, Inactive, Graduated, Suspended)

### Course Features
- Course creation with detailed descriptions
- Instructor assignment and contact information
- Schedule management (days, times, rooms)
- Capacity and enrollment tracking
- Prerequisites and grading policies
- Department-based organization

### Dashboard Analytics
- Student statistics (total, active, graduated, inactive)
- Course distribution by department
- Average GPA tracking
- Recent students and courses
- Interactive charts using Chart.js

## 🛠️ Technology Stack

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web application framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB object modeling
- **JWT** - Authentication tokens
- **bcryptjs** - Password hashing
- **express-validator** - Input validation
- **cors** - Cross-origin resource sharing

### Frontend
- **React.js** - JavaScript library for building user interfaces
- **React Router** - Client-side routing
- **React Bootstrap** - UI component library
- **Axios** - HTTP client
- **Chart.js** - Data visualization
- **React Hook Form** - Form handling
- **React Toastify** - Notifications
- **React Icons** - Icon library

## 📋 Prerequisites

Before running this application, make sure you have the following installed:
- Node.js (v14 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn package manager

## 🚀 Installation & Setup

### 1. Clone the Repository
```bash
git clone <repository-url>
cd student-management-system
```

### 2. Install Dependencies
```bash
# Install server dependencies
npm install

# Install client dependencies
cd client
npm install
cd ..
```

### 3. Environment Configuration
Create a `.env` file in the root directory:
```bash
# Copy the example environment file
cp env.example .env
```

Edit the `.env` file with your configuration:
```env
# MongoDB Connection String
MONGODB_URI=mongodb://localhost:27017/student_management_system

# JWT Secret Key
JWT_SECRET=your_jwt_secret_key_here_change_this_in_production

# Server Port
PORT=5000

# Node Environment
NODE_ENV=development
```

### 4. Database Setup
Run the setup script to initialize the database with sample data:
```bash
npm run setup
```

This will create:
- Sample users (admin, faculty)
- Sample students
- Sample courses
- Course enrollments

### 5. Start the Application

#### Development Mode
```bash
# Start the server (in one terminal)
npm run dev

# Start the client (in another terminal)
npm run client
```

#### Production Mode
```bash
# Build the client
npm run build

# Start the server
npm start
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## 👥 Default Users

After running the setup script, you can log in with these default accounts:

### Admin User
- **Email**: admin@example.com
- **Password**: admin123
- **Role**: Admin

### Faculty User
- **Email**: faculty@example.com
- **Password**: faculty123
- **Role**: Faculty

## 📁 Project Structure

```
student-management-system/
├── client/                 # React frontend
│   ├── public/
│   └── src/
│       ├── components/     # React components
│       │   ├── auth/       # Authentication components
│       │   ├── courses/    # Course management components
│       │   └── students/   # Student management components
│       ├── context/        # React context providers
│       └── services/       # API services
├── models/                 # MongoDB schemas
├── routes/                 # Express.js routes
├── server.js              # Main server file
├── setup.js               # Database setup script
└── package.json           # Server dependencies
```

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update user profile
- `PUT /api/auth/change-password` - Change password

### Students
- `GET /api/students` - Get all students
- `POST /api/students` - Create new student
- `GET /api/students/:id` - Get student by ID
- `PUT /api/students/:id` - Update student
- `DELETE /api/students/:id` - Delete student
- `GET /api/students/stats/overview` - Get student statistics

### Courses
- `GET /api/courses` - Get all courses
- `POST /api/courses` - Create new course
- `GET /api/courses/:id` - Get course by ID
- `PUT /api/courses/:id` - Update course
- `DELETE /api/courses/:id` - Delete course
- `GET /api/courses/stats/overview` - Get course statistics

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: Bcrypt password encryption
- **Input Validation**: Server-side validation using express-validator
- **CORS Protection**: Cross-origin resource sharing configuration
- **Role-based Access**: Different permissions for different user roles

## 📊 Data Models

### User Model
- Username, email, password
- Role (admin, faculty, student)
- Personal information (name, phone)
- Profile picture support
- Account status and last login tracking

### Student Model
- Student ID, personal information
- Academic details (major, GPA, status)
- Address and emergency contact
- Course enrollments
- Enrollment and graduation dates

### Course Model
- Course code, name, description
- Credits, department, instructor
- Schedule information (days, times, room)
- Capacity and enrollment tracking
- Prerequisites and grading policies

## 🎨 UI/UX Features

- **Responsive Design**: Works on desktop, tablet, and mobile
- **Modern Interface**: Clean and intuitive user experience
- **Interactive Charts**: Data visualization with Chart.js
- **Toast Notifications**: User feedback for actions
- **Form Validation**: Client-side and server-side validation
- **Loading States**: User-friendly loading indicators

## 🚀 Deployment

### Heroku Deployment
The application is configured for Heroku deployment with the following scripts:
- `heroku-postbuild`: Automatically builds the client for production
- `start`: Runs the production server

### Environment Variables for Production
Make sure to set these environment variables in your production environment:
- `MONGODB_URI`: Your MongoDB connection string
- `JWT_SECRET`: A secure JWT secret key
- `NODE_ENV`: Set to "production"

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

If you encounter any issues or have questions:
1. Check the existing issues in the repository
2. Create a new issue with detailed information
3. Contact the development team

## 🔄 Version History

- **v1.0.0** - Initial release with core functionality
  - Student management
  - Course management
  - User authentication
  - Dashboard analytics

---

**Note**: This is a demonstration project. For production use, ensure proper security measures, data validation, and error handling are implemented according to your specific requirements. 