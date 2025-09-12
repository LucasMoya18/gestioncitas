import React, { createContext, useContext, useState, useEffect } from 'react';
import Cookies from 'js-cookie';

const AuthContext = createContext();

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Verificar si hay usuario en cookies al cargar
    const checkAuth = () => {
      try {
        const savedUser = Cookies.get('user');
        const token = Cookies.get('token');
        
        if (savedUser && savedUser !== 'undefined') {
          const parsedUser = JSON.parse(savedUser);
          setUser(parsedUser);
        }
      } catch (error) {
        console.error('Error parsing user data:', error);
        Cookies.remove('user');
        Cookies.remove('token');
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = (userData, token) => {
    try {
      setUser(userData);
      Cookies.set('user', JSON.stringify(userData), { expires: 7 }); // 7 días
      Cookies.set('token', token, { expires: 7 });
    } catch (error) {
      console.error('Error saving auth data:', error);
    }
  };

  const logout = () => {
    setUser(null);
    Cookies.remove('user');
    Cookies.remove('token');
  };

  const value = {
    user,
    login,
    logout,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}