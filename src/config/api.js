import axios from 'axios';
import Cookies from 'js-cookie';

//  Configuración centralizada de la API (múltiples endpoints)
const API_URLS = {
  aws: 'http://18.235.239.93:8000/api',
  railway: 'http://18.235.239.93:8000/api'
};

// helper para obtener la URL seleccionada (usa localStorage en cliente)
const getApiUrlFromStorage = () => {
  if (typeof window === 'undefined') return API_URLS.aws;
  const env = localStorage.getItem('api_env') || 'aws';
  return API_URLS[env] || API_URLS.aws;
};

// export dinámico (binding vivo) para compatibilidad con imports existentes
export let API_URL = getApiUrlFromStorage();

//  Función helper para obtener headers con autenticación
export const getAuthHeaders = () => {
  const token = localStorage.getItem('token') || Cookies.get('token');
  
  if (!token) {
    console.warn(' No se encontró token de autenticación');
    return {
      'Content-Type': 'application/json'
    };
  }
  
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
};

//  Instancia de axios configurada (baseURL inicial según selección)
export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Permite cambiar la env en tiempo de ejecución y actualizar axios y API_URL
export const setApiEnv = (env) => {
  if (typeof window === 'undefined') return;
  if (!API_URLS[env]) return;
  localStorage.setItem('api_env', env);
  API_URL = API_URLS[env];          // actualiza binding exportado
  api.defaults.baseURL = API_URLS[env];
};

// opcional: exponer urls actuales
export const availableApiUrls = API_URLS;

//  Interceptor para agregar token automáticamente a todas las peticiones
api.interceptors.request.use(
  (config) => {
    // Asegura baseURL actualizado en cada petición (por si cambió)
    config.baseURL = getApiUrlFromStorage();

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