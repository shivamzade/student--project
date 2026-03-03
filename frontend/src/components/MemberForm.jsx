import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Row, Col, Card } from 'react-bootstrap';
import { memberApi } from '../services/api';
import Swal from 'sweetalert2';

const MemberForm = ({ show, onHide, member, onSave }) => {
  const [formData, setFormData] = useState({
    memberName: '',
    memberEmail: '',
    memberAge: '',
    memberParentId: '',
    marks: [{ subject: '', score: '' }],
  });
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Fetch all members for parent selection dropdown
    const fetchMembers = async () => {
      try {
        const response = await memberApi.getMembers(1, 100);
        setMembers(response.data.data || []);
      } catch (error) {
        console.error('Error fetching members:', error);
      }
    };
    fetchMembers();
  }, []);

  useEffect(() => {
    if (member) {
      setFormData({
        memberName: member.memberName || '',
        memberEmail: member.memberEmail || '',
        memberAge: member.memberAge || '',
        memberParentId: member.memberParentId || '',
        marks: member.marks?.length > 0 
          ? member.marks.map(m => ({ subject: m.subject, score: m.score }))
          : [{ subject: '', score: '' }],
      });
    } else {
      setFormData({
        memberName: '',
        memberEmail: '',
        memberAge: '',
        memberParentId: '',
        marks: [{ subject: '', score: '' }],
      });
    }
  }, [member, show]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleMarkChange = (index, field, value) => {
    const updatedMarks = [...formData.marks];
    updatedMarks[index][field] = value;
    setFormData(prev => ({
      ...prev,
      marks: updatedMarks,
    }));
  };

  const addMark = () => {
    setFormData(prev => ({
      ...prev,
      marks: [...prev.marks, { subject: '', score: '' }],
    }));
  };

  const removeMark = (index) => {
    if (formData.marks.length > 1) {
      const updatedMarks = formData.marks.filter((_, i) => i !== index);
      setFormData(prev => ({
        ...prev,
        marks: updatedMarks,
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const validMarks = formData.marks.filter(m => m.subject && m.score);
      const submitData = {
        ...formData,
        memberAge: Number(formData.memberAge),
        memberParentId: formData.memberParentId ? Number(formData.memberParentId) : null,
        marks: validMarks,
      };

      if (member) {
        await memberApi.updateMember(member.id, submitData);
        Swal.fire({
          icon: 'success',
          title: 'Updated!',
          text: 'Member record has been updated successfully.',
          timer: 2000,
          showConfirmButton: false,
        });
      } else {
        await memberApi.createMember(submitData);
        Swal.fire({
          icon: 'success',
          title: 'Created!',
          text: 'New member has been added successfully.',
          timer: 2000,
          showConfirmButton: false,
        });
      }
      onSave();
      onHide();
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error!',
        text: error.response?.data?.message || 'Something went wrong!',
      });
    } finally {
      setLoading(false);
    }
  };

  // Filter out current member from parent dropdown to prevent self-reference
  const availableParents = members.filter(m => m.id !== member?.id);

  return (
    <Modal show={show} onHide={onHide} size="lg" backdrop="static">
      <Modal.Header closeButton className="bg-primary text-white">
        <Modal.Title>{member ? 'Edit Member' : 'Add New Member'}</Modal.Title>
      </Modal.Header>
      <Form onSubmit={handleSubmit}>
        <Modal.Body>
          <Card className="mb-3">
            <Card.Header className="bg-light">
              <h6 className="mb-0">Member Information</h6>
            </Card.Header>
            <Card.Body>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Member Name <span className="text-danger">*</span></Form.Label>
                    <Form.Control
                      type="text"
                      name="memberName"
                      value={formData.memberName}
                      onChange={handleChange}
                      placeholder="Enter member name"
                      required
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Member Email <span className="text-danger">*</span></Form.Label>
                    <Form.Control
                      type="email"
                      name="memberEmail"
                      value={formData.memberEmail}
                      onChange={handleChange}
                      placeholder="Enter email address"
                      required
                    />
                  </Form.Group>
                </Col>
              </Row>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Member Age <span className="text-danger">*</span></Form.Label>
                    <Form.Control
                      type="number"
                      name="memberAge"
                      value={formData.memberAge}
                      onChange={handleChange}
                      placeholder="Enter age"
                      min="1"
                      max="150"
                      required
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Parent Member</Form.Label>
                    <Form.Select
                      name="memberParentId"
                      value={formData.memberParentId}
                      onChange={handleChange}
                    >
                      <option value="">Select Parent (Optional)</option>
                      {availableParents.map((parent) => (
                        <option key={parent.id} value={parent.id}>
                          {parent.memberName} ({parent.memberEmail})
                        </option>
                      ))}
                    </Form.Select>
                    <Form.Text className="text-muted">
                      Select a parent member to establish hierarchy
                    </Form.Text>
                  </Form.Group>
                </Col>
              </Row>
            </Card.Body>
          </Card>

          <Card>
            <Card.Header className="bg-light d-flex justify-content-between align-items-center">
              <h6 className="mb-0">Subject Marks</h6>
              <Button variant="outline-success" size="sm" onClick={addMark}>
                + Add Subject
              </Button>
            </Card.Header>
            <Card.Body>
              {formData.marks.map((mark, index) => (
                <Row key={index} className="mb-2 align-items-end">
                  <Col md={5}>
                    <Form.Group>
                      <Form.Label>Subject</Form.Label>
                      <Form.Control
                        type="text"
                        value={mark.subject}
                        onChange={(e) => handleMarkChange(index, 'subject', e.target.value)}
                        placeholder="e.g., Mathematics"
                      />
                    </Form.Group>
                  </Col>
                  <Col md={5}>
                    <Form.Group>
                      <Form.Label>Score</Form.Label>
                      <Form.Control
                        type="number"
                        value={mark.score}
                        onChange={(e) => handleMarkChange(index, 'score', e.target.value)}
                        placeholder="e.g., 85"
                        min="0"
                        max="100"
                      />
                    </Form.Group>
                  </Col>
                  <Col md={2}>
                    <Button
                      variant="outline-danger"
                      size="sm"
                      onClick={() => removeMark(index)}
                      disabled={formData.marks.length === 1}
                    >
                      Remove
                    </Button>
                  </Col>
                </Row>
              ))}
            </Card.Body>
          </Card>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={onHide} disabled={loading}>
            Cancel
          </Button>
          <Button variant="primary" type="submit" disabled={loading}>
            {loading ? 'Saving...' : (member ? 'Update' : 'Save')}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default MemberForm;
