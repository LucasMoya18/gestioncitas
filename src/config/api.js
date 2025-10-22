import axios from 'axios';
import Cookies from 'js-cookie';

//  Configuración centralizada de la API
export const API_URL = 'http://127.0.0.1:8000/api';

//  Función helper para obtener headers con autenticación
export const getAuthHeaders = () => {
  const token = localStorage.getItem('token') || Cookies.get('token');
  
  if (!token) {
    console.warn('⚠️ No se encontró token de autenticación');
    return {
      'Content-Type': 'application/json'
    };
  }
  
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
};

//  Instancia de axios configurada
export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

//  Interceptor para agregar token automáticamente a todas las peticiones
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token') || Cookies.get('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

//  Interceptor para manejar errores 401 automáticamente
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.error(' 401 Unauthorized - Token inválido o expirado');
      
    }
    return Promise.reject(error);
  }
);