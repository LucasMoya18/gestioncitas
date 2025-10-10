import React, { useState, useEffect } from "react";
import { agendarCitaController } from "../controllers/agendarCitaController";

export default function AgendarCita() {
  const [pacientes, setPacientes] = useState([]);
  const [medicos, setMedicos] = useState([]);
  const [form, setForm] = useState({
    paciente: "",
    medico: "",
    fechaHora: "",
    prioridad: "Normal",
  });
  const [mensaje, setMensaje] = useState("");

  useEffect(() => {
    agendarCitaController.getPacientes().then(setPacientes);
    agendarCitaController.getMedicos().then(setMedicos);
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await agendarCitaController.agendarCita(form);
    setMensaje(res.mensaje || res.error || "Error al agendar cita");
    if (res.mensaje) setForm({ paciente: "", medico: "", fechaHora: "", prioridad: "Normal" });
  };

  return (
    <div className="container mt-4">
      <h2>Agendar Cita</h2>
      <form className="row g-3" onSubmit={handleSubmit}>
        <div className="col-md-6">
          <label className="form-label">Paciente</label>
          <select className="form-select" name="paciente" value={form.paciente} onChange={handleChange} required>
            <option value="">Seleccione...</option>
            {pacientes.map(p => (
              <option key={p.usuario.rut} value={p.usuario.id}>{p.usuario.nombre}</option>
            ))}
          </select>
        </div>
        <div className="col-md-6">
          <label className="form-label">Médico</label>
          <select className="form-select" name="medico" value={form.medico} onChange={handleChange} required>
            <option value="">Seleccione...</option>
            {medicos.map(m => (
              <option key={m.usuario.rut} value={m.usuario.id}>{m.usuario.nombre} - {m.especialidad}</option>
            ))}
          </select>
        </div>
        <div className="col-md-6">
          <label className="form-label">Fecha y Hora</label>
          <input type="datetime-local" className="form-control" name="fechaHora" value={form.fechaHora} onChange={handleChange} required />
        </div>
        <div className="col-md-6">
          <label className="form-label">Prioridad</label>
          <select className="form-select" name="prioridad" value={form.prioridad} onChange={handleChange}>
            <option value="Normal">Normal</option>
            <option value="Urgencia">Urgencia</option>
          </select>
        </div>
        <div className="col-12">
          <button type="submit" className="btn btn-primary">Agendar</button>
        </div>
        {mensaje && <div className="alert alert-info mt-3">{mensaje}</div>}
      </form>
    </div>
  );
}