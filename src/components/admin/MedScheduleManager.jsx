"use client"

import React, { useEffect, useState } from "react"
import { Modal, Button, Form, Table, Alert } from "react-bootstrap"
import { agendarCitaController } from "../../controllers/agendarCitaController"

export default function MedScheduleManager({ show, onClose, medicoEspecialidad }) {
  const [horarios, setHorarios] = useState([])
  const [dia, setDia] = useState("Lunes")
  const [horaInicio, setHoraInicio] = useState("")
  const [horaFin, setHoraFin] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (medicoEspecialidad && show) load()
  }, [medicoEspecialidad, show])

  const load = async () => {
    setLoading(true)
    try {
      const data = await agendarCitaController.getHorarios(medicoEspecialidad.id)
      setHorarios(data || [])
    } catch (e) {
      setError("Error cargando horarios")
    } finally {
      setLoading(false)
    }
  }

  const addHorario = async () => {
    setError("")
    if (!horaInicio || !horaFin) { setError("Complete horas"); return }
    try {
      await agendarCitaController.createHorario({
        medico_especialidad: medicoEspecialidad.id,
        dia, horaInicio, horaFin
      })
      await load()
      setHoraInicio(""); setHoraFin("")
    } catch (e) {
      setError(e?.detail || e?.message || "Error creando horario")
    }
  }

  const removeHorario = async (id) => {
    if (!confirm("Eliminar horario?")) return
    try {
      await agendarCitaController.deleteHorario(id)
      await load()
    } catch (e) {
      setError("Error eliminando horario")
    }
  }

  return (
    <Modal show={show} onHide={onClose} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title>Horarios — {medicoEspecialidad?.especialidad?.nombre}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {error && <Alert variant="danger">{error}</Alert>}
        <Form className="d-flex gap-2 mb-3">
          <Form.Select value={dia} onChange={(e) => setDia(e.target.value)} style={{width: '140px'}}>
            {["Lunes","Martes","Miercoles","Jueves","Viernes","Sabado","Domingo"].map(d => <option key={d} value={d}>{d}</option>)}
          </Form.Select>
          <Form.Control type="time" value={horaInicio} onChange={(e)=>setHoraInicio(e.target.value)} />
          <Form.Control type="time" value={horaFin} onChange={(e)=>setHoraFin(e.target.value)} />
          <Button onClick={addHorario}>Agregar</Button>
        </Form>

        <Table size="sm">
          <thead><tr><th>Día</th><th>Inicio</th><th>Fin</th><th></th></tr></thead>
          <tbody>
            {horarios.map(h => (
              <tr key={h.id}>
                <td>{h.dia}</td>
                <td>{h.horaInicio}</td>
                <td>{h.horaFin}</td>
                <td className="text-end"><Button size="sm" variant="danger" onClick={()=>removeHorario(h.id)}>Eliminar</Button></td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onClose}>Cerrar</Button>
      </Modal.Footer>
    </Modal>
  )
}