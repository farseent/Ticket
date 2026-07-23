// Shared "fetch a list of leads + expose a refresh function" pattern.
// Used by Dashboard A (all leads) and Dashboard B (my leads) today;
// C and D will reuse this too instead of re-writing the same effect.
import { useCallback, useEffect, useState } from 'react';
import { fetchLeads } from '../api/leads';

export function useLeads(params = {}) {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const paramsKey = JSON.stringify(params);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await fetchLeads(JSON.parse(paramsKey));
      setLeads(data.leads);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load leads');
    } finally {
      setLoading(false);
    }
  }, [paramsKey]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { leads, loading, error, refresh };
}