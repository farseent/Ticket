// Separated from AuthContext.jsx so components only ever import the hook,
// never the context object directly — cleaner imports, easier to test.
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}