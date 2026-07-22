import api from './client';

export const registerUser = (payload) => api.post('/auth/register', payload).then((res) => res.data);
export const loginUser = (payload) => api.post('/auth/login', payload).then((res) => res.data);
export const logoutUser = () => api.post('/auth/logout').then((res) => res.data);
export const fetchCurrentUser = () => api.get('/auth/me').then((res) => res.data);