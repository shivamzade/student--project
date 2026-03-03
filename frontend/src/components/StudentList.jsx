import React, { useState, useEffect } from 'react';
import { Table, Button, Badge, Pagination, Spinner, Alert, Card, Row, Col, Form } from 'react-bootstrap';
import { studentApi } from '../services/api';
import StudentForm from './StudentForm';
import Swal from 'sweetalert2';

const StudentList = () => {
  const [students, setStudents] = useState([]);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
    limit: 5,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);

  const fetchStudents = async (page = 1, limit = 5) => {
    setLoading(true);
    setError(null);
    try {
      const response = await studentApi.getStudents(page, limit);
      setStudents(response.data.data);
      setPagination({
        currentPage: response.data.currentPage,
        totalPages: response.data.totalPages,
        totalCount: response.data.totalCount,
        limit: response.data.limit,
      });
    } catch (err) {
      setError('Failed to fetch students. Please make sure the backend server is running.');
      console.error('Error fetching students:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= pagination.totalPages) {
      fetchStudents(page, pagination.limit);
    }
  };

  const handleLimitChange = (e) => {
    const newLimit = parseInt(e.target.value);
    fetchStudents(1, newLimit);
  };

  const handleAdd = () => {
    setSelectedStudent(null);
    setShowModal(true);
  };

  const handleEdit = async (id) => {
    try {
      const response = await studentApi.getStudentById(id);
      setSelectedStudent(response.data);
      setShowModal(true);
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Error!',
        text: 'Failed to fetch student details.',
      });
    }
  };

  const handleDelete = async (id, name) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: `You are about to delete ${name}. This action cannot be undone!`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel',
    });

    if (result.isConfirmed) {
      try {
        await studentApi.deleteStudent(id);
        Swal.fire({
          icon: 'success',
          title: 'Deleted!',
          text: 'Student has been deleted successfully.',
          timer: 2000,
          showConfirmButton: false,
        });
        fetchStudents(pagination.currentPage, pagination.limit);
      } catch (err) {
        Swal.fire({
          icon: 'error',
          title: 'Error!',
          text: 'Failed to delete student.',
        });
      }
    }
  };

  const handleSave = () => {
    fetchStudents(pagination.currentPage, pagination.limit);
  };

  const renderPagination = () => {
    const items = [];
    const { currentPage, totalPages } = pagination;

    // Previous button
    items.push(
      <Pagination.Prev
        key="prev"
        onClick={() => handlePageChange(currentPage - 1)}
        disabled={currentPage === 1}
      />
    );

    // Page numbers
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    if (startPage > 1) {
      items.push(<Pagination.Item key={1} onClick={() => handlePageChange(1)}>{1}</Pagination.Item>);
      if (startPage > 2) {
        items.push(<Pagination.Ellipsis key="start-ellipsis" disabled />);
      }
    }

    for (let page = startPage; page <= endPage; page++) {
      items.push(
        <Pagination.Item
          key={page}
          active={page === currentPage}
          onClick={() => handlePageChange(page)}
        >
          {page}
        </Pagination.Item>
      );
    }

    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        items.push(<Pagination.Ellipsis key="end-ellipsis" disabled />);
      }
      items.push(
        <Pagination.Item key={totalPages} onClick={() => handlePageChange(totalPages)}>
          {totalPages}
        </Pagination.Item>
      );
    }

    // Next button
    items.push(
      <Pagination.Next
        key="next"
        onClick={() => handlePageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
      />
    );

    return items;
  };

  const getAverageScore = (marks) => {
    if (!marks || marks.length === 0) return 'N/A';
    const total = marks.reduce((sum, mark) => sum + parseFloat(mark.score || 0), 0);
    return (total / marks.length).toFixed(1);
  };

  const getGradeBadge = (grade) => {
    if (!grade) return <Badge bg="secondary">N/A</Badge>;
    const gradeColorMap = {
      'A': 'success',
      'B': 'primary',
      'C': 'info',
      'D': 'warning',
      'F': 'danger',
    };
    const color = gradeColorMap[grade.toUpperCase()] || 'secondary';
    return <Badge bg={color}>{grade}</Badge>;
  };

  return (
    <div className="student-list">
      <Card className="mb-4 shadow">
        <Card.Header className="bg-primary text-white">
          <Row className="align-items-center">
            <Col>
              <h4 className="mb-0">Student Management System</h4>
            </Col>
            <Col className="text-end">
              <Button variant="light" onClick={handleAdd}>
                + Add New Student
              </Button>
            </Col>
          </Row>
        </Card.Header>
        <Card.Body>
          {error && (
            <Alert variant="danger" dismissible onClose={() => setError(null)}>
              {error}
            </Alert>
          )}

          {loading ? (
            <div className="text-center py-5">
              <Spinner animation="border" variant="primary" />
              <p className="mt-2">Loading students...</p>
            </div>
          ) : (
            <>
              <div className="table-responsive">
                <Table striped hover className="align-middle">
                  <thead className="table-dark">
                    <tr>
                      <th>#</th>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Age</th>
                      <th>Grade</th>
                      <th>Subjects</th>
                      <th>Avg Score</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {students.length === 0 ? (
                      <tr>
                        <td colSpan="8" className="text-center py-4">
                          <Alert variant="info">No students found. Add a new student to get started!</Alert>
                        </td>
                      </tr>
                    ) : (
                      students.map((student, index) => (
                        <tr key={student.id}>
                          <td>{(pagination.currentPage - 1) * pagination.limit + index + 1}</td>
                          <td>
                            <strong>{student.name}</strong>
                          </td>
                          <td>{student.email}</td>
                          <td>{student.age || 'N/A'}</td>
                          <td>{getGradeBadge(student.grade)}</td>
                          <td>
                            {student.marks?.length > 0 ? (
                              <div>
                                {student.marks.map((mark, idx) => (
                                  <Badge bg="secondary" className="me-1 mb-1" key={idx}>
                                    {mark.subject}: {mark.score}
                                  </Badge>
                                ))}
                              </div>
                            ) : (
                              <span className="text-muted">No marks</span>
                            )}
                          </td>
                          <td>
                            <Badge bg={parseFloat(getAverageScore(student.marks)) >= 60 ? 'success' : 'warning'}>
                              {getAverageScore(student.marks)}
                            </Badge>
                          </td>
                          <td>
                            <Button
                              variant="outline-primary"
                              size="sm"
                              className="me-1"
                              onClick={() => handleEdit(student.id)}
                            >
                              Edit
                            </Button>
                            <Button
                              variant="outline-danger"
                              size="sm"
                              onClick={() => handleDelete(student.id, student.name)}
                            >
                              Delete
                            </Button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </Table>
              </div>

              {students.length > 0 && (
                <Row className="align-items-center mt-3">
                  <Col md={4}>
                    <div className="d-flex align-items-center">
                      <span className="me-2">Show:</span>
                      <Form.Select
                        size="sm"
                        style={{ width: '80px' }}
                        value={pagination.limit}
                        onChange={handleLimitChange}
                      >
                        <option value={5}>5</option>
                        <option value={10}>10</option>
                        <option value={25}>25</option>
                        <option value={50}>50</option>
                      </Form.Select>
                      <span className="ms-2">entries</span>
                    </div>
                  </Col>
                  <Col md={4} className="text-center">
                    <span className="text-muted">
                      Showing {((pagination.currentPage - 1) * pagination.limit) + 1} to{' '}
                      {Math.min(pagination.currentPage * pagination.limit, pagination.totalCount)} of{' '}
                      {pagination.totalCount} students
                    </span>
                  </Col>
                  <Col md={4} className="d-flex justify-content-end">
                    <Pagination size="sm" className="mb-0">
                      {renderPagination()}
                    </Pagination>
                  </Col>
                </Row>
              )}
            </>
          )}
        </Card.Body>
      </Card>

      <StudentForm
        show={showModal}
        onHide={() => setShowModal(false)}
        student={selectedStudent}
        onSave={handleSave}
      />
    </div>
  );
};

export default StudentList;
