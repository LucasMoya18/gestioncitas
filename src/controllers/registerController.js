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
    
    // ✅ Si es error 409 con rut_con_historial, crear un error especial con todos los datos
    if (err.response?.status === 409 && err.response?.data?.error === 'rut_con_historial') {
      const historialError = new Error('rut_con_historial');
      historialError.errorData = err.response.data; // ✅ Guardar todos los datos del error
      historialError.usuario_id = err.response.data.usuario_id;
      historialError.tiene_citas = err.response.data.tiene_citas;
      historialError.mensaje = err.response.data.mensaje;
      throw historialError;
    }
    
    const errorMsg = err.response?.data?.error || 
                     err.response?.data?.message || 
                     'Error al registrar usuario';
    throw new Error(errorMsg);
  }
}

// ✅ Nueva función para actualizar usuario con historial
async function actualizarUsuarioConHistorial(usuarioId, usuarioData) {
  const payload = {
    usuario_id: usuarioId,
    usuario: {
      nombre: usuarioData.nombre,
      correo: usuarioData.correo,
      password: usuarioData.password,
      telefono: usuarioData.telefono
    }
  };
  
  try {
    console.log("📤 Actualizando usuario con historial:", payload);
    const response = await api.post('/actualizar-usuario-historial/', payload);
    console.log("✅ Actualización exitosa:", response.data);
    return response.data;
  } catch (err) {
    console.error("❌ Error al actualizar usuario:", err.response?.data);
    const errorMsg = err.response?.data?.error || 
                     err.response?.data?.message || 
                     'Error al actualizar usuario';
    throw new Error(errorMsg);
  }
}

// ✅ Exportar como objeto registerController
export const registerController = {
  register: registerPaciente,
  actualizarUsuarioConHistorial
};

// También exportar la función directamente
export { registerPaciente, actualizarUsuarioConHistorial };