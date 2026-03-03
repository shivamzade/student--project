import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const studentApi = {
  // Get all students with pagination
  getStudents: (page = 1, limit = 5) => {
    return api.get(`/students?page=${page}&limit=${limit}`);
  },

  // Get single student by ID with marks
  getStudentById: (id) => {
    return api.get(`/students/${id}`);
  },

  // Create new student with marks
  createStudent: (studentData) => {
    return api.post('/students', studentData);
  },

  // Update student
  updateStudent: (id, studentData) => {
    return api.put(`/students/${id}`, studentData);
  },

  // Delete student
  deleteStudent: (id) => {
    return api.delete(`/students/${id}`);
  },
};

export default api;
