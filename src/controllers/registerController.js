import axios from 'axios';
import { normalizeRutWithDash } from '../utils/rutFormatter';

const API_URL = "http://127.0.0.1:8000/api";
const api = axios.create({ 
  baseURL: API_URL, 
  headers: { "Content-Type": "application/json" } 
});

async function registerPaciente(formData) {
  const payload = {
    usuario: {
      nombre: formData.nombre,
      correo: formData.correo,
      password: formData.password,
      telefono: formData.telefono,
      // Enviar como 11111111-1
      rut: normalizeRutWithDash(formData.rut),
      rol: "Paciente"
    },
    direccion: formData.direccion || ""
  };
  
  try {
    console.log("📤 Enviando registro al backend:", payload);
    const response = await api.post('/registrar/', payload);
    console.log("✅ Registro exitoso:", response.data);
    return response.data;
  } catch (err) {
    console.error("❌ Error en registro:", err.response?.data);
    const errorMsg = err.response?.data?.error || 
                     err.response?.data?.message || 
                     'Error al registrar usuario';
    throw new Error(errorMsg);
  }
}

// ✅ Exportar como objeto registerController
export const registerController = {
  register: registerPaciente
};

// También exportar la función directamente
export { registerPaciente };