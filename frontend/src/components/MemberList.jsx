import React, { useState, useEffect } from 'react';
import { Table, Button, Badge, Pagination, Spinner, Alert, Card, Row, Col, Form } from 'react-bootstrap';
import { memberApi } from '../services/api';
import MemberForm from './MemberForm';
import Swal from 'sweetalert2';

const MemberList = () => {


  const [members, setMembers] = useState([]);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
    limit: 5,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);

  const fetchMembers = async (page = 1, limit = 5) => {
    setLoading(true);
    setError(null);
    try {
      const response = await memberApi.getMembers(page, limit);
      setMembers(response.data.data);
      setPagination({
        currentPage: response.data.meta?.page || page,
        totalPages: response.data.meta?.totalPages || 1,
        totalCount: response.data.meta?.total || 0,
        limit: limit,
      });
    } catch (err) {
      setError('Failed to fetch members. Please make sure the backend server is running.');
      console.error('Error fetching members:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, []);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= pagination.totalPages) {
      fetchMembers(page, pagination.limit);
    }
  };

  const handleLimitChange = (e) => {
    const newLimit = parseInt(e.target.value);
    fetchMembers(1, newLimit);
  };

  const handleAdd = () => {
    setSelectedMember(null);
    setShowModal(true);
  };

  const handleEdit = async (id) => {
    try {
      const response = await memberApi.getMemberById(id);
      setSelectedMember(response.data);
      setShowModal(true);
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Error!',
        text: 'Failed to fetch member details.',
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
        await memberApi.deleteMember(id);
        Swal.fire({
          icon: 'success',
          title: 'Deleted!',
          text: 'Member has been deleted successfully.',
          timer: 2000,
          showConfirmButton: false,
        });
        fetchMembers(pagination.currentPage, pagination.limit);
      } catch (err) {
        Swal.fire({
          icon: 'error',
          title: 'Error!',
          text: 'Failed to delete member.',
        });
      }
    }
  };

  const handleSave = () => {
    fetchMembers(pagination.currentPage, pagination.limit);
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

  return (
    <div className="member-list">
      <Card className="mb-4 shadow">
        <Card.Header className="bg-primary text-white">
          <Row className="align-items-center">
            <Col>
              <h4 className="mb-0">Member Management System</h4>
            </Col>
            <Col className="text-end">
              <Button variant="light" onClick={handleAdd}>
                + Add New Member
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
              <p className="mt-2">Loading members...</p>
            </div>
          ) : (
            <>
              <div className="table-responsive">
                <Table striped hover className="align-middle">
                  <thead className="table-dark">
                    <tr>
                      <th>#</th>
                      <th>Member Name</th>
                      <th>Member Email</th>
                      <th>Member Age</th>
                      <th>Parent</th>
                      <th>Subjects</th>
                      <th>Avg Score</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {members.length === 0 ? (
                      <tr>
                        <td colSpan="8" className="text-center py-4">
                          <Alert variant="info">No members found. Add a new member to get started!</Alert>
                        </td>
                      </tr>
                    ) : (
                      members.map((member, index) => (
                        <tr key={member.id}>
                          <td>{(pagination.currentPage - 1) * pagination.limit + index + 1}</td>
                          <td>
                            <strong>{member.memberName}</strong>
                          </td>
                          <td>{member.memberEmail}</td>
                          <td>{member.memberAge || 'N/A'}</td>
                          <td>
                            {member.parent ? (
                              <Badge bg="info" title={member.parent.memberEmail}>
                                {member.parent.memberName}
                              </Badge>
                            ) : (
                              <span className="text-muted">None</span>
                            )}
                          </td>
                          <td>
                            {member.marks?.length > 0 ? (
                              <div>
                                {member.marks.map((mark, idx) => (
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
                            <Badge bg={parseFloat(getAverageScore(member.marks)) >= 60 ? 'success' : 'warning'}>
                              {getAverageScore(member.marks)}
                            </Badge>
                          </td>
                          <td>
                            <Button
                              variant="outline-primary"
                              size="sm"
                              className="me-1"
                              onClick={() => handleEdit(member.id)}
                            >
                              Edit
                            </Button>
                            <Button
                              variant="outline-danger"
                              size="sm"
                              onClick={() => handleDelete(member.id, member.memberName)}
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

              {members.length > 0 && (
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
                      {pagination.totalCount} members
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

      <MemberForm
        show={showModal}
        onHide={() => setShowModal(false)}
        member={selectedMember}
        onSave={handleSave}
      />
    </div>
  );
};

export default MemberList;
