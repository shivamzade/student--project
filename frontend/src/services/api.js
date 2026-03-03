import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const memberApi = {
  // Get all members with pagination
  getMembers: (page = 1, limit = 5) => {
    return api.get(`/members?page=${page}&limit=${limit}`);
  },

  // Get single member by ID with marks
  getMemberById: (id) => {
    return api.get(`/members/${id}`);
  },

  // Create new member with marks
  createMember: (memberData) => {
    return api.post('/members', memberData);
  },

  // Update member
  updateMember: (id, memberData) => {
    return api.put(`/members/${id}`, memberData);
  },

  // Delete member
  deleteMember: (id) => {
    return api.delete(`/members/${id}`);
  },
};

export default api;
