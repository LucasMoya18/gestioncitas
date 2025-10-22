// src/controllers/agendarCitaController.js

import axios from "axios";
import Cookies from 'js-cookie';

const API_URL = "http://127.0.0.1:8000/api";
const api = axios.create({ baseURL: API_URL, headers: { "Content-Type": "application/json" } });

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

// Función helper para obtener headers con autenticación
const getAuthHeaders = () => {
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
      const headers = getAuthHeaders();
      const res = await api.post("/especialidades/", payload, { headers });
      return res.data;
    } catch (e) {
      throw normalizeError(e, "Error creando especialidad");
    }
  },

  async updateEspecialidad(id, payload) {
    try {
      const headers = getAuthHeaders();
      const res = await api.put(`/especialidades/${id}/`, payload, { headers });
      return res.data;
    } catch (e) {
      throw normalizeError(e, "Error actualizando especialidad");
    }
  },

  async deleteEspecialidad(id) {
    try {
      const headers = getAuthHeaders();
      await api.delete(`/especialidades/${id}/`, { headers });
      return true;
    } catch (e) {
      throw normalizeError(e, "Error eliminando especialidad");
    }
  },

  async getMedicos() {
    try {
      const headers = getAuthHeaders();
      const res = await api.get("/medicos/", { headers });
      return res.data;
    } catch (e) {
      throw normalizeError(e, "Error cargando médicos");
    }
  },

  async createMedico(payload) {
    try {
      const headers = getAuthHeaders();
      const res = await api.post("/medicos/", payload, { headers });
      return res.data;
    } catch (e) {
      throw normalizeError(e, "Error creando médico");
    }
  },

  async updateMedico(id, payload) {
    try {
      const headers = getAuthHeaders();
      const res = await api.put(`/medicos/${id}/`, payload, { headers });
      return res.data;
    } catch (e) {
      throw normalizeError(e, "Error actualizando médico");
    }
  },

  async deleteMedico(id) {
    try {
      const headers = getAuthHeaders();
      await api.delete(`/medicos/${id}/`, { headers });
      return true;
    } catch (e) {
      throw normalizeError(e, "Error eliminando médico");
    }
  },

  async getCitas() {
    try {
      const headers = getAuthHeaders();
      
      if (!headers.Authorization) {
        throw new Error('No hay token de autenticación. Por favor inicie sesión.');
      }

      console.log('📋 Obteniendo citas con headers:', headers);
      
      const res = await api.get("/citas/", { headers });
      return res.data;
    } catch (e) {
      console.error('getCitas error:', e.response?.data || e.message);
      
      // Si es error 401, lanzar error específico
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
      const headers = getAuthHeaders();
      const res = await api.post("/citas/", citaData, { headers });
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
        console.error('❌ Respuesta no es JSON:', text.substring(0, 200));
        throw new Error('El servidor devolvió una respuesta inválida');
      }

      if (!response.ok) {
        const errorData = await response.json();
        console.error('❌ Error actualizando cita:', errorData);
        throw errorData;
      }

      const data = await response.json();
      console.log('✅ Cita actualizada:', data);
      return data;
    } catch (error) {
      console.error('❌ Error en updateCita:', error);
      throw error;
    }
  },

  async getMedicoEspecialidades(medicoId = null) {
    try {
      const headers = getAuthHeaders();
      // ✅ Cambiar de /medicos-especialidades/ a /medico-especialidades/
      const url = medicoId 
        ? `/medico-especialidades/?medico=${medicoId}`
        : '/medico-especialidades/';
      
      const res = await api.get(url, { headers });
      return res.data;
    } catch (e) {
      throw normalizeError(e, "Error cargando especialidades del médico");
    }
  },

  async createMedicoEspecialidad(payload) {
    try {
      const headers = getAuthHeaders();
      // ✅ Cambiar de /medicos-especialidades/ a /medico-especialidades/
      const res = await api.post("/medico-especialidades/", payload, { headers });
      return res.data;
    } catch (e) {
      throw normalizeError(e, "Error asignando especialidad");
    }
  },

  async deleteMedicoEspecialidad(id) {
    try {
      const headers = getAuthHeaders();
      // ✅ Cambiar de /medicos-especialidades/ a /medico-especialidades/
      await api.delete(`/medico-especialidades/${id}/`, { headers });
      return true;
    } catch (e) {
      throw normalizeError(e, "Error eliminando especialidad");
    }
  },

  updateUsuario,
};