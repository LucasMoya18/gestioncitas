import axios from 'axios';

export async function loginPaciente(rut, password) {
  try {
    const response = await axios.post('http://10.60.49.17:8000/api/login/', { rut, password });
    return response.data;
  } catch (err) {
    throw err.response?.data?.error || 'Error al iniciar sesión';
  }
}