import React, { useState, useEffect } from "react";
import {
  Scheduler,
  WeekView,
  Appointments,
  Toolbar,
  DateNavigator,
  AppointmentForm,
} from "@devexpress/dx-react-scheduler-material-ui";
import { Paper, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Alert } from "@mui/material";
import { agendarCitaController } from "../controllers/agendarCitaController";

export default function AgendarCitaScheduler({ user }) {
  const [medicos, setMedicos] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedMedico, setSelectedMedico] = useState("");
  const [prioridad, setPrioridad] = useState("Normal");
  const [openRutDialog, setOpenRutDialog] = useState(false);
  const [rut, setRut] = useState("");
  const [confirmRut, setConfirmRut] = useState(false);
  const [alert, setAlert] = useState("");
  const [appointmentData, setAppointmentData] = useState(null);

  useEffect(() => {
    agendarCitaController.getMedicos().then(setMedicos);
    if (!user) setOpenRutDialog(true);
  }, [user]);

  // Simula citas existentes (puedes cargar desde backend si lo deseas)
  useEffect(() => {
    setAppointments([]);
  }, []);

  // Cuando el usuario selecciona un slot en el scheduler
  const onAppointmentAdd = async ({ startDate, endDate }) => {
    if (!selectedMedico) {
      setAlert("Seleccione un médico antes de agendar.");
      return;
    }
    let pacienteRut = user ? user.usuario.rut : rut;
    if (!user && !confirmRut) {
      setAlert("Confirme si desea registrar el usuario con este RUT.");
      setAppointmentData({ startDate, endDate });
      return;
    }
    // Registrar usuario si no existe
    if (!user) {
      await agendarCitaController.registrarUsuarioPorRut(rut);
    }
    // Registrar cita
    const res = await agendarCitaController.agendarCitaPaciente({
      rut: pacienteRut,
      medico: selectedMedico,
      fechaHora: startDate,
      prioridad,
    });
    setAlert(res.mensaje || res.error || "Error al agendar cita");
    if (res.mensaje) {
      setAppointments([
        ...appointments,
        {
          startDate,
          endDate,
          title: "Cita agendada",
          medico: selectedMedico,
          prioridad,
        },
      ]);
      setAppointmentData(null);
    }
  };

  // Dialog para ingresar RUT si no está autenticado
  const RutDialog = (
    <Dialog open={openRutDialog} onClose={() => setOpenRutDialog(false)}>
      <DialogTitle>Ingrese su RUT</DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          margin="dense"
          label="RUT"
          type="text"
          fullWidth
          value={rut}
          onChange={e => setRut(e.target.value)}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setOpenRutDialog(false)}>Cancelar</Button>
        <Button onClick={() => setOpenRutDialog(false)}>Continuar</Button>
      </DialogActions>
    </Dialog>
  );

  // Confirmación de registro de usuario por RUT
  const ConfirmRutAlert = (
    <Alert severity="warning" sx={{ mt: 2 }}>
      ¿Desea registrar el usuario con RUT <b>{rut}</b>?<br />
      <Button variant="contained" color="success" size="small" sx={{ mr: 1 }} onClick={() => setConfirmRut(true)}>
        Sí, registrar
      </Button>
      <Button variant="contained" color="error" size="small" onClick={() => setRut("")}>
        No, cancelar
      </Button>
    </Alert>
  );

  return (
    <Paper sx={{ p: 3 }}>
      <h2>Agendar Cita</h2>
      {openRutDialog && RutDialog}
      <div className="row mb-3">
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
      </div>
      <Scheduler
        data={appointments}
        height={500}
        locale="es-ES"
      >
        <WeekView
          startDayHour={9}
          endDayHour={17}
        />
        <Toolbar />
        <DateNavigator />
        <Appointments />
        <AppointmentForm
          visible={!!appointmentData}
          appointmentData={appointmentData}
          onVisibilityChange={visible => !visible && setAppointmentData(null)}
          onAppointmentDataChange={data => setAppointmentData(data)}
          onCommitChanges={({ added }) => {
            if (added) onAppointmentAdd(added);
          }}
        />
      </Scheduler>
      {alert && <Alert severity="info" sx={{ mt: 2 }}>{alert}</Alert>}
      {!user && rut && !confirmRut && ConfirmRutAlert}
    </Paper>
  );
}