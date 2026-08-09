import { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [loading, setLoading] = useState(true);

  axios.defaults.baseURL = 'http://localhost:5000';

  useEffect(() => {
    const fetchUser = async () => {
      if (token) {
        try {
          const config = {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          };
          const { data } = await axios.get('/api/auth/me', config);
          setUser(data);
        } catch (error) {
          console.error('Error fetching user:', error);
          setToken(null);
          localStorage.removeItem('token');
        }
      }
      setLoading(false);
    };

    fetchUser();
  }, [token]);

  const login = async (email, password) => {
    const { data } = await axios.post('/api/auth/login', { email, password });
    setUser(data);
    setToken(data.token);
    localStorage.setItem('token', data.token);
  };

  const register = async (username, email, password, displayName) => {
    await axios.post('/api/auth/register', { username, email, password, displayName });
  };

  const updateProfile = async (formData) => {
    const config = {
      headers: {
        'Content-Type': 'multipart/form-data',
        Authorization: `Bearer ${token}`,
      },
    };
    const { data } = await axios.put('/api/users/profile', formData, config);
    setUser(data);
    return data;
  };

  const followUser = async (userId) => {
    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
    const { data } = await axios.put(`/api/users/follow/${userId}`, {}, config);
    setUser(data.currentUser);
    return data;
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, updateProfile, followUser }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
