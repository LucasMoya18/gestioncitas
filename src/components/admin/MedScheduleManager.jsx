"use client"

import React, { useEffect, useState } from "react"
import { Modal, Button, Form, Table, Alert, Badge, Card, Row, Col } from "react-bootstrap"
import { FaClock, FaPlus, FaTrash } from "react-icons/fa"
import { horariosController } from "../../controllers/horariosController"
import { boxesController } from "../../controllers/boxesController"
import { agendarCitaController } from "../../controllers/agendarCitaController"
import { useConfirm } from "../../utils/confirm";

export default function MedScheduleManager({ show, onClose, medico }) {
  const confirm = useConfirm();
  const [medicoEspecialidades, setMedicoEspecialidades] = useState([])
  const [selectedMedEspId, setSelectedMedEspId] = useState("")
  const [horarios, setHorarios] = useState([])
  const [boxes, setBoxes] = useState([])
  const [boxId, setBoxId] = useState("")
  const [dia, setDia] = useState("Lunes")
  const [horaInicio, setHoraInicio] = useState("08:00")
  const [horaFin, setHoraFin] = useState("09:00")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const timeOptions = horariosController.generateTimeOptions()

  useEffect(() => {
    if (show && medico) {
      // cargar especialidades del médico y boxes del médico
      loadME()
      loadBoxes()
      setSelectedMedEspId("")
      setHorarios([])
      setBoxId("")
      setError("")
    }
  }, [show, medico])

  useEffect(() => {
    // cuando cambia la especialidad seleccionada, cargar horarios
    if (selectedMedEspId) {
      loadHorarios(Number(selectedMedEspId))
    } else {
      setHorarios([])
    }
  }, [selectedMedEspId])

  const loadME = async () => {
    setLoading(true)
    try {
      const medicoId = medico?.usuario?.id || medico?.id
      const data = await agendarCitaController.getMedicoEspecialidades(medicoId)
      setMedicoEspecialidades(data || [])
      // si hay solo una especialidad, autoseleccionar
      if ((data || []).length === 1) {
        setSelectedMedEspId(String(data[0].id))
      }
    } catch (e) {
      setError("Error cargando especialidades del médico")
      setMedicoEspecialidades([])
    } finally {
      setLoading(false)
    }
  }

  const loadHorarios = async (meId) => {
    setLoading(true)
    try {
      const data = await horariosController.getHorarios(meId)
      setHorarios(data || [])
    } catch (e) {
      setError("Error cargando horarios")
      setHorarios([])
    } finally {
      setLoading(false)
    }
  }

  const loadBoxes = async () => {
    try {
      const medicoId = medico?.usuario?.id || medico?.id
      const data = await boxesController.list(medicoId)
      setBoxes(data || [])
      if (data?.length && !boxId) setBoxId(String(data[0].id))
    } catch (e) {
      setBoxes([])
    }
  }

  const addHorario = async () => {
    setError("")
    if (!selectedMedEspId) {
      setError("Seleccione una especialidad")
      return
    }
    const horario = {
      medico_especialidad: Number(selectedMedEspId),
      box: boxId ? Number(boxId) : null,
      dia,
      horaInicio,
      horaFin
    }

    // Validación FE básica
    const validation = horariosController.validateHorario(horario)
    if (!validation.valid) { setError(validation.errors.join(". ")); return }

    // 1) Validar solape en MISMO BOX contra los horarios ya cargados (misma especialidad)
    const haySolapeMismaEspecialidad = horariosController.hasOverlapInBox(horario, horarios)
    if (haySolapeMismaEspecialidad) {
      setError("Existe un horario superpuesto en el mismo box para este médico y día")
      return
    }

    // 2) Validar solape en MISMO BOX contra OTRAS especialidades del mismo médico
    const haySolapeOtrasEspecialidades = await prevalidateCrossSpecialtyOverlap(horario)
    if (haySolapeOtrasEspecialidades) {
      setError("Existe un horario superpuesto en el mismo box para este médico y día")
      return
    }

    try {
      await horariosController.createHorario(horario)
      await loadHorarios(Number(selectedMedEspId))
      setHoraInicio("08:00")
      setHoraFin("09:00")
    } catch (e) {
      // Extraer mensaje del backend y mapear 400 a un mensaje claro
      const status = e?.response?.status
      const apiMsg =
        e?.response?.data?.non_field_errors?.[0] ||
        e?.response?.data?.detail ||
        e?.response?.data?.error ||
        e?.message ||
        "Error creando horario"

      // Si el backend respondió 400 por solape, mostramos el mismo mensaje amigable
      const text = String(apiMsg || "").toLowerCase()
      if (status === 400 && (text.includes("solap") || text.includes("overlap") || text.includes("ya existe") || text.includes("conflict"))) {
        setError("Existe un horario superpuesto en el mismo box para este médico y día")
      } else {
        setError(apiMsg)
      }
    }
  }

  // Valida solapes contra otras especialidades del mismo médico (mismo box, día y franja)
  const prevalidateCrossSpecialtyOverlap = async (horario) => {
    try {
      const otherME = (medicoEspecialidades || []).filter(me => String(me.id) !== String(selectedMedEspId))
      if (!otherME.length) return false

      // Cargar horarios de las otras especialidades y chequear solape en el mismo box
      const allOtherHorarios = []
      for (const me of otherME) {
        const hs = await horariosController.getHorarios(me.id)
        if (Array.isArray(hs)) allOtherHorarios.push(...hs)
      }
      return horariosController.hasOverlapInBox(horario, allOtherHorarios)
    } catch {
      // Si falla la prevalidación, no bloquear por FE; dejar que el backend valide
      return false
    }
  }

  const removeHorario = async (id) => {
    const ok = await confirm({
      title: '¿Eliminar el horario?',
      text: 'Esta acción no se puede deshacer.',
      variant: 'danger',
      confirmButtonText: 'Sí, eliminar'
    })
    if (!ok) return
    try {
      await horariosController.deleteHorario(id)
      if (selectedMedEspId) await loadHorarios(Number(selectedMedEspId))
    } catch (e) {
      setError("Error eliminando horario")
    }
  }

  return (
    <Modal show={show} onHide={onClose} size="lg" centered>
      <Modal.Header closeButton className="bg-primary text-white">
        <Modal.Title><FaClock className="me-2" />Gestión de Horarios</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {medico && (
          <Alert variant="info" className="mb-3">
            <strong>Médico:</strong> {medico.usuario?.nombre || medico.nombre}
          </Alert>
        )}

        {error && <Alert variant="danger" dismissible onClose={() => setError("")}>{error}</Alert>}

        <Card className="mb-3 border-0 shadow-sm">
          <Card.Header className="bg-light"><strong>Seleccione Especialidad</strong></Card.Header>
          <Card.Body>
            <Row className="g-3">
              <Col md={6}>
                <Form.Label>Especialidad</Form.Label>
                <Form.Select
                  value={selectedMedEspId}
                  onChange={(e) => setSelectedMedEspId(e.target.value)}
                >
                  <option value="">Seleccione...</option>
                  {medicoEspecialidades.map(me => (
                    <option key={me.id} value={me.id}>{me.especialidad?.nombre || "N/A"}</option>
                  ))}
                </Form.Select>
              </Col>
            </Row>
          </Card.Body>
        </Card>

        <Card className="mb-4 border-0 shadow-sm">
          <Card.Header className="bg-light"><strong>Agregar Nuevo Horario</strong></Card.Header>
          <Card.Body>
            <Row className="g-3">
              <Col md={3}>
                <Form.Label>Día</Form.Label>
                <Form.Select value={dia} onChange={(e) => setDia(e.target.value)} disabled={!selectedMedEspId}>
                  {["Lunes","Martes","Miercoles","Jueves","Viernes","Sabado","Domingo"].map(d => <option key={d} value={d}>{d}</option>)}
                </Form.Select>
              </Col>
              <Col md={3}>
                <Form.Label>Box</Form.Label>
                <Form.Select value={boxId} onChange={(e) => setBoxId(e.target.value)} disabled={!selectedMedEspId}>
                  <option value="">Seleccione box...</option>
                  {boxes.map(b => <option key={b.id} value={b.id}>{b.nombre}</option>)}
                </Form.Select>
              </Col>
              <Col md={3}>
                <Form.Label>Hora Inicio</Form.Label>
                <Form.Select value={horaInicio} onChange={(e) => setHoraInicio(e.target.value)} disabled={!selectedMedEspId}>
                  {timeOptions.map(t => <option key={t} value={t}>{t}</option>)}
                </Form.Select>
              </Col>
              <Col md={3}>
                <Form.Label>Hora Fin</Form.Label>
                <Form.Select value={horaFin} onChange={(e) => setHoraFin(e.target.value)} disabled={!selectedMedEspId}>
                  {timeOptions.map(t => <option key={t} value={t}>{t}</option>)}
                </Form.Select>
              </Col>
              <Col md={12} className="d-flex justify-content-end">
                <Button variant="primary" onClick={addHorario} disabled={loading || !boxId || !selectedMedEspId}>
                  <FaPlus className="me-2" />Agregar
                </Button>
              </Col>
            </Row>
          </Card.Body>
        </Card>

        <Card className="border-0 shadow-sm">
          <Card.Header className="bg-light"><strong>Horarios Configurados</strong></Card.Header>
          <Card.Body className="p-0">
            {(!selectedMedEspId) ? (
              <div className="text-center py-4 text-muted">Seleccione una especialidad para ver horarios</div>
            ) : horarios.length === 0 ? (
              <div className="text-center py-4 text-muted">No hay horarios configurados</div>
            ) : (
              <Table responsive hover className="mb-0">
                <thead className="table-light">
                  <tr>
                    <th>Día</th>
                    <th>Box</th>
                    <th>Hora Inicio</th>
                    <th>Hora Fin</th>
                    <th className="text-center">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {horarios.map(h => (
                    <tr key={h.id}>
                      <td><Badge bg="primary">{h.dia}</Badge></td>
                      <td><Badge bg="secondary">{h.box_nombre}</Badge></td>
                      <td>{h.horaInicio}</td>
                      <td>{h.horaFin}</td>
                      <td className="text-center">
                        <Button size="sm" variant="outline-danger" onClick={() => removeHorario(h.id)}><FaTrash /></Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            )}
          </Card.Body>
        </Card>
      </Modal.Body>
      <Modal.Footer><Button variant="secondary" onClick={onClose}>Cerrar</Button></Modal.Footer>
    </Modal>
  )
}