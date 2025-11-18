import React, { createContext, useState, useEffect } from 'react';
import api from '../api/axiosConfig';
export const AuthContext = createContext();
export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try { const raw = localStorage.getItem('user'); return raw ? JSON.parse(raw) : null; } catch { return null; }
  });
  useEffect(() => { if (user) localStorage.setItem('user', JSON.stringify(user)); else localStorage.removeItem('user'); }, [user]);
  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    const token = res.data.token;
    api.defaults.headers.common.Authorization = `Bearer ${token}`;
    localStorage.setItem('token', token);
    setUser(res.data.user);
    return res.data;
  };
  const register = async (payload) => {
    const res = await api.post('/auth/register', payload);
    const token = res.data.token;
    api.defaults.headers.common.Authorization = `Bearer ${token}`;
    localStorage.setItem('token', token);
    setUser(res.data.user);
    return res.data;
  };
  const logout = () => { localStorage.removeItem('token'); localStorage.removeItem('user'); delete api.defaults.headers.common.Authorization; setUser(null); };
  const refreshMe = async () => { try { const res = await api.get('/auth/me'); setUser(res.data); } catch (err) { console.warn('refresh failed', err); } };
  return <AuthContext.Provider value={{ user, login, register, logout, refreshMe }}>{children}</AuthContext.Provider>;
}
