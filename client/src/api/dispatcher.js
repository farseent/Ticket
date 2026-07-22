import api from './client';

export const fetchDispatcherState = () =>
  api.get('/dispatcher/state').then((res) => res.data.state);