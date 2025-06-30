const express = require('express');
const router = express.Router();
const Course = require('../models/Course');
const Student = require('../models/Student');
const { body, validationResult } = require('express-validator');

// Validation middleware
const validateCourse = [
  body('courseCode').notEmpty().withMessage('Course code is required'),
  body('courseName').notEmpty().withMessage('Course name is required'),
  body('credits').isInt({ min: 1, max: 6 }).withMessage('Credits must be between 1 and 6'),
  body('department').notEmpty().withMessage('Department is required'),
  body('instructor.name').notEmpty().withMessage('Instructor name is required'),
  body('semester').isIn(['Fall', 'Spring', 'Summer']).withMessage('Valid semester is required'),
  body('year').isInt({ min: 2020 }).withMessage('Valid year is required'),
  body('capacity').isInt({ min: 1 }).withMessage('Capacity must be at least 1')
];

// Get all courses
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 10, search, department, semester, status } = req.query;
    
    let query = {};
    
    // Search functionality
    if (search) {
      query.$or = [
        { courseCode: { $regex: search, $options: 'i' } },
        { courseName: { $regex: search, $options: 'i' } },
        { 'instructor.name': { $regex: search, $options: 'i' } }
      ];
    }
    
    // Filter by department
    if (department) {
      query.department = { $regex: department, $options: 'i' };
    }
    
    // Filter by semester
    if (semester) {
      query.semester = semester;
    }
    
    // Filter by status
    if (status) {
      query.status = status;
    }
    
    const courses = await Course.find(query)
      .populate('prerequisites', 'courseCode courseName')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });
    
    const total = await Course.countDocuments(query);
    
    res.json({
      courses,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get single course
router.get('/:id', async (req, res) => {
  try {
    const course = await Course.findById(req.params.id)
      .populate('prerequisites', 'courseCode courseName description');
    
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }
    
    // Get enrolled students
    const enrolledStudents = await Student.find({ courses: req.params.id })
      .select('studentId firstName lastName email major gpa');
    
    res.json({
      course,
      enrolledStudents
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create new course
router.post('/', validateCourse, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    // Check if course code already exists
    const existingCourse = await Course.findOne({ courseCode: req.body.courseCode });
    if (existingCourse) {
      return res.status(400).json({ message: 'Course with this code already exists' });
    }
    
    const course = new Course(req.body);
    const savedCourse = await course.save();
    
    res.status(201).json(savedCourse);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update course
router.put('/:id', validateCourse, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }
    
    // Check if course code is being changed and if it's already taken
    if (req.body.courseCode && req.body.courseCode !== course.courseCode) {
      const existingCourse = await Course.findOne({ courseCode: req.body.courseCode });
      if (existingCourse) {
        return res.status(400).json({ message: 'Course code already exists' });
      }
    }
    
    const updatedCourse = await Course.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('prerequisites', 'courseCode courseName');
    
    res.json(updatedCourse);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete course
router.delete('/:id', async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }
    
    // Check if any students are enrolled in this course
    const enrolledStudents = await Student.countDocuments({ courses: req.params.id });
    if (enrolledStudents > 0) {
      return res.status(400).json({ 
        message: `Cannot delete course. ${enrolledStudents} student(s) are enrolled.` 
      });
    }
    
    await Course.findByIdAndDelete(req.params.id);
    res.json({ message: 'Course deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get course statistics
router.get('/stats/overview', async (req, res) => {
  try {
    const totalCourses = await Course.countDocuments();
    const activeCourses = await Course.countDocuments({ status: 'Active' });
    const completedCourses = await Course.countDocuments({ status: 'Completed' });
    
    // Average enrollment
    const avgEnrollment = await Course.aggregate([
      { $group: { _id: null, avgEnrollment: { $avg: '$enrolledStudents' } } }
    ]);
    
    // Courses by department
    const coursesByDepartment = await Course.aggregate([
      { $group: { _id: '$department', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    
    // Most enrolled courses
    const mostEnrolledCourses = await Course.find()
      .sort({ enrolledStudents: -1 })
      .limit(5)
      .select('courseCode courseName enrolledStudents capacity');
    
    res.json({
      totalCourses,
      activeCourses,
      completedCourses,
      averageEnrollment: avgEnrollment[0]?.avgEnrollment || 0,
      coursesByDepartment,
      mostEnrolledCourses
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Enroll student in course
router.post('/:id/enroll/:studentId', async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }
    
    const student = await Student.findById(req.params.studentId);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }
    
    // Check if course is full
    if (course.enrolledStudents >= course.capacity) {
      return res.status(400).json({ message: 'Course is full' });
    }
    
    // Check if student is already enrolled
    if (student.courses.includes(req.params.id)) {
      return res.status(400).json({ message: 'Student already enrolled in this course' });
    }
    
    // Add course to student's courses
    student.courses.push(req.params.id);
    await student.save();
    
    // Increment enrolled students count
    course.enrolledStudents += 1;
    await course.save();
    
    res.json({ message: 'Student enrolled successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Remove student from course
router.delete('/:id/enroll/:studentId', async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }
    
    const student = await Student.findById(req.params.studentId);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }
    
    // Check if student is enrolled
    if (!student.courses.includes(req.params.id)) {
      return res.status(400).json({ message: 'Student is not enrolled in this course' });
    }
    
    // Remove course from student's courses
    student.courses = student.courses.filter(course => course.toString() !== req.params.id);
    await student.save();
    
    // Decrement enrolled students count
    course.enrolledStudents = Math.max(0, course.enrolledStudents - 1);
    await course.save();
    
    res.json({ message: 'Student removed from course successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get available courses for enrollment
router.get('/available/enrollment', async (req, res) => {
  try {
    const courses = await Course.find({
      status: 'Active',
      $expr: { $lt: ['$enrolledStudents', '$capacity'] }
    })
    .select('courseCode courseName credits department instructor schedule enrolledStudents capacity')
    .sort({ courseName: 1 });
    
    res.json(courses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router; 