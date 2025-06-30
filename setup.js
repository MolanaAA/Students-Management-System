const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Import models
const User = require('./models/User');
const Student = require('./models/Student');
const Course = require('./models/Course');

// Sample data
const sampleUsers = [
  {
    username: 'admin',
    email: 'admin@example.com',
    password: 'admin123',
    firstName: 'Admin',
    lastName: 'User',
    role: 'admin',
    phone: '123-456-7890'
  },
  {
    username: 'faculty1',
    email: 'faculty@example.com',
    password: 'faculty123',
    firstName: 'Jane',
    lastName: 'Smith',
    role: 'faculty',
    phone: '123-456-7891'
  }
];

const sampleStudents = [
  {
    studentId: 'STU001',
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@student.com',
    phone: '123-456-7892',
    dateOfBirth: '2000-01-15',
    gender: 'Male',
    address: {
      street: '123 Main St',
      city: 'Anytown',
      state: 'CA',
      zipCode: '12345',
      country: 'USA'
    },
    major: 'Computer Science',
    gpa: 3.8,
    status: 'Active'
  },
  {
    studentId: 'STU002',
    firstName: 'Jane',
    lastName: 'Wilson',
    email: 'jane.wilson@student.com',
    phone: '123-456-7893',
    dateOfBirth: '1999-05-20',
    gender: 'Female',
    address: {
      street: '456 Oak Ave',
      city: 'Somewhere',
      state: 'NY',
      zipCode: '67890',
      country: 'USA'
    },
    major: 'Mathematics',
    gpa: 3.9,
    status: 'Active'
  },
  {
    studentId: 'STU003',
    firstName: 'Mike',
    lastName: 'Johnson',
    email: 'mike.johnson@student.com',
    phone: '123-456-7894',
    dateOfBirth: '2001-08-10',
    gender: 'Male',
    address: {
      street: '789 Pine Rd',
      city: 'Elsewhere',
      state: 'TX',
      zipCode: '11111',
      country: 'USA'
    },
    major: 'Physics',
    gpa: 3.5,
    status: 'Active'
  }
];

const sampleCourses = [
  {
    courseCode: 'CS101',
    courseName: 'Introduction to Computer Science',
    description: 'Basic concepts of computer science and programming',
    credits: 3,
    department: 'Computer Science',
    instructor: {
      name: 'Dr. Jane Smith',
      email: 'jane.smith@faculty.com',
      phone: '123-456-7895'
    },
    semester: 'Fall',
    year: 2024,
    capacity: 30,
    schedule: {
      days: ['Monday', 'Wednesday', 'Friday'],
      startTime: '09:00',
      endTime: '10:30',
      room: 'Room 101'
    },
    status: 'Active'
  },
  {
    courseCode: 'MATH201',
    courseName: 'Calculus I',
    description: 'Introduction to differential calculus',
    credits: 4,
    department: 'Mathematics',
    instructor: {
      name: 'Dr. Robert Brown',
      email: 'robert.brown@faculty.com',
      phone: '123-456-7896'
    },
    semester: 'Fall',
    year: 2024,
    capacity: 25,
    schedule: {
      days: ['Tuesday', 'Thursday'],
      startTime: '14:00',
      endTime: '15:30',
      room: 'Room 202'
    },
    status: 'Active'
  },
  {
    courseCode: 'PHYS101',
    courseName: 'General Physics',
    description: 'Fundamental principles of physics',
    credits: 4,
    department: 'Physics',
    instructor: {
      name: 'Dr. Sarah Davis',
      email: 'sarah.davis@faculty.com',
      phone: '123-456-7897'
    },
    semester: 'Fall',
    year: 2024,
    capacity: 35,
    schedule: {
      days: ['Monday', 'Wednesday'],
      startTime: '11:00',
      endTime: '12:30',
      room: 'Room 303'
    },
    status: 'Active'
  }
];

async function setupDatabase() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/student_management_system');
    console.log('Connected to MongoDB successfully');

    // Clear existing data
    console.log('Clearing existing data...');
    await User.deleteMany({});
    await Student.deleteMany({});
    await Course.deleteMany({});

    // Create users
    console.log('Creating sample users...');
    for (const userData of sampleUsers) {
      const user = new User(userData);
      await user.save();
      console.log(`Created user: ${user.username}`);
    }

    // Create courses
    console.log('Creating sample courses...');
    const createdCourses = [];
    for (const courseData of sampleCourses) {
      const course = new Course(courseData);
      const savedCourse = await course.save();
      createdCourses.push(savedCourse);
      console.log(`Created course: ${course.courseCode}`);
    }

    // Create students and enroll them in courses
    console.log('Creating sample students...');
    for (const studentData of sampleStudents) {
      const student = new Student(studentData);
      
      // Enroll students in some courses
      if (createdCourses.length > 0) {
        student.courses = [createdCourses[0]._id]; // Enroll in first course
      }
      
      await student.save();
      console.log(`Created student: ${student.studentId}`);
    }

    console.log('\n✅ Database setup completed successfully!');
    console.log('\nSample login credentials:');
    console.log('Admin: admin@example.com / admin123');
    console.log('Faculty: faculty@example.com / faculty123');
    console.log('\nYou can now start the application and login with these credentials.');

  } catch (error) {
    console.error('❌ Error setting up database:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run setup if this file is executed directly
if (require.main === module) {
  setupDatabase();
}

module.exports = setupDatabase; 