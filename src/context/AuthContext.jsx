import React, { createContext, useState } from 'react';
import { authService } from '../services/auth.service';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loginError, setLoginError] = useState('');

  const normalizeUser = (user) => {
    if (!user) return null;
    const role = user.role || (user.userType ? user.userType.toLowerCase() :
      (user.roles && user.roles.length ? user.roles[0].toLowerCase() : ''));

    return {
      ...user,
      role,
      name: user.name || `${user.firstName || ''}${user.lastName ? ` ${user.lastName}` : ''}`.trim() || user.username || ''
    };
  };

  const login = async (username, password) => {
    setLoginError('');
    setIsLoading(true);
    try {
      const res = await authService.login(username, password);
      const user = normalizeUser(res.user);
      setCurrentUser(user);
      setIsLoading(false);
      return user;
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
