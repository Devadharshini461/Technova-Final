import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('scholarship_jwt') || '');
  const [loading, setLoading] = useState(true);

  // Set default auth token header for axios
  if (token) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete axios.defaults.headers.common['Authorization'];
  }

  useEffect(() => {
    if (token) {
      fetchCurrentUser();
    } else {
      setLoading(false);
    }
  }, [token]);

  const fetchCurrentUser = async () => {
    try {
      const res = await axios.get('/api/auth/me');
      setUser(res.data);
    } catch (err) {
      console.error('Session expired or invalid token');
      logout();
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    const res = await axios.post('/api/auth/login', { email, password });
    const { token: newToken, user: userData } = res.data;
    localStorage.setItem('scholarship_jwt', newToken);
    setToken(newToken);
    setUser(userData);
    axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
    return userData;
  };

  const register = async (studentData) => {
    const res = await axios.post('/api/auth/register', studentData);
    const { token: newToken, user: userData } = res.data;
    localStorage.setItem('scholarship_jwt', newToken);
    setToken(newToken);
    setUser(userData);
    axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
    return userData;
  };

  // One-click demo role switcher helper for judges & evaluators
  const quickSwitchRole = async (targetRole) => {
    let email = 'admin@scholarships.gov.in';
    if (targetRole === 'staff') email = 'staff.sharma@scholarships.gov.in';
    if (targetRole === 'student') email = 'rahul.verma@gmail.com';
    return await login(email, 'password123');
  };

  const logout = () => {
    localStorage.removeItem('scholarship_jwt');
    setToken('');
    setUser(null);
    delete axios.defaults.headers.common['Authorization'];
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, quickSwitchRole }}>
      {children}
    </AuthContext.Provider>
  );
};
