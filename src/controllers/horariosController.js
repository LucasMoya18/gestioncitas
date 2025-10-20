import axios from "axios";

const API_URL = "http://127.0.0.1:8000/api";
const http = axios.create({ baseURL: API_URL, headers: { "Content-Type": "application/json" } });

const parseTime = (t) => {
  const [h, m] = String(t).split(":").map(Number);
  return h * 60 + m;
};

const overlaps = (aStart, aEnd, bStart, bEnd) => aStart < bEnd && bStart < aEnd;

export const horariosController = {
  /**
   * Obtiene horarios disponibles para agendar cita
   */
  async getHorariosDisponibles(medicoId, medicoEspecialidadId, fecha) {
    const res = await http.post("/citas/horarios_disponibles/", {
      medico_id: medicoId,
      medico_especialidad_id: medicoEspecialidadId,
      fecha
    });
    return res.data;
  },

  /**
   * Valida si un horario específico está disponible (lado servidor)
   */
  async validarHorario(medicoId, fechaHora) {
    const res = await http.post("/citas/validar_horario/", { medico_id: medicoId, fechaHora });
    return res.data;
  },

  /**
   * Obtiene horarios configurados para una especialidad de médico
   */
  async getHorarios(medicoEspecialidadId) {
    const res = await http.get("/horarios/", { params: { medico_especialidad: medicoEspecialidadId } });
    return res.data || [];
  },

  /**
   * Crea un nuevo horario para una especialidad de médico
   */
  async createHorario(payload) {
    try {
      const { data } = await http.post("/horarios/", payload)
      return data
    } catch (e) {
      // Normalizar mensaje de error
      const status = e?.response?.status
      const msg =
        e?.response?.data?.non_field_errors?.[0] ||
        e?.response?.data?.detail ||
        e?.response?.data?.error ||
        e?.message ||
        "Error creando horario"

      const err = new Error(msg)
      err.response = e?.response
      err.status = status
      throw err
    }
  },

  /**
   * Actualiza un horario existente
   */
  async updateHorario(id, payload) {
    const res = await http.put(`/horarios/${id}/`, payload);
    return res.data;
  },

  /**
   * Elimina un horario
   */
  async deleteHorario(id) {
    await http.delete(`/horarios/${id}/`);
    return { ok: true };
  },

  /**
   * Genera opciones de tiempo en intervalos de 15 minutos
   */
  generateTimeOptions(start = 8, end = 20) {
    const options = [];
    for (let hour = start; hour <= end; hour++) {
      for (let minute of [0, 15, 30, 45]) {
        if (hour === end && minute > 0) break;
        options.push(`${String(hour).padStart(2,'0')}:${String(minute).padStart(2,'0')}`);
      }
    }
    return options;
  },

  /**
   * Valida que las horas sean en intervalos de 15 minutos
   */
  validateTimeInterval(time) {
    const m = Number(String(time).split(':')[1]);
    return [0,15,30,45].includes(m);
  },

  /**
   * Valida que la hora esté en el rango permitido (8 AM - 8 PM)
   */
  validateTimeRange(time) {
    const h = Number(String(time).split(':')[0]);
    return h >= 8 && h <= 20;
  },

  /**
   * Valida que horaInicio sea menor que horaFin
   */
  validateTimeOrder(horaInicio, horaFin) {
    return horaInicio < horaFin;
  },

  /**
   * Chequea solape en MISMO BOX contra una lista de horarios existentes
   */
  hasOverlapInBox(newHorario, existingHorarios) {
    if (!newHorario?.box) return false;
    const start = parseTime(newHorario.horaInicio);
    const end = parseTime(newHorario.horaFin);
    return (existingHorarios || [])
      .filter(h => h.dia === newHorario.dia && Number(h.box) === Number(newHorario.box))
      .some(h => overlaps(start, end, parseTime(h.horaInicio), parseTime(h.horaFin)));
  },

  /**
   * Validación completa del horario en FE (formato strings)
   */
  validateHorario(h) {
    const errors = [];
    if (!h.medico_especialidad) errors.push("Debe seleccionar una especialidad del médico");
    if (!h.box) errors.push("Debe seleccionar un box");
    if (!h.dia) errors.push("Debe seleccionar un día");
    if (!h.horaInicio || !h.horaFin) errors.push("Debe especificar hora de inicio y fin");
    if (h.horaInicio && !this.validateTimeInterval(h.horaInicio)) errors.push("La hora de inicio debe ser en intervalos de 15 minutos");
    if (h.horaFin && !this.validateTimeInterval(h.horaFin)) errors.push("La hora de fin debe ser en intervalos de 15 minutos");
    if (h.horaInicio && !this.validateTimeRange(h.horaInicio)) errors.push("La hora de inicio debe estar entre 8:00 y 20:00");
    if (h.horaFin && !this.validateTimeRange(h.horaFin)) errors.push("La hora de fin debe estar entre 8:00 y 20:00");
    if (h.horaInicio && h.horaFin && !this.validateTimeOrder(h.horaInicio, h.horaFin)) errors.push("La hora de inicio debe ser anterior a la hora de fin");
    return { valid: errors.length === 0, errors };
  }
};

// Si no existe, expón este helper para reutilizar en FE
export function hasOverlapInBox(horario, lista) {
  return false
}