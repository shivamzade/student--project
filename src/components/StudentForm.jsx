import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Row, Col, Card } from 'react-bootstrap';
import { studentApi } from '../services/api';
import Swal from 'sweetalert2';

const StudentForm = ({ show, onHide, student, onSave }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    age: '',
    grade: '',
    marks: [{ subject: '', score: '' }],
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (student) {
      setFormData({
        name: student.name || '',
        email: student.email || '',
        age: student.age || '',
        grade: student.grade || '',
        marks: student.marks?.length > 0 
          ? student.marks.map(m => ({ subject: m.subject, score: m.score }))
          : [{ subject: '', score: '' }],
      });
    } else {
      setFormData({
        name: '',
        email: '',
        age: '',
        grade: '',
        marks: [{ subject: '', score: '' }],
      });
    }
  }, [student, show]);

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
        marks: validMarks,
      };

      if (student) {
        await studentApi.updateStudent(student.id, submitData);
        Swal.fire({
          icon: 'success',
          title: 'Updated!',
          text: 'Student record has been updated successfully.',
          timer: 2000,
          showConfirmButton: false,
        });
      } else {
        await studentApi.createStudent(submitData);
        Swal.fire({
          icon: 'success',
          title: 'Created!',
          text: 'New student has been added successfully.',
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

  return (
    <Modal show={show} onHide={onHide} size="lg" backdrop="static">
      <Modal.Header closeButton className="bg-primary text-white">
        <Modal.Title>{student ? 'Edit Student' : 'Add New Student'}</Modal.Title>
      </Modal.Header>
      <Form onSubmit={handleSubmit}>
        <Modal.Body>
          <Card className="mb-3">
            <Card.Header className="bg-light">
              <h6 className="mb-0">Student Information</h6>
            </Card.Header>
            <Card.Body>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Full Name <span className="text-danger">*</span></Form.Label>
                    <Form.Control
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Enter student name"
                      required
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Email <span className="text-danger">*</span></Form.Label>
                    <Form.Control
                      type="email"
                      name="email"
                      value={formData.email}
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
                    <Form.Label>Age</Form.Label>
                    <Form.Control
                      type="number"
                      name="age"
                      value={formData.age}
                      onChange={handleChange}
                      placeholder="Enter age"
                      min="1"
                      max="100"
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Grade</Form.Label>
                    <Form.Control
                      type="text"
                      name="grade"
                      value={formData.grade}
                      onChange={handleChange}
                      placeholder="Enter grade (e.g., A, B, C)"
                    />
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
            {loading ? 'Saving...' : (student ? 'Update' : 'Save')}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default StudentForm;
