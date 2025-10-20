// src/components/appointments/AppointmentCalendar.js

// Remueve el import por defecto de React para usar la nueva transformación JSX
import { useState, useEffect } from 'react';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import { useAuth } from '../../context/AuthContext';
import format from 'date-fns/format';
import parse from 'date-fns/parse';
import startOfWeek from 'date-fns/startOfWeek';
import getDay from 'date-fns/getDay';
import es from 'date-fns/locale/es';
import 'react-big-calendar/lib/css/react-big-calendar.css';

// Importa tu controlador
import { agendarCitaController } from '../../controllers/agendarCitaController';
import AppointmentModal from './AppointmentModal';
import { Button } from 'react-bootstrap';

const locales = { 'es': es };
const localizer = dateFnsLocalizer({ format, parse, startOfWeek, getDay, locales });

// Mensajes del calendario en español
const messages = {
  allDay: 'Todo el día',
  previous: 'Anterior',
  next: 'Siguiente',
  today: 'Hoy',
  month: 'Mes',
  week: 'Semana',
  day: 'Día',
  agenda: 'Agenda',
  date: 'Fecha',
  time: 'Hora',
  event: 'Evento',
  noEventsInRange: 'No hay citas en este rango.',
  showMore: total => `+ Ver más (${total})`
};
const AppointmentCalendar = () => {
  const [events, setEvents] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);
  
  useEffect(() => {
    const fetchData = async () => {
      // Usamos el controlador para obtener los datos
      const citas = await agendarCitaController.getCitas();
      const medicos = await agendarCitaController.getMedicos();

      // Mapeamos los datos al formato que necesita el calendario
      const formattedEvents = citas.map(cita => ({
        title: `Cita con Dr. ${medicos.find(m => m.usuario.id === cita.medico)?.usuario.nombre || 'Desconocido'}`,
        start: new Date(cita.fechaHora),
        end: new Date(new Date(cita.fechaHora).getTime() + 45 * 60 * 1000), // <-- 45 minutos
        resource: cita,
      }));

      setEvents(formattedEvents);
      setDoctors(medicos);
    };

    fetchData();
  }, []);

  const handleSelectSlot = (slotInfo) => {
    if (slotInfo.start < new Date()) {
        alert("No puedes agendar una cita en el pasado.");
        return;
    }
    setSelectedSlot(slotInfo);
    setModalIsOpen(true);
  };
  
  const handleCloseModal = () => {
    setModalIsOpen(false);
    setSelectedSlot(null);
  };
  
  // Función para actualizar el calendario visualmente después de agendar
  const onAppointmentCreated = (newAppointment) => {
    const doctorName = doctors.find(m => m.usuario.id === newAppointment.medico)?.usuario.nombre || 'Desconocido';
    const newEvent = {
      title: `Cita con Dr. ${doctorName}`,
      start: new Date(newAppointment.fechaHora),
      end: new Date(new Date(newAppointment.fechaHora).getTime() + 45 * 60 * 1000), // <-- 45 minutos
      resource: newAppointment,
    };
    setEvents(prevEvents => [...prevEvents, newEvent]);
  };

  return (
    <div className="container py-4">
      <h2 className="fw-bold mb-4 text-primary">Agenda tu Cita</h2>
      <div className="bg-white rounded shadow p-3 mb-4" style={{ height: '600px' }}>
        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          style={{ height: '100%' }}
          selectable
          onSelectSlot={handleSelectSlot}
          messages={messages}
          culture='es'
          defaultView='day'   // <-- Cambia aquí
          min={new Date(0, 0, 0, 8, 0, 0)}
          max={new Date(0, 0, 0, 20, 0, 0)}
        />
      </div>
      {/* Renderiza el modal aquí, fuera del div del calendario */}
      {modalIsOpen && (
        <AppointmentModal
          isOpen={modalIsOpen}
          onClose={handleCloseModal}
          slotInfo={selectedSlot}
          doctors={doctors}
          onAppointmentCreated={onAppointmentCreated}
        />
      )}
    </div>
    
  );
};

export default AppointmentCalendar;
