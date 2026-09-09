import { createContext, useContext, useState } from 'react';
import { triggerWorkflow } from '../services/api';

const AuthCtx = createContext(null);

export const useAuth = () => useContext(AuthCtx);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('travel_user')); } catch { return null; }
  });

  const login = async (email, password) => {
    try {
      console.debug('[Auth] Calling WF1 /sync login with:', { email });
      const res = await triggerWorkflow('login', { email, password });
      console.debug('[Auth] WF1 response:', { success: res.success, hasUser: !!res.user, message: res.message });

      if (res.success && res.user) {
        setUser(res.user);
        localStorage.setItem('travel_user', JSON.stringify(res.user));
        return { success: true };
      }
      return { success: false, message: res.message || 'Invalid email or password' };
    } catch (err) {
      console.error('[Auth] Login failed:', err);
      return { success: false, message: err.message || 'Authentication failed. Please try again.' };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('travel_user');
  };

  return (
    <AuthCtx.Provider value={{ user, login, logout }}>
      {children}
    </AuthCtx.Provider>
  );
}