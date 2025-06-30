import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table } from 'react-bootstrap';
import { FaUsers, FaBook, FaGraduationCap, FaChartLine } from 'react-icons/fa';
import { Line, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import api from '../services/api';
import { toast } from 'react-toastify';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const Dashboard = () => {
  const [stats, setStats] = useState({
    students: {},
    courses: {}
  });
  const [recentStudents, setRecentStudents] = useState([]);
  const [recentCourses, setRecentCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch student statistics
      const studentStatsResponse = await api.get('/api/students/stats/overview');
      
      // Fetch course statistics
      const courseStatsResponse = await api.get('/api/courses/stats/overview');
      
      // Fetch recent students
      const recentStudentsResponse = await api.get('/api/students?limit=5');
      
      // Fetch recent courses
      const recentCoursesResponse = await api.get('/api/courses?limit=5');
      
      setStats({
        students: studentStatsResponse.data,
        courses: courseStatsResponse.data
      });
      
      setRecentStudents(recentStudentsResponse.data.students || []);
      setRecentCourses(recentCoursesResponse.data.courses || []);
      
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const studentChartData = {
    labels: ['Active', 'Graduated', 'Inactive'],
    datasets: [
      {
        label: 'Students by Status',
        data: [
          stats.students.activeStudents || 0,
          stats.students.graduatedStudents || 0,
          stats.students.inactiveStudents || 0
        ],
        backgroundColor: [
          'rgba(54, 162, 235, 0.6)',
          'rgba(75, 192, 192, 0.6)',
          'rgba(255, 99, 132, 0.6)'
        ],
        borderColor: [
          'rgba(54, 162, 235, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(255, 99, 132, 1)'
        ],
        borderWidth: 1,
      },
    ],
  };

  const courseChartData = {
    labels: stats.courses.coursesByDepartment?.map(item => item._id) || [],
    datasets: [
      {
        label: 'Courses by Department',
        data: stats.courses.coursesByDepartment?.map(item => item.count) || [],
        backgroundColor: 'rgba(102, 126, 234, 0.6)',
        borderColor: 'rgba(102, 126, 234, 1)',
        borderWidth: 1,
      },
    ],
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
    <Container fluid>
      <h2 className="mb-4">Dashboard</h2>
      
      {/* Statistics Cards */}
      <Row className="mb-4">
        <Col md={3}>
          <Card className="stats-card">
            <Card.Body>
              <FaUsers size={40} className="mb-3" />
              <h3>{stats.students.totalStudents || 0}</h3>
              <p>Total Students</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="stats-card">
            <Card.Body>
              <FaBook size={40} className="mb-3" />
              <h3>{stats.courses.totalCourses || 0}</h3>
              <p>Total Courses</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="stats-card">
            <Card.Body>
              <FaGraduationCap size={40} className="mb-3" />
              <h3>{stats.students.activeStudents || 0}</h3>
              <p>Active Students</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="stats-card">
            <Card.Body>
              <FaChartLine size={40} className="mb-3" />
              <h3>{(stats.students.averageGPA || 0).toFixed(2)}</h3>
              <p>Average GPA</p>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Charts */}
      <Row className="mb-4">
        <Col md={6}>
          <Card>
            <Card.Header>
              <h5 className="mb-0">Students by Status</h5>
            </Card.Header>
            <Card.Body>
              <Bar 
                data={studentChartData}
                options={{
                  responsive: true,
                  plugins: {
                    legend: {
                      position: 'top',
                    },
                  },
                }}
              />
            </Card.Body>
          </Card>
        </Col>
        <Col md={6}>
          <Card>
            <Card.Header>
              <h5 className="mb-0">Courses by Department</h5>
            </Card.Header>
            <Card.Body>
              <Bar 
                data={courseChartData}
                options={{
                  responsive: true,
                  plugins: {
                    legend: {
                      position: 'top',
                    },
                  },
                }}
              />
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Recent Data */}
      <Row>
        <Col md={6}>
          <Card>
            <Card.Header>
              <h5 className="mb-0">Recent Students</h5>
            </Card.Header>
            <Card.Body>
              <Table responsive>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Student ID</th>
                    <th>Major</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recentStudents.map((student) => (
                    <tr key={student._id}>
                      <td>{student.firstName} {student.lastName}</td>
                      <td>{student.studentId}</td>
                      <td>{student.major}</td>
                      <td>
                        <span className={`badge bg-${
                          student.status === 'Active' ? 'success' :
                          student.status === 'Graduated' ? 'info' :
                          student.status === 'Inactive' ? 'warning' : 'danger'
                        }`}>
                          {student.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Col>
        <Col md={6}>
          <Card>
            <Card.Header>
              <h5 className="mb-0">Recent Courses</h5>
            </Card.Header>
            <Card.Body>
              <Table responsive>
                <thead>
                  <tr>
                    <th>Course Code</th>
                    <th>Course Name</th>
                    <th>Instructor</th>
                    <th>Enrolled</th>
                  </tr>
                </thead>
                <tbody>
                  {recentCourses.map((course) => (
                    <tr key={course._id}>
                      <td>{course.courseCode}</td>
                      <td>{course.courseName}</td>
                      <td>{course.instructor?.name}</td>
                      <td>
                        {course.enrolledStudents}/{course.capacity}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Dashboard; 