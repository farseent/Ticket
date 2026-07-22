import api from './client';

export const fetchBDashboard = (userId) =>
  api.get(`/dashboard/b/${userId}`).then((res) => res.data);

export const fetchCDashboard = () =>
  api.get('/dashboard/c').then((res) => res.data);

export const fetchDDashboard = (userId) =>
  api.get(`/dashboard/d/${userId}`).then((res) => res.data);