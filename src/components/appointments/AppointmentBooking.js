"use client"

import React, { useState, useEffect } from "react"
import { Modal, Button, Form, Alert, Card, Row, Col, Spinner, Container } from "react-bootstrap"
import { FaCalendarAlt, FaUserMd, FaClock, FaCheckCircle } from "react-icons/fa"
import { useAuth } from "../../context/AuthContext"
import { agendarCitaController } from "../../controllers/agendarCitaController"

export default function AppointmentBooking() {
  const { user } = useAuth()
  const [showRutModal, setShowRutModal] = useState(false)
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [rut, setRut] = useState("")
  const [tempUserData, setTempUserData] = useState(null)

  // Estados para el formulario de cita
  const [especialidades, setEspecialidades] = useState([])
  const [medicos, setMedicos] = useState([])
  const [medicosFiltrados, setMedicosFiltrados] = useState([])
  const [horarios, setHorarios] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  // Selecciones del usuario
  const [especialidadSeleccionada, setEspecialidadSeleccionada] = useState("")
  const [medicoSeleccionado, setMedicoSeleccionado] = useState("")
  const [fechaSeleccionada, setFechaSeleccionada] = useState("")
  const [horaSeleccionada, setHoraSeleccionada] = useState("")
  const [descripcion, setDescripcion] = useState("") // nuevo campo

  useEffect(() => {
    cargarEspecialidades()
    cargarMedicos()
  }, [])

  useEffect(() => {
    if (especialidadSeleccionada) {
      const filtrados = medicos.filter((m) => {
        // varios formatos posibles: objeto especialidad o texto
        return (m.especialidad && m.especialidad.nombre === especialidadSeleccionada) || m.especialidad === especialidadSeleccionada
      })
      setMedicosFiltrados(filtrados)
    } else {
      setMedicosFiltrados(medicos)
    }
  }, [especialidadSeleccionada, medicos])

  useEffect(() => {
    if (medicoSeleccionado) {
      cargarHorarios(medicoSeleccionado)
    } else {
      setHorarios([])
    }
  }, [medicoSeleccionado])

  const cargarEspecialidades = async () => {
    try {
      const data = await agendarCitaController.getEspecialidades()
      setEspecialidades(data || [])
    } catch (err) {
      console.error("Error al cargar especialidades:", err)
    }
  }

  const cargarMedicos = async () => {
    try {
      const data = await agendarCitaController.getMedicos()
      setMedicos(data || [])
      setMedicosFiltrados(data || [])
    } catch (err) {
      console.error("Error al cargar médicos:", err)
    }
  }

  const cargarHorarios = async (medicoId) => {
    try {
      const data = await agendarCitaController.getHorariosMedico(medicoId)
      setHorarios(data || [])
    } catch (err) {
      console.error("Error al cargar horarios:", err)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
    setSuccess("")

    // Validaciones rápidas
    if (!medicoSeleccionado || !fechaSeleccionada || !horaSeleccionada) {
      setError("Seleccione médico, fecha y hora.")
      return
    }

    // Si no hay usuario autenticado, mostrar modal de RUT
    if (!user) {
      setShowRutModal(true)
      return
    }

    // Si hay usuario, mostrar confirmación
    setShowConfirmModal(true)
  }

  const handleRutSubmit = async () => {
    if (!rut.trim()) {
      setError("Por favor ingrese su RUT")
      return
    }

    setLoading(true)
    try {
      const userData = await agendarCitaController.verificarRut(rut)

      if (userData && !userData.error) {
        setTempUserData(userData)
        setShowRutModal(false)
        setShowConfirmModal(true)
        setError("")
      } else {
        setError("RUT no registrado. Por favor regístrese primero.")
      }
    } catch (err) {
      setError("Error al verificar RUT: " + (err?.message || err))
    } finally {
      setLoading(false)
    }
  }

  const confirmarCita = async () => {
    setLoading(true)
    setError("")

    try {
      const fechaHora = `${fechaSeleccionada}T${horaSeleccionada}:00`

      const citaData = {
        paciente: user ? user.usuario.id : tempUserData?.usuario?.id || tempUserData?.id,
        medico: Number(medicoSeleccionado),
        fechaHora: fechaHora,
        descripcion: descripcion // enviar descripción
      }

      const resultado = await agendarCitaController.agendarCita(citaData)

      if (resultado && resultado.error) {
        setError(resultado.error)
      } else {
        setSuccess("¡Cita agendada exitosamente!")
        setShowConfirmModal(false)
        // Limpiar formulario (mantener selección de especialidad opcional)
        setMedicoSeleccionado("")
        setFechaSeleccionada("")
        setHoraSeleccionada("")
        setDescripcion("")
        setTempUserData(null)
        setRut("")
      }
    } catch (err) {
      setError("Error al agendar cita: " + (err?.message || err))
    } finally {
      setLoading(false)
    }
  }

  const getMedicoNombre = () => {
    const medico = medicos.find((m) => {
      const id = m.usuario?.id ?? m.id ?? m.usuario_id
      return Number.parseInt(medicoSeleccionado) === Number.parseInt(id)
    })
    return medico ? (medico.usuario?.nombre || medico.nombre) : ""
  }

  return (
    <div className="appointment-booking-container py-5">
      <Container>
        <Row className="justify-content-center">
          <Col lg={8}>
            <Card className="booking-card shadow-sm border-0 rounded-4">
              <Card.Header className="booking-header">
                <h3 className="mb-0 fw-bold">
                  <FaCalendarAlt className="me-2" /> Agendar Cita
                </h3>
                <p className="mb-0 text-muted small">Rápido y sencillo — solo 3 pasos</p>
              </Card.Header>

              <Card.Body className="p-3 p-sm-4 compact-form">
                {error && (
                  <Alert variant="danger" dismissible onClose={() => setError("")}>
                    {error}
                  </Alert>
                )}

                {success && (
                  <Alert variant="success" dismissible onClose={() => setSuccess("")}>
                    <FaCheckCircle className="me-2" />
                    {success}
                  </Alert>
                )}

                <Form onSubmit={handleSubmit}>
                  <Row className="g-2 align-items-center">
                    <Col sm={6}>
                      <Form.Group>
                        <Form.Label className="fw-medium small mb-1">Especialidad</Form.Label>
                        <Form.Select
                          size="sm"
                          value={especialidadSeleccionada}
                          onChange={(e) => setEspecialidadSeleccionada(e.target.value)}
                          className="form-control-sm"
                        >
                          <option value="">Seleccione...</option>
                          {especialidades.map((esp) => (
                            <option key={esp.id} value={esp.nombre || esp}>
                              {esp.nombre || esp}
                            </option>
                          ))}
                        </Form.Select>
                      </Form.Group>
                    </Col>

                    <Col sm={6}>
                      <Form.Group>
                        <Form.Label className="fw-medium small mb-1">Médico</Form.Label>
                        <Form.Select
                          size="sm"
                          value={medicoSeleccionado}
                          onChange={(e) => setMedicoSeleccionado(e.target.value)}
                          disabled={!especialidadSeleccionada && medicosFiltrados.length === 0}
                          className="form-control-sm"
                        >
                          <option value="">Seleccione...</option>
                          {medicosFiltrados.map((medico) => (
                            <option key={medico.usuario?.id ?? medico.id} value={medico.usuario?.id ?? medico.id}>
                              {medico.usuario?.nombre || medico.nombre} {medico.especialidad?.nombre || medico.especialidad_texto || medico.especialidad}
                            </option>
                          ))}
                        </Form.Select>
                      </Form.Group>
                    </Col>

                    <Col sm={6}>
                      <Form.Group>
                        <Form.Label className="fw-medium small mb-1">Fecha</Form.Label>
                        <Form.Control
                          type="date"
                          size="sm"
                          value={fechaSeleccionada}
                          onChange={(e) => setFechaSeleccionada(e.target.value)}
                          min={new Date().toISOString().split("T")[0]}
                          disabled={!medicoSeleccionado}
                          className="form-control-sm"
                        />
                      </Form.Group>
                    </Col>

                    <Col sm={6}>
                      <Form.Group>
                        <Form.Label className="fw-medium small mb-1">Hora</Form.Label>
                        <Form.Control
                          type="time"
                          size="sm"
                          value={horaSeleccionada}
                          onChange={(e) => setHoraSeleccionada(e.target.value)}
                          disabled={!fechaSeleccionada}
                          className="form-control-sm"
                        />
                      </Form.Group>
                    </Col>

                    <Col xs={12}>
                      <Form.Group>
                        <Form.Label className="fw-medium small mb-1">Descripción (opcional)</Form.Label>
                        <Form.Control
                          as="textarea"
                          rows={2}
                          size="sm"
                          value={descripcion}
                          onChange={(e) => setDescripcion(e.target.value)}
                          placeholder="Motivo de la consulta, síntomas breves..."
                          className="form-control-sm"
                        />
                      </Form.Group>
                    </Col>
                  </Row>

                  <div className="d-flex justify-content-end mt-3">
                    <Button
                      variant="outline-secondary"
                      className="me-2 btn-sm"
                      onClick={() => {
                        // limpiar parcialmente
                        setMedicoSeleccionado("")
                        setFechaSeleccionada("")
                        setHoraSeleccionada("")
                        setDescripcion("")
                      }}
                    >
                      Limpiar
                    </Button>

                    <Button
                      variant="primary"
                      size="sm"
                      type="submit"
                      disabled={loading}
                      className="fw-semibold btn-cta"
                    >
                      {loading ? (
                        <>
                          <Spinner animation="border" size="sm" className="me-2" />
                          Procesando...
                        </>
                      ) : (
                        <>
                          <FaCheckCircle className="me-2" /> Agendar
                        </>
                      )}
                    </Button>
                  </div>
                </Form>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>

      {/* Modal para ingresar RUT */}
      <Modal show={showRutModal} onHide={() => setShowRutModal(false)} centered>
        <Modal.Header closeButton className="bg-light">
          <Modal.Title className="fw-bold">Verificación de Identidad</Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-3">
          <p className="text-muted mb-3">Para agendar una cita sin iniciar sesión, necesitamos verificar su RUT.</p>
          <Form.Group>
            <Form.Label className="fw-medium small">RUT</Form.Label>
            <Form.Control
              type="text"
              placeholder="Ej: 12345678-9"
              value={rut}
              onChange={(e) => setRut(e.target.value)}
              size="sm"
              className="form-control-sm"
            />
            <Form.Text className="text-muted">Sin puntos, con guión</Form.Text>
          </Form.Group>
          {error && (
            <Alert variant="danger" className="mt-3 mb-0">
              {error}
            </Alert>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowRutModal(false)} size="sm">Cancelar</Button>
          <Button variant="primary" onClick={handleRutSubmit} disabled={loading} size="sm">
            {loading ? "Verificando..." : "Verificar RUT"}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal de Confirmación */}
      <Modal show={showConfirmModal} onHide={() => setShowConfirmModal(false)} centered>
        <Modal.Header closeButton className="bg-light">
          <Modal.Title className="fw-bold">Confirmar Cita</Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-3">
          <div className="mb-3">
            <strong>Paciente:</strong> {user ? user.usuario.nombre : tempUserData?.usuario?.nombre ?? tempUserData?.nombre}
          </div>
          <div className="mb-2"><strong>Médico:</strong> Dr(a). {getMedicoNombre()}</div>
          <div className="mb-2"><strong>Fecha:</strong> {fechaSeleccionada}</div>
          <div className="mb-2"><strong>Hora:</strong> {horaSeleccionada}</div>
          {descripcion && <div className="mt-2"><strong>Descripción:</strong><div className="text-muted small">{descripcion}</div></div>}
          {error && <Alert variant="danger" className="mt-3">{error}</Alert>}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowConfirmModal(false)} size="sm">Cancelar</Button>
          <Button variant="success" onClick={confirmarCita} disabled={loading} size="sm">
            {loading ? <>
              <Spinner animation="border" size="sm" className="me-2" /> Confirmando...
            </> : "Confirmar Cita"}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  )
}
