import axios from 'axios';
import { normalizeRutWithDash } from '../utils/rutFormatter';
import Cookies from 'js-cookie';
import { API_URL } from '../config/api';

async function loginUsuario(rut, password) {
  try {
    const rutToSend = normalizeRutWithDash(rut);
    console.log("📤 Enviando login con RUT:", rutToSend);
    console.log("Api url utilizada:", API_URL);
    
    const res = await axios.post(`${API_URL}/login/`, { 
      rut: rutToSend, 
      password 
    });
    
    console.log("📥 Respuesta completa del servidor:", res.data);
    
    const { user, token, access, message } = res.data || {};
    
    const authToken = token || access;
    
    if (!user) {
      throw new Error('No se recibió información del usuario');
    }
    
    if (!authToken) {
      console.error(' No se recibió token. Respuesta:', res.data);
      throw new Error('No se recibió token de autenticación del servidor');
    }
    
    localStorage.setItem('token', authToken);
    Cookies.set('token', authToken, { expires: 7, secure: false, sameSite: 'lax', path: '/' });
    
    console.log(' Token guardado exitosamente:', authToken.substring(0, 30) + '...');
    console.log(' Verificando guardado en localStorage:', localStorage.getItem('token')?.substring(0, 30) + '...');
    console.log(' Verificando guardado en Cookies:', Cookies.get('token')?.substring(0, 30) + '...');
    
    return { 
      ok: true, 
      user, 
      access: authToken,
      message 
    };
  } catch (error) {
    const status = error.response?.status;
    const errorMessage =
      error.response?.data?.error ||
      error.response?.data?.message ||
      error.message ||
      (status === 404 ? 'Usuario no encontrado. Verifica tu RUT.' : 
       status === 401 ? 'Contraseña incorrecta.' :
       'Error al iniciar sesión. Intenta nuevamente.');
    
    console.error(' Error en login:', errorMessage);
    throw new Error(errorMessage);
  }
}

export const loginController = { login: loginUsuario };
export { loginUsuario };

export const loginController2 = {
  async login(correo, password) {
    try {
      const response = await fetch(`${API_URL}/auth/login/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ correo, password })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Credenciales inválidas');
      }

      const data = await response.json();
      
      if (!data.access) {
        throw new Error('No se recibió token de autenticación');
      }

      const token = data.access;
      localStorage.setItem('token', token);
      Cookies.set('token', token, { expires: 7, secure: false, sameSite: 'lax', path: '/' });

      console.log(' Token guardado:', token.substring(0, 20) + '...');

      return data;
    } catch (error) {
      console.error(' Error en login:', error);
      throw error;
    }
  }
};