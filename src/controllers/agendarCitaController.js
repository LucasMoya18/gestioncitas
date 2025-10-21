// src/controllers/agendarCitaController.js

import axios from "axios";
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
      return res.data || [];
    } catch (err) {
      console.error("getEspecialidades error:", err?.response?.data || err.message);
      return [];
    }
  },

  async createEspecialidad(payload) {
    try {
      const res = await api.post("/especialidades/", payload);
      return res.data;
    } catch (err) {
      console.error("createEspecialidad error:", err?.response?.data || err.message);
      throw err.response?.data || err.message;
    }
  },

  async updateEspecialidad(id, payload) {
    try {
      const res = await api.put(`/especialidades/${id}/`, payload);
      return res.data;
    } catch (err) {
      console.error("updateEspecialidad error:", err?.response?.data || err.message);
      throw err.response?.data || err.message;
    }
  },

  async deleteEspecialidad(id) {
    try {
      const res = await api.delete(`/especialidades/${id}/`);
      return res.data || { ok: true };
    } catch (err) {
      console.error("deleteEspecialidad error:", err?.response?.data || err.message);
      throw err.response?.data || err.message;
    }
  },

  async getMedicos() {
    try {
      const res = await api.get("/medicos/");
      return res.data || [];
    } catch (err) {
      console.error("getMedicos error:", err?.response?.data || err.message);
      return [];
    }
  },

  async createMedico(payload) {
    try {
      const body = {
        usuario: {
          nombre: payload.nombre,
          correo: payload.correo,
          rut: payload.rut,
          telefono: payload.telefono || "",
          rol: "Medico",
          ...(payload.password ? { password: payload.password } : {})
        }
      };
      const res = await api.post("/medicos/", body);
      return res.data;
    } catch (err) {
      console.error("createMedico error:", err?.response?.data || err.message);
      throw err.response?.data || err.message;
    }
  },

  async updateMedico(id, payload) {
    try {
      const body = {};
      if (payload.nombre || payload.correo || payload.rut || payload.telefono || payload.password) {
        body.usuario = {
          ...(payload.nombre && { nombre: payload.nombre }),
          ...(payload.correo && { correo: payload.correo }),
          ...(payload.rut && { rut: payload.rut }),
          ...(payload.telefono && { telefono: payload.telefono }),
          ...(payload.password && { password: payload.password })
        };
      }
      const res = await api.put(`/medicos/${id}/`, body);
      return res.data;
    } catch (err) {
      console.error("updateMedico error:", err?.response?.data || err.message);
      throw err.response?.data || err.message;
    }
  },

  async deleteMedico(id) {
    try {
      const res = await api.delete(`/medicos/${id}/`);
      return res.data || { ok: true };
    } catch (err) {
      console.error("deleteMedico error:", err?.response?.data || err.message);
      throw err.response?.data || err.message;
    }
  },

  async getCitas() {
    try {
      const res = await api.get("/citas/");
      return res.data || [];
    } catch (err) {
      console.error("getCitas error:", err?.response?.data || err.message);
      return [];
    }
  },

  async verificarRut(rut) {
    try {
      const res = await api.post("/verificar-rut/", { rut });
      return res.data || null;
    } catch (e) {
      return null;
    }
  },

  async agendarCita(citaData) {
    try {
      const payload = {
        ...(citaData.paciente && { paciente: citaData.paciente }),
        ...(citaData.usuario_id && { usuario_id: citaData.usuario_id }),
        medico: citaData.medico,
        medico_especialidad: citaData.medico_especialidad,
        fechaHora: citaData.fechaHora,
        prioridad: citaData.prioridad || "Normal",
        descripcion: citaData.descripcion || "",
      };
      
      console.log("📤 Payload enviado al backend:", payload);
      const res = await api.post("/citas/", payload);
      console.log("✅ Respuesta del backend:", res.data);
      return res.data;
    } catch (err) {
      console.error("❌ Error agendando cita:", err?.response?.data || err.message);
      throw err.response?.data || err.message;
    }
  },

  async getMedicoEspecialidades(medicoId = null) {
    try {
      const params = medicoId ? { medico: medicoId } : {};
      const res = await api.get("/medico-especialidades/", { params });
      return res.data || [];
    } catch (err) {
      console.error("getMedicoEspecialidades error:", err?.response?.data || err.message);
      return [];
    }
  },

  async createMedicoEspecialidad(payload) {
    try {
      const body = {
        medico_id: payload.medico_id || payload.medico,
        especialidad_id: payload.especialidad_id || payload.especialidad,
        ...(payload.activo !== undefined ? { activo: payload.activo } : {})
      };
      const res = await api.post("/medico-especialidades/", body);
      return res.data;
    } catch (err) {
      console.error("createMedicoEspecialidad error:", err?.response?.data || err.message);
      throw err.response?.data || err.message;
    }
  },

  async updateMedicoEspecialidad(id, payload) {
    try {
      const body = {
        ...(payload.medico_id || payload.medico ? { medico_id: payload.medico_id || payload.medico } : {}),
        ...(payload.especialidad_id || payload.especialidad ? { especialidad_id: payload.especialidad_id || payload.especialidad } : {}),
        ...(payload.activo !== undefined ? { activo: payload.activo } : {})
      };
      const res = await api.put(`/medico-especialidades/${id}/`, body);
      return res.data;
    } catch (err) {
      console.error("updateMedicoEspecialidad error:", err?.response?.data || err.message);
      throw err.response?.data || err.message;
    }
  },

  async deleteMedicoEspecialidad(id) {
    try {
      const res = await api.delete(`/medico-especialidades/${id}/`);
      return res.data || { ok: true };
    } catch (err) {
      console.error("deleteMedicoEspecialidad error:", err?.response?.data || err.message);
      throw err.response?.data || err.message;
    }
  },

  async updateCita(citaId, citaData) {
    try {
      console.log("📝 Actualizando cita:", citaId, citaData)
      
      // ✅ Usar PATCH en lugar de PUT para actualización parcial
      const res = await api.patch(`/citas/${citaId}/`, citaData)
      console.log("✅ Cita actualizada:", res.data)
      return res.data
    } catch (err) {
      console.error("❌ Error actualizando cita:", err?.response?.data || err.message)
      throw err.response?.data || err.message
    }
  },

  async deleteCita(citaId) {
    try {
      const res = await api.delete(`/citas/${citaId}/`);
      console.log("✅ Cita eliminada");
      return res.data;
    } catch (err) {
      console.error("❌ Error eliminando cita:", err?.response?.data || err.message);
      throw err.response?.data || err.message;
    }
  },

  async verificarOCrearRut(rut) {
    try {
      const response = await fetch(`${API_URL}/verificar-o-crear-rut/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rut })
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw errorData
      }
      
      return await response.json()
    } catch (error) {
      console.error('Error verificando/creando RUT:', error)
      throw error
    }
  },
  
  async actualizarUsuarioConHistorial(usuarioId, usuarioData, direccion) {
    try {
      const response = await fetch(`${API_URL}/actualizar-usuario-historial/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          usuario_id: usuarioId,
          usuario: usuarioData,
          direccion
        })
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw errorData
      }
      
      return await response.json()
    } catch (error) {
      console.error('Error actualizando usuario con historial:', error)
      throw error
    }
  },

  updateUsuario,
};