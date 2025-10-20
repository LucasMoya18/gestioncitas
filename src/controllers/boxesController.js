import axios from "axios";

const API_URL = "http://127.0.0.1:8000/api";
const api = axios.create({ baseURL: API_URL, headers: { "Content-Type": "application/json" }});

export const boxesController = {
  async list(medicoId) {
    try {
      const res = await api.get("/boxes/", { params: medicoId ? { medico: medicoId } : {} });
      return res.data || [];
    } catch (e) { return []; }
  },
  async create({ medico, nombre, activo = true }) {
    const res = await api.post("/boxes/", { medico, nombre, activo });
    return res.data;
  },
  async update(id, payload) {
    const res = await api.put(`/boxes/${id}/`, payload);
    return res.data;
  },
  async remove(id) {
    await api.delete(`/boxes/${id}/`);
    return { ok: true };
  }
};