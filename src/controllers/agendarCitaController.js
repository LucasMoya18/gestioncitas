// src/controllers/agendarCitaController.js

const API_URL = "http://10.60.49.17:8000/api"; // URL base de tu API de Django

export const agendarCitaController = {
  /**
   * Obtiene la lista de todos los médicos.
   */
  async getMedicos() {
    try {
      const res = await fetch(`${API_URL}/medicos/`);
      if (!res.ok) {
        console.error("Error al obtener los médicos:", res.statusText);
        return [];
      }
      return await res.json();
    } catch (error) {
      console.error("Error de red al obtener médicos:", error);
      return [];
    }
  },

  /**
   * Obtiene todas las citas existentes para mostrarlas en el calendario.
   */
  async getCitas() {
    try {
      const res = await fetch(`${API_URL}/citas/`);
      if (!res.ok) {
        console.error("Error al obtener las citas:", res.statusText);
        return [];
      }
      return await res.json();
    } catch (error) {
      console.error("Error de red al obtener citas:", error);
      return [];
    }
  },

  /**
   * Registra una nueva cita en el sistema.
   * @param {object} citaData - Los datos de la cita.
   * @param {number} citaData.paciente - El ID del usuario paciente.
   * @param {number} citaData.medico - El ID del usuario médico.
   * @param {string} citaData.fechaHora - La fecha y hora en formato ISO string.
   */
  async agendarCita(citaData) {
    const { paciente, medico, fechaHora } = citaData;

    if (!paciente || !medico || !fechaHora) {
      return { error: "Faltan datos para agendar la cita" };
    }

    const body = {
      paciente, // ID del paciente
      medico,   // ID del médico
      fechaHora,
      // El estado y prioridad se asignan por defecto en Django
    };

    const res = await fetch(`${API_URL}/citas/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const data = await res.json();

    if (!res.ok) {
        // Devuelve el objeto de error que viene de Django si existe
        return { error: data.detail || "Ocurrió un error en el servidor" };
    }

    return data; // Devuelve la cita creada
  },
};