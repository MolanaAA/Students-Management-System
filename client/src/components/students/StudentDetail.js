import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Badge, Button, Table } from 'react-bootstrap';
import { useParams, useNavigate } from 'react-router-dom';
import { FaEdit, FaArrowLeft, FaUser, FaMapMarkerAlt, FaPhone, FaEnvelope, FaGraduationCap } from 'react-icons/fa';
import api from '../../services/api';
import { toast } from 'react-toastify';

const StudentDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStudent();
  }, [id]);

  const fetchStudent = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/api/students/${id}`);
      setStudent(response.data);
    } catch (error) {
      console.error('Error fetching student:', error);
      toast.error('Failed to load student data');
      navigate('/students');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const variants = {
      'Active': 'success',
      'Inactive': 'warning',
      'Graduated': 'info',
      'Suspended': 'danger'
    };
    return <Badge bg={variants[status] || 'secondary'}>{status}</Badge>;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  const calculateAge = (dateOfBirth) => {
    if (!dateOfBirth) return 'N/A';
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
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

  if (!student) {
    return (
      <Container>
        <Alert variant="danger">Student not found</Alert>
      </Container>
    );
  }

  return (
    <Container>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Student Details</h2>
        <div>
          <Button
            variant="outline-secondary"
            onClick={() => navigate('/students')}
            className="me-2"
          >
            <FaArrowLeft className="me-2" />
            Back to Students
          </Button>
          <Button
            variant="primary"
            onClick={() => navigate(`/students/${id}/edit`)}
          >
            <FaEdit className="me-2" />
            Edit Student
          </Button>
        </div>
      </div>

      <Row>
        <Col md={8}>
          {/* Basic Information */}
          <Card className="mb-4">
            <Card.Header>
              <h5 className="mb-0">
                <FaUser className="me-2" />
                Basic Information
              </h5>
            </Card.Header>
            <Card.Body>
              <Row>
                <Col md={6}>
                  <p><strong>Student ID:</strong> {student.studentId}</p>
                  <p><strong>Name:</strong> {student.firstName} {student.lastName}</p>
                  <p><strong>Email:</strong> {student.email}</p>
                  <p><strong>Phone:</strong> {student.phone || 'N/A'}</p>
                </Col>
                <Col md={6}>
                  <p><strong>Date of Birth:</strong> {formatDate(student.dateOfBirth)}</p>
                  <p><strong>Age:</strong> {calculateAge(student.dateOfBirth)} years</p>
                  <p><strong>Gender:</strong> {student.gender}</p>
                  <p><strong>Status:</strong> {getStatusBadge(student.status)}</p>
                </Col>
              </Row>
            </Card.Body>
          </Card>

          {/* Academic Information */}
          <Card className="mb-4">
            <Card.Header>
              <h5 className="mb-0">
                <FaGraduationCap className="me-2" />
                Academic Information
              </h5>
            </Card.Header>
            <Card.Body>
              <Row>
                <Col md={6}>
                  <p><strong>Major:</strong> {student.major}</p>
                  <p><strong>GPA:</strong> {student.gpa?.toFixed(2) || 'N/A'}</p>
                </Col>
                <Col md={6}>
                  <p><strong>Enrollment Date:</strong> {formatDate(student.enrollmentDate)}</p>
                  <p><strong>Graduation Date:</strong> {formatDate(student.graduationDate) || 'N/A'}</p>
                </Col>
              </Row>
            </Card.Body>
          </Card>

          {/* Address Information */}
          {student.address && (
            <Card className="mb-4">
              <Card.Header>
                <h5 className="mb-0">
                  <FaMapMarkerAlt className="me-2" />
                  Address Information
                </h5>
              </Card.Header>
              <Card.Body>
                <p><strong>Street:</strong> {student.address.street || 'N/A'}</p>
                <p><strong>City:</strong> {student.address.city || 'N/A'}</p>
                <p><strong>State:</strong> {student.address.state || 'N/A'}</p>
                <p><strong>ZIP Code:</strong> {student.address.zipCode || 'N/A'}</p>
                <p><strong>Country:</strong> {student.address.country || 'N/A'}</p>
              </Card.Body>
            </Card>
          )}

          {/* Emergency Contact */}
          {student.emergencyContact && (
            <Card className="mb-4">
              <Card.Header>
                <h5 className="mb-0">
                  <FaPhone className="me-2" />
                  Emergency Contact
                </h5>
              </Card.Header>
              <Card.Body>
                <Row>
                  <Col md={6}>
                    <p><strong>Name:</strong> {student.emergencyContact.name || 'N/A'}</p>
                    <p><strong>Relationship:</strong> {student.emergencyContact.relationship || 'N/A'}</p>
                  </Col>
                  <Col md={6}>
                    <p><strong>Phone:</strong> {student.emergencyContact.phone || 'N/A'}</p>
                    <p><strong>Email:</strong> {student.emergencyContact.email || 'N/A'}</p>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          )}
        </Col>

        <Col md={4}>
          {/* Enrolled Courses */}
          <Card>
            <Card.Header>
              <h5 className="mb-0">
                <FaGraduationCap className="me-2" />
                Enrolled Courses
              </h5>
            </Card.Header>
            <Card.Body>
              {student.courses && student.courses.length > 0 ? (
                <Table responsive>
                  <thead>
                    <tr>
                      <th>Course Code</th>
                      <th>Course Name</th>
                      <th>Credits</th>
                    </tr>
                  </thead>
                  <tbody>
                    {student.courses.map((course) => (
                      <tr key={course._id}>
                        <td>{course.courseCode}</td>
                        <td>{course.courseName}</td>
                        <td>{course.credits}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              ) : (
                <p className="text-muted">No courses enrolled</p>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default StudentDetail; 