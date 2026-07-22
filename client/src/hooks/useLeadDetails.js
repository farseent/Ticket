// Shared "fetch one lead's full detail (lead + options) + refresh" pattern.
// Used by Dashboard B when an agent selects a lead to work on; D will reuse it.
import { useCallback, useState } from 'react';
import { fetchLeadById } from '../api/leads';

export function useLeadDetail() {
  const [detail, setDetail] = useState(null); // { lead, options }
  const [error, setError] = useState('');

  const open = useCallback(async (leadId) => {
    setError('');
    try {
      const data = await fetchLeadById(leadId);
      setDetail(data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load lead');
    }
  }, []);

  const refresh = useCallback(async () => {
    if (detail?.lead?._id) await open(detail.lead._id);
  }, [detail, open]);

  return { detail, error, open, refresh, clear: () => setDetail(null) };
}