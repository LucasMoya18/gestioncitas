// src/components/appointments/AppointmentModal.js

import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext'; 
import { agendarCitaController } from '../../controllers/agendarCitaController';
import { createPortal } from 'react-dom';

const AppointmentModal = ({ isOpen, onClose, slotInfo, doctors, onAppointmentCreated }) => {
  const { user } = useAuth();
  const [selectedDoctorId, setSelectedDoctorId] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const patientId = user.usuario.id;


  if (!isOpen) return null;

  // Cierra el modal si se hace clic en el fondo
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!patientId) {
      setError('Debes iniciar sesión para poder agendar una cita.');
      return;
    }
    if (!selectedDoctorId) {
      setError('Por favor, selecciona un médico.');
      return;
    }
    setIsLoading(true);
    setError('');
    const appointmentData = {
      paciente: patientId,
      medico: parseInt(selectedDoctorId),
      fechaHora: slotInfo.start.toISOString(),
    };
    const result = await agendarCitaController.agendarCita(appointmentData);
    setIsLoading(false);
    if (result.error) {
      setError(result.error);
    } else {
      alert('¡Cita agendada con éxito!');
      onAppointmentCreated(result);
      onClose();
    }
  };

  return createPortal(
    <div className="modal-backdrop-custom" onClick={handleBackdropClick}>
      <div className="modal-dialog modal-dialog-centered" onClick={e => e.stopPropagation()}>
        <div className="modal-content p-4">
          <div className="modal-header border-0">
            <h5 className="modal-title text-primary fw-bold">
              <span role="img" aria-label="calendar">📅</span> Confirmar Cita
            </h5>
            <button type="button" className="btn-close" aria-label="Close" onClick={onClose}></button>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="modal-body">
              <p><strong>Paciente:</strong> {user?.nombre || 'No identificado'}</p>
              <p><strong>Fecha:</strong> {slotInfo.start.toLocaleDateString('es-ES')}</p>
              <p><strong>Hora:</strong> {slotInfo.start.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}</p>
              <div className="mb-3">
                <label htmlFor="doctor" className="form-label">Selecciona un Médico</label>
                <select
                  id="doctor"
                  value={selectedDoctorId}
                  onChange={(e) => setSelectedDoctorId(e.target.value)}
                  className="form-select"
                >
                  <option value="">-- Elige un especialista --</option>
                  {doctors.map(doctor => (
                    <option key={doctor.usuario.id} value={doctor.usuario.id}>
                      Dr. {doctor.usuario.nombre} ({doctor.especialidad})
                    </option>
                  ))}
                </select>
              </div>
              {error && (
                <div className="alert alert-danger py-2 d-flex align-items-center gap-2">
                  <span role="img" aria-label="alert">⚠️</span> {error}
                </div>
              )}
              {!user && (
                <div className="alert alert-info mt-3 text-center">
                  <span role="img" aria-label="info">ℹ️</span> Debes iniciar sesión para agendar una cita.
                </div>
              )}
            </div>
            <div className="modal-footer border-0 justify-content-end">
              <button
                type="button"
                onClick={onClose}
                className="btn btn-outline-danger me-2"
              >
                <span role="img" aria-label="cancel">❌</span> Cancelar
              </button>
              <button 
                type="submit" 
                disabled={isLoading || !selectedDoctorId || !patientId}
                className="btn btn-success"
              >
                <span role="img" aria-label="check">✅</span>
                {isLoading ? 'Agendando...' : 'Confirmar Cita'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default AppointmentModal;