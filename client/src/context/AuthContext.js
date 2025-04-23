import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

// Ensure axios is using the correct base URL
axios.defaults.baseURL = 'http://localhost:5001';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Check if user is already logged in
    const storedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');

    if (storedUser && token) {
      setUser(JSON.parse(storedUser));
      // Set default auth header
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }

    setLoading(false);
  }, []);

  const register = async (name, email, password, role = 'student') => {
    try {
      setLoading(true);
      setError(null);

      const { data } = await axios.post('/api/auth/register', {
        name,
        email,
        password,
        role
      });

      // Save user data and token
      localStorage.setItem('user', JSON.stringify(data.user));
      localStorage.setItem('token', data.token);
      localStorage.setItem('secretKey', data.secretKey); // Important for digital signatures

      // Set default auth header
      axios.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;

      setUser(data.user);
      setLoading(false);
      return data;
    } catch (error) {
      setLoading(false);
      setError(
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message
      );
      throw error;
    }
  };

  const login = async (email, password) => {
    try {
      setLoading(true);
      setError(null);

      const { data } = await axios.post('/api/auth/login', {
        email,
        password
      });

      // Save user data and token
      localStorage.setItem('user', JSON.stringify(data.user));
      localStorage.setItem('token', data.token);

      // Set default auth header
      axios.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;

      setUser(data.user);
      setLoading(false);
      return data;
    } catch (error) {
      setLoading(false);
      setError(
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message
      );
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    localStorage.removeItem('secretKey');
    delete axios.defaults.headers.common['Authorization'];
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        register,
        login,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
