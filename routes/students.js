const express = require('express');
const router = express.Router();
const Student = require('../models/Student');
const { body, validationResult } = require('express-validator');

// Validation middleware
const validateStudent = [
  body('studentId').notEmpty().withMessage('Student ID is required'),
  body('firstName').notEmpty().withMessage('First name is required'),
  body('lastName').notEmpty().withMessage('Last name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('dateOfBirth').isISO8601().withMessage('Valid date of birth is required'),
  body('gender').isIn(['Male', 'Female', 'Other']).withMessage('Valid gender is required'),
  body('major').notEmpty().withMessage('Major is required')
];

// Get all students
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 10, search, status, major } = req.query;
    
    let query = {};
    
    // Search functionality
    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { studentId: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Filter by status
    if (status) {
      query.status = status;
    }
    
    // Filter by major
    if (major) {
      query.major = { $regex: major, $options: 'i' };
    }
    
    const students = await Student.find(query)
      .populate('courses', 'courseCode courseName credits')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });
    
    const total = await Student.countDocuments(query);
    
    res.json({
      students,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get single student
router.get('/:id', async (req, res) => {
  try {
    const student = await Student.findById(req.params.id)
      .populate('courses', 'courseCode courseName credits instructor schedule');
    
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }
    
    res.json(student);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create new student
router.post('/', validateStudent, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    // Check if student ID or email already exists
    const existingStudent = await Student.findOne({
      $or: [
        { studentId: req.body.studentId },
        { email: req.body.email }
      ]
    });
    
    if (existingStudent) {
      return res.status(400).json({ 
        message: 'Student with this ID or email already exists' 
      });
    }
    
    const student = new Student(req.body);
    const savedStudent = await student.save();
    
    res.status(201).json(savedStudent);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update student
router.put('/:id', validateStudent, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }
    
    // Check if email is being changed and if it's already taken
    if (req.body.email && req.body.email !== student.email) {
      const existingStudent = await Student.findOne({ email: req.body.email });
      if (existingStudent) {
        return res.status(400).json({ message: 'Email already exists' });
      }
    }
    
    const updatedStudent = await Student.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('courses', 'courseCode courseName credits');
    
    res.json(updatedStudent);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete student
router.delete('/:id', async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }
    
    await Student.findByIdAndDelete(req.params.id);
    res.json({ message: 'Student deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get student statistics
router.get('/stats/overview', async (req, res) => {
  try {
    const totalStudents = await Student.countDocuments();
    const activeStudents = await Student.countDocuments({ status: 'Active' });
    const graduatedStudents = await Student.countDocuments({ status: 'Graduated' });
    const inactiveStudents = await Student.countDocuments({ status: 'Inactive' });
    
    // Average GPA
    const avgGPA = await Student.aggregate([
      { $group: { _id: null, avgGPA: { $avg: '$gpa' } } }
    ]);
    
    // Students by major
    const studentsByMajor = await Student.aggregate([
      { $group: { _id: '$major', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    
    res.json({
      totalStudents,
      activeStudents,
      graduatedStudents,
      inactiveStudents,
      averageGPA: avgGPA[0]?.avgGPA || 0,
      studentsByMajor
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Enroll student in course
router.post('/:id/enroll/:courseId', async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }
    
    const courseId = req.params.courseId;
    
    // Check if already enrolled
    if (student.courses.includes(courseId)) {
      return res.status(400).json({ message: 'Student already enrolled in this course' });
    }
    
    student.courses.push(courseId);
    await student.save();
    
    const updatedStudent = await Student.findById(req.params.id)
      .populate('courses', 'courseCode courseName credits');
    
    res.json(updatedStudent);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Remove student from course
router.delete('/:id/enroll/:courseId', async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }
    
    const courseId = req.params.courseId;
    
    // Remove course from student's courses array
    student.courses = student.courses.filter(course => course.toString() !== courseId);
    await student.save();
    
    const updatedStudent = await Student.findById(req.params.id)
      .populate('courses', 'courseCode courseName credits');
    
    res.json(updatedStudent);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router; 