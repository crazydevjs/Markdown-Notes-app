import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL}/api`
  : '/api';

const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

export const getNotes = () => api.get('/notes');
export const getNoteById = (id) => api.get(`/notes/${id}`);
export const renderNote = (id) => api.get(`/notes/${id}/render`);
export const createNote = (data) => api.post('/notes', data);
export const uploadNote = (formData) =>
  api.post('/notes/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
export const updateNote = (id, data) => api.put(`/notes/${id}`, data);
export const deleteNote = (id) => api.delete(`/notes/${id}`);
export const checkGrammar = (text) => api.post('/notes/grammar-check', { text });
