// src/controllers/agendarCitaController.js

import Cookies from 'js-cookie';
import { API_URL, api, getAuthHeaders } from '../config/api';

// Normaliza errores de API
function normalizeError(e, fallback = "Error de solicitud") {
  const msg =
    e?.response?.data?.non_field_errors?.[0] ||
    e?.response?.data?.detail ||
    e?.response?.data?.error ||
    e?.message ||
    fallback;
  const err = new Error(msg);
  err.response = e?.response;
  err.status = e?.response?.status;
  return err;
}

// Actualizar datos del usuario (edición de médico)
async function updateUsuario(id, data) {
  try {
    const { data: res } = await api.patch(`/usuarios/${id}/`, data);
    return res;
  } catch (e) {
    throw normalizeError(e, "Error actualizando usuario");
  }
}

export const agendarCitaController = {
  async getEspecialidades() {
    try {
      const res = await api.get("/especialidades/");
      return res.data;
    } catch (e) {
      throw normalizeError(e, "Error cargando especialidades");
    }
  },

  async createEspecialidad(payload) {
    try {
      const res = await api.post("/especialidades/", payload);
      return res.data;
    } catch (e) {
      throw normalizeError(e, "Error creando especialidad");
    }
  },

  async updateEspecialidad(id, payload) {
    try {
      const res = await api.put(`/especialidades/${id}/`, payload);
      return res.data;
    } catch (e) {
      throw normalizeError(e, "Error actualizando especialidad");
    }
  },

  async deleteEspecialidad(id) {
    try {
      await api.delete(`/especialidades/${id}/`);
      return true;
    } catch (e) {
      throw normalizeError(e, "Error eliminando especialidad");
    }
  },

  async getMedicos() {
    try {
      const res = await api.get("/medicos/");
      return res.data;
    } catch (e) {
      throw normalizeError(e, "Error cargando médicos");
    }
  },

  async createMedico(payload) {
    try {
      const formattedPayload = {
        usuario: {
          nombre: payload.nombre || payload.usuario?.nombre,
          correo: payload.correo || payload.usuario?.correo,
          rut: payload.rut || payload.usuario?.rut,
          telefono: payload.telefono || payload.usuario?.telefono || '',
          password: payload.password || payload.usuario?.password,
          rol: 'Medico'
        }
      };

      console.log('📤 Creando médico con payload:', formattedPayload);
      
      const res = await api.post("/medicos/", formattedPayload);
      return res.data;
    } catch (e) {
      console.error(' Error creando médico:', e.response?.data);
      throw normalizeError(e, "Error creando médico");
    }
  },

  async updateMedico(id, payload) {
    try {
      const res = await api.put(`/medicos/${id}/`, payload);
      return res.data;
    } catch (e) {
      throw normalizeError(e, "Error actualizando médico");
    }
  },

  async deleteMedico(id) {
    try {
      console.log(' Eliminando médico con ID:', id);
      
      // El ID debe ser el del médico (primary key), no del usuario
      await api.delete(`/medicos/${id}/`);
      
      console.log(' Médico eliminado correctamente');
      return true;
    } catch (e) {
      console.error(' Error eliminando médico:', e.response?.data);
      throw normalizeError(e, "Error eliminando médico");
    }
  },

  async getCitas() {
    try {
      const headers = getAuthHeaders();
      
      if (!headers.Authorization) {
        throw new Error('No hay token de autenticación. Por favor inicie sesión.');
      }

      console.log(' Obteniendo citas con headers:', headers);
      
      const res = await api.get("/citas/");
      return res.data;
    } catch (e) {
      console.error('getCitas error:', e.response?.data || e.message);
      
      if (e.response?.status === 401) {
        throw new Error('Authentication credentials were not provided.');
      }
      
      throw normalizeError(e, "Error cargando citas");
    }
  },

  async verificarRut(rut) {
    try {
      const res = await api.get(`/verificar-rut/?rut=${rut}`);
      return res.data;
    } catch (e) {
      throw normalizeError(e, "Error verificando RUT");
    }
  },

  async agendarCita(citaData) {
    try {
      const res = await api.post("/citas/", citaData);
      return res.data;
    } catch (e) {
      throw normalizeError(e, "Error agendando cita");
    }
  },

  updateCita: async (citaId, citaData) => {
    const token = localStorage.getItem('token') || Cookies.get('token');
    
    if (!token) {
      throw new Error('No hay token de autenticación');
    }

    try {
      console.log('📤 Actualizando cita:', citaId, citaData);
      
      const response = await fetch(`${API_URL}/citas/${citaId}/`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        credentials: 'include',
        body: JSON.stringify(citaData)
      });

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        console.error(' Respuesta no es JSON:', text.substring(0, 200));
        throw new Error('El servidor devolvió una respuesta inválida');
      }

      if (!response.ok) {
        const errorData = await response.json();
        console.error(' Error actualizando cita:', errorData);
        throw errorData;
      }

      const data = await response.json();
      console.log(' Cita actualizada:', data);
      return data;
    } catch (error) {
      console.error(' Error en updateCita:', error);
      throw error;
    }
  },

  async getMedicoEspecialidades(medicoId = null) {
    try {
      const url = medicoId 
        ? `/medico-especialidades/?medico=${medicoId}`
        : '/medico-especialidades/';
      
      const res = await api.get(url);
      return res.data;
    } catch (e) {
      throw normalizeError(e, "Error cargando especialidades del médico");
    }
  },

  async createMedicoEspecialidad(payload) {
    try {
      const res = await api.post("/medico-especialidades/", payload);
      return res.data;
    } catch (e) {
      throw normalizeError(e, "Error asignando especialidad");
    }
  },

  async deleteMedicoEspecialidad(id) {
    try {
      await api.delete(`/medico-especialidades/${id}/`);
      return true;
    } catch (e) {
      throw normalizeError(e, "Error eliminando especialidad");
    }
  },

  updateUsuario,
};