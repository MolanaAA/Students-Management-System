import React, { useState, useEffect } from 'react';
import { Container, Card, Form, Button, Row, Col } from 'react-bootstrap';
import { useNavigate, useParams } from 'react-router-dom';
import { FaSave, FaArrowLeft } from 'react-icons/fa';
import api from '../../services/api';
import { toast } from 'react-toastify';

const CourseForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});

  const [formData, setFormData] = useState({
    courseCode: '',
    courseName: '',
    description: '',
    credits: '',
    department: '',
    instructor: {
      name: '',
      email: '',
      phone: ''
    },
    semester: '',
    year: new Date().getFullYear(),
    capacity: '',
    schedule: {
      days: [],
      startTime: '',
      endTime: '',
      room: ''
    },
    status: 'Active'
  });

  const isEditing = !!id;

  useEffect(() => {
    if (isEditing) {
      fetchCourse();
    }
  }, [id]);

  const fetchCourse = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/api/courses/${id}`);
      const course = response.data;
      
      setFormData({
        courseCode: course.courseCode || '',
        courseName: course.courseName || '',
        description: course.description || '',
        credits: course.credits || '',
        department: course.department || '',
        instructor: {
          name: course.instructor?.name || '',
          email: course.instructor?.email || '',
          phone: course.instructor?.phone || ''
        },
        semester: course.semester || '',
        year: course.year || new Date().getFullYear(),
        capacity: course.capacity || '',
        schedule: {
          days: course.schedule?.days || [],
          startTime: course.schedule?.startTime || '',
          endTime: course.schedule?.endTime || '',
          room: course.schedule?.room || ''
        },
        status: course.status || 'Active'
      });
    } catch (error) {
      console.error('Error fetching course:', error);
      toast.error('Failed to load course data');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleDayChange = (day) => {
    setFormData(prev => ({
      ...prev,
      schedule: {
        ...prev.schedule,
        days: prev.schedule.days.includes(day)
          ? prev.schedule.days.filter(d => d !== day)
          : [...prev.schedule.days, day]
      }
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.courseCode) newErrors.courseCode = 'Course code is required';
    if (!formData.courseName) newErrors.courseName = 'Course name is required';
    if (!formData.credits) newErrors.credits = 'Credits are required';
    if (!formData.department) newErrors.department = 'Department is required';
    if (!formData.instructor.name) newErrors['instructor.name'] = 'Instructor name is required';
    if (!formData.semester) newErrors.semester = 'Semester is required';
    if (!formData.capacity) newErrors.capacity = 'Capacity is required';

    if (formData.credits && (formData.credits < 1 || formData.credits > 6)) {
      newErrors.credits = 'Credits must be between 1 and 6';
    }

    if (formData.capacity && formData.capacity < 1) {
      newErrors.capacity = 'Capacity must be at least 1';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setSaving(true);
    
    try {
      const submitData = {
        ...formData,
        credits: parseInt(formData.credits),
        capacity: parseInt(formData.capacity),
        year: parseInt(formData.year)
      };

      if (isEditing) {
        await api.put(`/api/courses/${id}`, submitData);
        toast.success('Course updated successfully!');
      } else {
        await api.post('/api/courses', submitData);
        toast.success('Course created successfully!');
      }
      
      navigate('/courses');
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to save course';
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Container>
        <div className="loading-spinner">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </Container>
    );
  }

  return (
    <Container>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>{isEditing ? 'Edit Course' : 'Add New Course'}</h2>
        <Button variant="outline-secondary" onClick={() => navigate('/courses')}>
          <FaArrowLeft className="me-2" />
          Back to Courses
        </Button>
      </div>

      <Card>
        <Card.Header>
          <h5 className="mb-0">Course Information</h5>
        </Card.Header>
        <Card.Body>
          <Form onSubmit={handleSubmit}>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Course Code *</Form.Label>
                  <Form.Control
                    type="text"
                    name="courseCode"
                    value={formData.courseCode}
                    onChange={handleChange}
                    isInvalid={!!errors.courseCode}
                    placeholder="Enter course code"
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.courseCode}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Course Name *</Form.Label>
                  <Form.Control
                    type="text"
                    name="courseName"
                    value={formData.courseName}
                    onChange={handleChange}
                    isInvalid={!!errors.courseName}
                    placeholder="Enter course name"
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.courseName}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Enter course description"
              />
            </Form.Group>

            <Row>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Credits *</Form.Label>
                  <Form.Control
                    type="number"
                    name="credits"
                    value={formData.credits}
                    onChange={handleChange}
                    isInvalid={!!errors.credits}
                    min="1"
                    max="6"
                    placeholder="Enter credits"
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.credits}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Department *</Form.Label>
                  <Form.Control
                    type="text"
                    name="department"
                    value={formData.department}
                    onChange={handleChange}
                    isInvalid={!!errors.department}
                    placeholder="Enter department"
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.department}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Status</Form.Label>
                  <Form.Select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                    <option value="Completed">Completed</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

            <hr />

            <h6>Instructor Information</h6>
            <Row>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Instructor Name *</Form.Label>
                  <Form.Control
                    type="text"
                    name="instructor.name"
                    value={formData.instructor.name}
                    onChange={handleChange}
                    isInvalid={!!errors['instructor.name']}
                    placeholder="Enter instructor name"
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors['instructor.name']}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Instructor Email</Form.Label>
                  <Form.Control
                    type="email"
                    name="instructor.email"
                    value={formData.instructor.email}
                    onChange={handleChange}
                    placeholder="Enter instructor email"
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Instructor Phone</Form.Label>
                  <Form.Control
                    type="tel"
                    name="instructor.phone"
                    value={formData.instructor.phone}
                    onChange={handleChange}
                    placeholder="Enter instructor phone"
                  />
                </Form.Group>
              </Col>
            </Row>

            <hr />

            <h6>Schedule Information</h6>
            <Row>
              <Col md={3}>
                <Form.Group className="mb-3">
                  <Form.Label>Semester *</Form.Label>
                  <Form.Select
                    name="semester"
                    value={formData.semester}
                    onChange={handleChange}
                    isInvalid={!!errors.semester}
                  >
                    <option value="">Select semester</option>
                    <option value="Fall">Fall</option>
                    <option value="Spring">Spring</option>
                    <option value="Summer">Summer</option>
                  </Form.Select>
                  <Form.Control.Feedback type="invalid">
                    {errors.semester}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={3}>
                <Form.Group className="mb-3">
                  <Form.Label>Year</Form.Label>
                  <Form.Control
                    type="number"
                    name="year"
                    value={formData.year}
                    onChange={handleChange}
                    min="2020"
                    max="2030"
                  />
                </Form.Group>
              </Col>
              <Col md={3}>
                <Form.Group className="mb-3">
                  <Form.Label>Capacity *</Form.Label>
                  <Form.Control
                    type="number"
                    name="capacity"
                    value={formData.capacity}
                    onChange={handleChange}
                    isInvalid={!!errors.capacity}
                    min="1"
                    placeholder="Enter capacity"
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.capacity}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={3}>
                <Form.Group className="mb-3">
                  <Form.Label>Room</Form.Label>
                  <Form.Control
                    type="text"
                    name="schedule.room"
                    value={formData.schedule.room}
                    onChange={handleChange}
                    placeholder="Enter room"
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Start Time</Form.Label>
                  <Form.Control
                    type="time"
                    name="schedule.startTime"
                    value={formData.schedule.startTime}
                    onChange={handleChange}
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>End Time</Form.Label>
                  <Form.Control
                    type="time"
                    name="schedule.endTime"
                    value={formData.schedule.endTime}
                    onChange={handleChange}
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Days</Form.Label>
                  <div>
                    {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => (
                      <Form.Check
                        key={day}
                        inline
                        type="checkbox"
                        label={day}
                        checked={formData.schedule.days.includes(day)}
                        onChange={() => handleDayChange(day)}
                      />
                    ))}
                  </div>
                </Form.Group>
              </Col>
            </Row>

            <div className="d-flex justify-content-end gap-2">
              <Button
                variant="secondary"
                onClick={() => navigate('/courses')}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                disabled={saving}
                className="d-flex align-items-center"
              >
                <FaSave className="me-2" />
                {saving ? 'Saving...' : (isEditing ? 'Update Course' : 'Create Course')}
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default CourseForm; 