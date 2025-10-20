import axios from 'axios';
import { normalizeRutWithDash } from '../utils/rutFormatter';

const API_URL = 'http://127.0.0.1:8000/api';

async function loginUsuario(rut, password) {
  try {
    const rutToSend = normalizeRutWithDash(rut);
    console.log("📤 Enviando login con RUT:", rutToSend);
    
    const res = await axios.post(`${API_URL}/login/`, { rut: rutToSend, password });
    
    const { user, token, message } = res.data || {};
    if (!user || !token) {
      return { ok: false, message: 'Respuesta del servidor inválida' };
    }
    return { ok: true, user, token, message };
  } catch (error) {
    const status = error.response?.status;
    const message =
      error.response?.data?.error ||
      error.response?.data?.message ||
      (status === 404 ? 'Usuario no encontrado. Verifica tu RUT.' : 
       status === 401 ? 'Contraseña incorrecta.' :
       'Error al iniciar sesión. Intenta nuevamente.');
    return { ok: false, message };
  }
}

export const loginController = { login: loginUsuario };
export { loginUsuario };