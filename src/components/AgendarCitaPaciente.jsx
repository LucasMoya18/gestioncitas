import React, { useState, useEffect } from "react";
import Calendar from "react-calendar";
import 'react-calendar/dist/Calendar.css';
import { agendarCitaController } from "../controllers/agendarCitaController";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";

export default function AgendarCitaPaciente({ user }) {
  const [medicos, setMedicos] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedHour, setSelectedHour] = useState("");
  const [selectedMedico, setSelectedMedico] = useState("");
  const [prioridad, setPrioridad] = useState("Normal");
  const [mensaje, setMensaje] = useState("");
  const [showRutModal, setShowRutModal] = useState(false);
  const [rut, setRut] = useState("");
  const [confirmRut, setConfirmRut] = useState(false);

  useEffect(() => {
    agendarCitaController.getMedicos().then(setMedicos);
    if (!user) setShowRutModal(true);
  }, [user]);

  // Horas disponibles por día (puedes personalizar)
  const horas = [
    "09:00", "10:00", "11:00", "12:00",
    "13:00", "14:00", "15:00", "16:00"
  ];

  const handleHourClick = (hour) => setSelectedHour(hour);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedMedico || !selectedHour || !selectedDate) {
      setMensaje("Seleccione médico, fecha y hora.");
      return;
    }
    // Si no hay usuario, registrar con RUT
    let pacienteRut = user ? user.usuario.rut : rut;
    if (!user && !confirmRut) {
      setMensaje("Confirme si desea registrar el usuario con este RUT.");
      return;
    }
    // Registrar usuario si no existe (puedes mejorar la lógica en el backend)
    if (!user) {
      await agendarCitaController.registrarUsuarioPorRut(rut);
    }
    // Registrar cita
    const fechaHora = new Date(selectedDate);
    const [h, m] = selectedHour.split(":");
    fechaHora.setHours(h, m, 0, 0);
    const res = await agendarCitaController.agendarCitaPaciente({
      rut: pacienteRut,
      medico: selectedMedico,
      fechaHora: fechaHora.toISOString(),
      prioridad,
    });
    setMensaje(res.mensaje || res.error || "Error al agendar cita");
    if (res.mensaje) {
      setSelectedHour("");
      setSelectedMedico("");
      setPrioridad("Normal");
    }
  };

  // Modal para ingresar RUT si no está autenticado
  const RutModal = (
    <Modal show={showRutModal} onHide={() => setShowRutModal(false)} centered>
      <Modal.Header closeButton>
        <Modal.Title>Ingrese su RUT</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <input
          type="text"
          className="form-control"
          placeholder="RUT"
          value={rut}
          onChange={e => setRut(e.target.value)}
        />
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={() => setShowRutModal(false)}>
          Cancelar
        </Button>
        <Button variant="primary" onClick={() => setShowRutModal(false)}>
          Continuar
        </Button>
      </Modal.Footer>
    </Modal>
  );

  // Confirmación de registro de usuario por RUT
  const ConfirmRutAlert = (
    <div className="alert alert-warning mt-3">
      ¿Desea registrar el usuario con RUT <b>{rut}</b>?<br />
      <Button variant="success" size="sm" onClick={() => setConfirmRut(true)}>Sí, registrar</Button>
      <Button variant="danger" size="sm" onClick={() => setRut("")}>No, cancelar</Button>
    </div>
  );

  return (
    <div className="container mt-4">
      <h2>Agendar Cita</h2>
      {showRutModal && RutModal}
      <form className="row g-3" onSubmit={handleSubmit}>
        <div className="col-md-6">
          <label className="form-label">Médico</label>
          <select className="form-select" value={selectedMedico} onChange={e => setSelectedMedico(e.target.value)} required>
            <option value="">Seleccione...</option>
            {medicos.map(m => (
              <option key={m.usuario.id} value={m.usuario.id}>{m.usuario.nombre} - {m.especialidad}</option>
            ))}
          </select>
        </div>
        <div className="col-md-6">
          <label className="form-label">Prioridad</label>
          <select className="form-select" value={prioridad} onChange={e => setPrioridad(e.target.value)}>
            <option value="Normal">Normal</option>
            <option value="Urgencia">Urgencia</option>
          </select>
        </div>
        <div className="col-12">
          <label className="form-label">Seleccione día y hora</label>
          <Calendar
            onChange={setSelectedDate}
            value={selectedDate}
            view="month" // <-- Cambiado de "week" a "month"
            minDetail="month"
            maxDetail="month"
            locale="es-ES"
          />
          <div className="mt-3">
            <b>Horas disponibles para {selectedDate.toLocaleDateString()}:</b>
            <div className="d-flex flex-wrap gap-2 mt-2">
              {horas.map(h => (
                <Button
                  key={h}
                  variant={selectedHour === h ? "primary" : "outline-primary"}
                  onClick={() => handleHourClick(h)}
                >
                  {h}
                </Button>
              ))}
            </div>
          </div>
        </div>
        <div className="col-12 mt-3">
          <Button type="submit" variant="success">Agendar</Button>
        </div>
        {mensaje && <div className="alert alert-info mt-3">{mensaje}</div>}
        {!user && rut && !confirmRut && ConfirmRutAlert}
      </form>
    </div>
  );
}