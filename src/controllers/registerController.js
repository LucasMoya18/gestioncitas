import axios from 'axios';

export async function registerPaciente(formData) {
  const payload = {
    usuario: {
      nombre: formData.nombre,
      correo: formData.correo,
      password: formData.password,
      telefono: formData.telefono,
      rut: formData.rut,
      rol: "Paciente"
    },
    direccion: formData.direccion || ""
  };
  try {
    const response = await axios.post('http://10.60.49.43:8000/api/registrar/', payload);
    return response.data;
  } catch (err) {
    throw err.response?.data?.error || 'Error al registrar usuario';
  }
}