import { createContext, useEffect, useState } from 'react';
import { loginUser, logoutUser, fetchCurrentUser, registerUser } from '../api/auth';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [checkingSession, setCheckingSession] = useState(true);

  // On app load / refresh, ask the server if the httpOnly cookie is still valid.
  // There's no token in localStorage to read anymore, so this replaces that check.
  useEffect(() => {
    fetchCurrentUser()
      .then((data) => setUser(data.user))
      .catch(() => setUser(null))
      .finally(() => setCheckingSession(false));
  }, []);

  const login = async (email, password) => {
    const data = await loginUser({ email, password });
    setUser(data.user);
  };
  
  const register = async (payload) => {
    const data = await registerUser( payload );
    setUser(data.user);
  };

  const logout = async () => {
    await logoutUser();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, checkingSession }}>
      {children}
    </AuthContext.Provider>
  );
}