// All /leads endpoint calls in one place — pages/hooks import from here,
// never call api.get/patch directly. Keeps endpoint paths in exactly one spot.
import api from './client';

export const fetchLeads = ( params = {} ) => api.get('/leads', { params }).then((res) => res.data);

export const fetchLeadById = (leadId) =>
  api.get(`/leads/${leadId}`).then((res) => res.data);

export const fetchAuditLog = (leadId) =>
  api.get(`/leads/${leadId}/audit-log`).then((res) => res.data);

export const createLead = (payload) =>
  api.post('/leads', payload).then((res) => res.data);

export const submitOption = (leadId, payload) =>
  api.patch(`/leads/${leadId}/options`, payload).then((res) => res.data);

export const contactClient = (leadId, payload) =>
  api.patch(`/leads/${leadId}/contact-client`, payload).then((res) => res.data);

export const confirmLead = (leadId) =>
  api.patch(`/leads/${leadId}/confirm`).then((res) => res.data);

export const requestRevision = (leadId, payload) =>
  api.patch(`/leads/${leadId}/request-revision`, payload).then((res) => res.data);

export const selectOption = (leadId, optionId) =>
  api.patch(`/leads/${leadId}/select-option`, { optionId }).then((res) => res.data);

export const resendToCGroup = (leadId, payload) =>
  api.patch(`/leads/${leadId}/resend-to-c`, payload).then((res) => res.data);