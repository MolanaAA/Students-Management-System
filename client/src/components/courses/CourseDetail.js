import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Badge, Button, Table } from 'react-bootstrap';
import { useParams, useNavigate } from 'react-router-dom';
import { FaEdit, FaArrowLeft, FaBook, FaUser, FaClock, FaMapMarkerAlt } from 'react-icons/fa';
import api from '../../services/api';
import { toast } from 'react-toastify';

const CourseDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [enrolledStudents, setEnrolledStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCourse();
  }, [id]);

  const fetchCourse = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/api/courses/${id}`);
      setCourse(response.data.course);
      setEnrolledStudents(response.data.enrolledStudents || []);
    } catch (error) {
      console.error('Error fetching course:', error);
      toast.error('Failed to load course data');
      navigate('/courses');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const variants = {
      'Active': 'success',
      'Inactive': 'warning',
      'Completed': 'info'
    };
    return <Badge bg={variants[status] || 'secondary'}>{status}</Badge>;
  };

  const formatSchedule = (schedule) => {
    if (!schedule || !schedule.days || schedule.days.length === 0) {
      return 'No schedule set';
    }
    
    const days = schedule.days.join(', ');
    const time = schedule.startTime && schedule.endTime 
      ? `${schedule.startTime} - ${schedule.endTime}`
      : 'Time not set';
    
    return `${days} at ${time}`;
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

  if (!course) {
    return (
      <Container>
        <div className="alert alert-danger">Course not found</div>
      </Container>
    );
  }

  return (
    <Container>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Course Details</h2>
        <div>
          <Button
            variant="outline-secondary"
            onClick={() => navigate('/courses')}
            className="me-2"
          >
            <FaArrowLeft className="me-2" />
            Back to Courses
          </Button>
          <Button
            variant="primary"
            onClick={() => navigate(`/courses/${id}/edit`)}
          >
            <FaEdit className="me-2" />
            Edit Course
          </Button>
        </div>
      </div>

      <Row>
        <Col md={8}>
          {/* Basic Information */}
          <Card className="mb-4">
            <Card.Header>
              <h5 className="mb-0">
                <FaBook className="me-2" />
                Course Information
              </h5>
            </Card.Header>
            <Card.Body>
              <Row>
                <Col md={6}>
                  <p><strong>Course Code:</strong> {course.courseCode}</p>
                  <p><strong>Course Name:</strong> {course.courseName}</p>
                  <p><strong>Department:</strong> {course.department}</p>
                  <p><strong>Credits:</strong> {course.credits}</p>
                </Col>
                <Col md={6}>
                  <p><strong>Semester:</strong> {course.semester}</p>
                  <p><strong>Year:</strong> {course.year}</p>
                  <p><strong>Status:</strong> {getStatusBadge(course.status)}</p>
                  <p><strong>Enrollment:</strong> {course.enrolledStudents}/{course.capacity}</p>
                </Col>
              </Row>
              
              {course.description && (
                <div className="mt-3">
                  <strong>Description:</strong>
                  <p className="mt-2">{course.description}</p>
                </div>
              )}
            </Card.Body>
          </Card>

          {/* Instructor Information */}
          <Card className="mb-4">
            <Card.Header>
              <h5 className="mb-0">
                <FaUser className="me-2" />
                Instructor Information
              </h5>
            </Card.Header>
            <Card.Body>
              <Row>
                <Col md={4}>
                  <p><strong>Name:</strong> {course.instructor?.name}</p>
                </Col>
                <Col md={4}>
                  <p><strong>Email:</strong> {course.instructor?.email || 'N/A'}</p>
                </Col>
                <Col md={4}>
                  <p><strong>Phone:</strong> {course.instructor?.phone || 'N/A'}</p>
                </Col>
              </Row>
            </Card.Body>
          </Card>

          {/* Schedule Information */}
          <Card className="mb-4">
            <Card.Header>
              <h5 className="mb-0">
                <FaClock className="me-2" />
                Schedule Information
              </h5>
            </Card.Header>
            <Card.Body>
              <Row>
                <Col md={6}>
                  <p><strong>Schedule:</strong> {formatSchedule(course.schedule)}</p>
                </Col>
                <Col md={6}>
                  <p><strong>Room:</strong> {course.schedule?.room || 'N/A'}</p>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>

        <Col md={4}>
          {/* Enrolled Students */}
          <Card>
            <Card.Header>
              <h5 className="mb-0">
                <FaUser className="me-2" />
                Enrolled Students ({enrolledStudents.length})
              </h5>
            </Card.Header>
            <Card.Body>
              {enrolledStudents.length > 0 ? (
                <Table responsive>
                  <thead>
                    <tr>
                      <th>Student ID</th>
                      <th>Name</th>
                      <th>Major</th>
                    </tr>
                  </thead>
                  <tbody>
                    {enrolledStudents.map((student) => (
                      <tr key={student._id}>
                        <td>{student.studentId}</td>
                        <td>{student.firstName} {student.lastName}</td>
                        <td>{student.major}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              ) : (
                <p className="text-muted">No students enrolled</p>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default CourseDetail; 