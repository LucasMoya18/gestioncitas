// src/controllers/agendarCitaController.js

import axios from "axios";

const API_URL = "http://10.60.49.17:8000/api";

const api = axios.create({
  baseURL: API_URL,
  headers: { "Content-Type": "application/json" },
});

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
      // payload conforme a MedicoSerializer: { usuario: {...}, medico_especialidades: [{especialidad_id, box}, ...] }
      // adaptamos para enviar especialidades como medico_especialidades->especialidad_id
      const body = { ...payload };
      if (payload.especialidades) {
        body.medico_especialidades = payload.especialidades.map(e => ({
          especialidad_id: e.id || e.especialidad_id || e
        }));
      }
      const res = await api.post("/medicos/", body);
      return res.data;
    } catch (err) {
      console.error("createMedico error:", err?.response?.data || err.message);
      throw err.response?.data || err.message;
    }
  },

  async updateMedico(id, payload) {
    try {
      const res = await api.put(`/medicos/${id}/`, payload);
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

  async getHorariosMedico(medicoId) {
    try {
      // intenta endpoint específico, si no existe, consulta /horarios/?medico=
      try {
        const res = await api.get(`/medicos/${medicoId}/horarios/`);
        return res.data || [];
      } catch (e) {
        const res = await api.get(`/horarios/?medico=${medicoId}`);
        return res.data || [];
      }
    } catch (err) {
      console.error("getHorariosMedico error:", err?.response?.data || err.message);
      return [];
    }
  },

  async verificarRut(rut) {
    try {
      // intenta filtro por query si la API lo soporta
      try {
        const res = await api.get(`/pacientes/?rut=${encodeURIComponent(rut)}`);
        if (Array.isArray(res.data) && res.data.length) return res.data[0];
        // si la API devuelve objeto directo:
        if (res.data && res.data.usuario) return res.data;
      } catch (e) {
        // fallback: obtener todos y buscar
        const res = await api.get("/pacientes/");
        const pacientes = res.data || [];
        const found = pacientes.find((p) => p.usuario?.rut === rut || p.rut === rut);
        if (found) return found;
      }
      return null;
    } catch (err) {
      console.error("verificarRut error:", err?.response?.data || err.message);
      return null;
    }
  },

  async agendarCita(citaData) {
    try {
      const payload = {
        paciente: citaData.paciente,
        medico: citaData.medico,
        fechaHora: citaData.fechaHora,
        prioridad: citaData.prioridad || "Normal",
        descripcion: citaData.descripcion || "",
      };
      const res = await api.post("/citas/", payload);
      return res.data;
    } catch (err) {
      console.error("agendarCita error:", err?.response?.data || err.message);
      // intenta devolver el mensaje de error del backend
      if (err.response?.data) return { error: err.response.data };
      return { error: "Error al agendar cita" };
    }
  },

  async getMedicoEspecialidades(medicoId = null) {
    try {
      const url = medicoId ? `/medico-especialidades/?medico=${medicoId}` : "/medico-especialidades/";
      const res = await api.get(url);
      return res.data || [];
    } catch (err) {
      console.error("getMedicoEspecialidades error:", err?.response?.data || err.message);
      return [];
    }
  },

  async createMedicoEspecialidad(payload) {
    try {
      const res = await api.post("/medico-especialidades/", payload);
      return res.data;
    } catch (err) {
      console.error("createMedicoEspecialidad error:", err?.response?.data || err.message);
      throw err.response?.data || err.message;
    }
  },

  async getHorarios(medicoEspecialidadId) {
    try {
      const res = await api.get(`/horarios/?medico_especialidad=${medicoEspecialidadId}`);
      return res.data || [];
    } catch (err) {
      console.error("getHorarios error:", err?.response?.data || err.message);
      return [];
    }
  },

  async createHorario(payload) {
    try {
      const res = await api.post("/horarios/", payload);
      return res.data;
    } catch (err) {
      console.error("createHorario error:", err?.response?.data || err.message);
      throw err.response?.data || err.message;
    }
  },

  async deleteHorario(id) {
    try {
      const res = await api.delete(`/horarios/${id}/`);
      return res.data || { ok: true };
    } catch (err) {
      console.error("deleteHorario error:", err?.response?.data || err.message);
      throw err.response?.data || err.message;
    }
  },
};