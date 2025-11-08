// src/controllers/agendarCitaController.js

import Cookies from 'js-cookie';
import { API_URL, api, getAuthHeaders } from '../config/api';

// Normaliza errores de API
function normalizeError(e, fallback = "Error de solicitud") {
  try {
    const resp = e?.response;
    const data = resp?.data;
    let candidates = [];

    if (data) {
        // Prioridades comunes en DRF
        if (Array.isArray(data)) candidates.push(data[0]);
        if (typeof data === 'string') candidates.push(data);
        if (data.detail) candidates.push(data.detail);
        if (data.error) candidates.push(data.error);
        if (data.non_field_errors && data.non_field_errors.length) candidates.push(data.non_field_errors[0]);

        // Primer campo con mensaje
        if (typeof data === 'object' && !Array.isArray(data)) {
          for (const k of Object.keys(data)) {
            const v = data[k];
            if (Array.isArray(v) && v.length) {
              candidates.push(`${k}: ${v[0]}`);
              break;
            } else if (typeof v === 'string') {
              candidates.push(`${k}: ${v}`);
              break;
            }
          }
        }
    }

    // Mensaje del propio error
    if (e?.message) candidates.push(e.message);

    // Fallback final
    candidates.push(fallback);

    // Filtrar vacíos y asegurar string
    let msg = candidates.find(m => m && typeof m === 'string') || fallback;

    // Limpiar mensaje (quitar saltos si son muchos)
    msg = String(msg).trim().replace(/\s+/g, ' ');

    const err = new Error(msg);
    err.status = resp?.status;
    err.data = data;
    err.raw = e;
    return err;
  } catch (inner) {
    const err = new Error(fallback);
    err.raw = e;
    return err;
  }
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
      const res = await api.get("/citas/", { headers });
      return res.data;
    } catch (e) {
      throw normalizeError(e, "Error cargando citas");
    }
  },

  // ✅ Nuevo método para obtener UNA cita específica por ID
  async getCitaById(id) {
    try {
      const headers = getAuthHeaders();
      if (!headers.Authorization) {
        throw new Error('No hay token de autenticación. Por favor inicie sesión.');
      }
      
      const res = await api.get(`/citas/${id}/`, { headers });
      return res.data;
    } catch (e) {
      throw normalizeError(e, "Error cargando cita");
    }
  },

  // ✅ Nuevo método para cargar TODAS las citas (solo admin)
  async getCitasAdmin() {
    try {
      const headers = getAuthHeaders();
      if (!headers.Authorization) {
        throw new Error('No hay token de autenticación. Por favor inicie sesión.');
      }
      
      console.log('📤 Solicitando citas administrativas...');
      
      // ✅ Usar la URL correcta: /citas/admin-todas/
      const res = await api.get("/citas/admin-todas/", { headers });
      
      console.log(`✅ Citas administrativas cargadas: ${res.data?.length || 0}`);
      
      return res.data;
    } catch (e) {
      console.error('❌ Error cargando citas administrativas:', e.response?.data || e.message);
      throw normalizeError(e, "Error cargando citas administrativas");
    }
  },

  async verificarRut(rut) {
    try {
      const res = await api.get(`/verificar-rut/?rut=${encodeURIComponent(rut)}`);
      return res.data;
    } catch (e) {
      throw normalizeError(e, "Error verificando RUT");
    }
  },

  // Alias para el flujo del modal (mantiene compatibilidad con el componente)
  async verificarOCrearRut(rut) {
    try {
      // usar endpoint dedicado que crea si no existe
      const res = await api.post(`/verificar-o-crear-rut/`, { rut });
      return res.data;
    } catch (e) {
      throw normalizeError(e, "Error verificando/creando RUT");
    }
  },

  async agendarCita(citaData) {
    try {
      // Normaliza payload a nombres reales del modelo DRF (fechaHora, usuario)
      const payload = {
        medico: citaData.medico ?? citaData.medico_id,
        medico_especialidad: citaData.medico_especialidad ?? citaData.medicoEspecialidad ?? citaData.medicoEspecialidadId,
        usuario: citaData.usuario ?? citaData.usuario_id ?? citaData.paciente ?? citaData.paciente_id,
        fechaHora: citaData.fechaHora ?? citaData.fecha_hora ?? citaData.fecha,
        descripcion: citaData.descripcion ?? '',
        prioridad: citaData.prioridad ?? 'Normal',
      };

      // Si no hay usuario en el payload, tomar el id del user guardado en localStorage/Cookies
      if (!payload.usuario && typeof window !== 'undefined') {
        try {
          const rawUser = localStorage.getItem('user') || Cookies.get('user');
          if (rawUser) {
            const parsed = typeof rawUser === 'string' ? JSON.parse(rawUser) : rawUser;
            // compat: estructuras distintas
            payload.usuario = parsed?.id || parsed?.usuario?.id || parsed?.user?.id || null;
          }
        } catch (e) {
          console.warn('No se pudo parsear user desde storage', e);
        }
      }

      Object.keys(payload).forEach((k) => payload[k] === undefined && delete payload[k]);

      const res = await api.post("/citas/", payload);
      return res.data;
    } catch (e) {
      console.error('Error agendando cita (payload enviado):', e?.config?.data);
      console.error('Respuesta del servidor:', e?.response?.status, e?.response?.data);
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

  reprogramarCita: async (citaId, nuevaFechaHora) => {
    try {
      const res = await api.patch(`/citas/${citaId}/reprogramar/`, {
        fechaHora: nuevaFechaHora
      });
      return res.data;
    } catch (e) {
      console.error('Error reprogramando cita:', e?.response?.status, e?.response?.data);
      throw normalizeError(e, "Error reprogramando cita");
    }
  },

  async getHorariosDisponibles(medicoId, medicoEspecialidadId, fecha) {
    try {
      const res = await api.post('/citas/horarios_disponibles/', {
        medico_id: medicoId,
        medico_especialidad_id: medicoEspecialidadId,
        fecha: fecha
      });
      return res.data;
    } catch (e) {
      throw normalizeError(e, "Error obteniendo horarios disponibles");
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

  async getUsuarioById(id) {
    try {
      const headers = getAuthHeaders();
      if (!headers.Authorization) throw new Error('No autenticado');
      const res = await api.get(`/usuarios/${id}/`, { headers });
      return res.data;
    } catch (e) {
      throw normalizeError(e, "Error cargando usuario");
    }
  },
};