import React, { createContext, useState } from 'react';
import { authService } from '../services/auth.service';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loginError, setLoginError] = useState('');

  const login = async (username, password) => {
    setLoginError('');
    setIsLoading(true);
    try {
      const res = await authService.login(username, password);
      setCurrentUser(res.user);
      setIsLoading(false);
      return res.user;
    } catch (err) {
      setLoginError(err.message || 'Login failed');
      setIsLoading(false);
      throw err;
    }
  };

  const logout = () => {
    setCurrentUser(null);
  };

  return (
    <AuthContext.Provider value={{ currentUser, setCurrentUser, isLoading, loginError, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
