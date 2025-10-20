"use client"

import React, { useState, useEffect } from "react"
import { Modal, Button, Form, Alert, Card, Row, Col, Spinner, Container } from "react-bootstrap"
import { FaCalendarAlt, FaUserMd, FaClock, FaCheckCircle } from "react-icons/fa"
import { useAuth } from "../../context/AuthContext"
import { agendarCitaController } from "../../controllers/agendarCitaController"
import { horariosController } from "../../controllers/horariosController"
import { useConfirm } from "../../utils/confirm";

export default function AppointmentBooking() {
  const { user, getUserData } = useAuth()
  const userData = getUserData()
  const [showRutModal, setShowRutModal] = useState(false)
  const [rut, setRut] = useState("")
  const [tempUserData, setTempUserData] = useState(null)

  // Estados para el formulario de cita
  const [especialidades, setEspecialidades] = useState([])
  const [medicos, setMedicos] = useState([])
  const [medicoEspecialidades, setMedicoEspecialidades] = useState([])
  const [medicosFiltrados, setMedicosFiltrados] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  // Selecciones del usuario
  const [especialidadSeleccionada, setEspecialidadSeleccionada] = useState("")
  const [medicoSeleccionado, setMedicoSeleccionado] = useState("")
  const [fechaSeleccionada, setFechaSeleccionada] = useState("")
  const [horaSeleccionada, setHoraSeleccionada] = useState("")
  const [descripcion, setDescripcion] = useState("")
  const [slots, setSlots] = useState([])
  const [medicoEspecialidadId, setMedicoEspecialidadId] = useState(null)

  const confirm = useConfirm();
  const [processing, setProcessing] = useState(false); // <- modal de carga propio

  useEffect(() => {
    cargarDatos()
  }, [])

  const cargarDatos = async () => {
    try {
      setLoading(true)
      const [espData, medData, medEspData] = await Promise.all([
        agendarCitaController.getEspecialidades(),
        agendarCitaController.getMedicos(),
        agendarCitaController.getMedicoEspecialidades()
      ])
      setEspecialidades(espData || [])
      setMedicos(medData || [])
      setMedicoEspecialidades(medEspData || [])
      console.log("Especialidades:", espData)
      console.log("Médicos:", medData)
      console.log("Médico-Especialidades:", medEspData)
    } catch (err) {
      console.error("Error cargando datos:", err)
      setError("Error al cargar datos iniciales")
    } finally {
      setLoading(false)
    }
  }

  // Filtrar médicos por especialidad seleccionada
  useEffect(() => {
    if (!especialidadSeleccionada) {
      setMedicosFiltrados([])
      setMedicoSeleccionado("")
      setFechaSeleccionada("") // ✅ Limpiar fecha
      setHoraSeleccionada("") // ✅ Limpiar hora
      setSlots([]) // ✅ Limpiar slots
      setMedicoEspecialidadId(null) // ✅ Limpiar ME ID
      return
    }

    const especialidad = especialidades.find(e => e.nombre === especialidadSeleccionada)
    if (!especialidad) {
      setMedicosFiltrados([])
      setMedicoSeleccionado("")
      setFechaSeleccionada("")
      setHoraSeleccionada("")
      setSlots([])
      setMedicoEspecialidadId(null)
      return
    }

    const medEspFiltradas = medicoEspecialidades.filter(me => 
      (me.especialidad?.id === especialidad.id || me.especialidad === especialidad.id) && me.activo
    )

    console.log("MedicoEsp filtradas:", medEspFiltradas)

    const medicoIds = medEspFiltradas.map(me => me.medico?.id || me.medico)

    const filtrados = medicos.filter(m => {
      const medicoId = m.usuario?.id || m.id
      return medicoIds.includes(medicoId)
    })

    console.log("Médicos filtrados:", filtrados)
    setMedicosFiltrados(filtrados)
    
    // ✅ Si el médico seleccionado no está en la lista filtrada, limpiar todo
    if (medicoSeleccionado && !filtrados.find(m => (m.usuario?.id || m.id) === Number(medicoSeleccionado))) {
      setMedicoSeleccionado("")
      setFechaSeleccionada("")
      setHoraSeleccionada("")
      setSlots([])
      setMedicoEspecialidadId(null)
    }
  }, [especialidadSeleccionada, especialidades, medicoEspecialidades, medicos])

  // ✅ Limpiar campos cuando cambia el médico
  useEffect(() => {
    if (medicoSeleccionado) {
      // Al cambiar médico, limpiar fecha, hora y slots pero mantener especialidad y descripción
      setFechaSeleccionada("")
      setHoraSeleccionada("")
      setSlots([])
    }
  }, [medicoSeleccionado])

  // Obtener medico_especialidad_id cuando se selecciona médico
  useEffect(() => {
    if (!medicoSeleccionado || !especialidadSeleccionada) {
      setMedicoEspecialidadId(null)
      setSlots([])
      setHoraSeleccionada("")
      return
    }

    const especialidad = especialidades.find(e => e.nombre === especialidadSeleccionada)
    if (!especialidad) {
      console.log("❌ Especialidad no encontrada:", especialidadSeleccionada)
      setMedicoEspecialidadId(null)
      return
    }

    // ✅ Primero encontrar el objeto Médico completo
    const medicoObj = medicos.find(m => {
      const medicoUsuarioId = m.usuario?.id || m.id
      return medicoUsuarioId === Number(medicoSeleccionado)
    })

    if (!medicoObj) {
      console.log("❌ Objeto Médico no encontrado para usuario_id:", medicoSeleccionado)
      setMedicoEspecialidadId(null)
      return
    }

    // ✅ El ID del médico en la tabla Medico (no el usuario_id)
    const medicoId = medicoObj.id

    console.log("🔍 Buscando MedicoEspecialidad para:", {
      medicoUsuarioId: Number(medicoSeleccionado),
      medicoId: medicoId,
      especialidadId: especialidad.id
    })

    // ✅ Buscar usando el ID de la tabla Medico
    const medEsp = medicoEspecialidades.find(me => {
      const meIdMedico = me.medico?.id || me.medico
      const meIdEspecialidad = me.especialidad?.id || me.especialidad
      
      const match = meIdMedico === medicoId && meIdEspecialidad === especialidad.id
      
      console.log("Comparando ME:", {
        meId: me.id, // ✅ Corrección: usar meId: en lugar de solo me.id
        meIdMedico,
        medicoId,
        meIdEspecialidad,
        especialidadId: especialidad.id,
        match
      })
      
      return match
    })

    if (medEsp) {
      console.log("✅ MedicoEspecialidad encontrada:", medEsp)
      setMedicoEspecialidadId(medEsp.id)
    } else {
      console.log("❌ No se encontró MedicoEspecialidad")
      console.log("Todas las MedicoEspecialidades:", medicoEspecialidades)
      console.log("Médico objeto:", medicoObj)
      setMedicoEspecialidadId(null)
    }
  }, [medicoSeleccionado, especialidadSeleccionada, especialidades, medicoEspecialidades, medicos])

  // ✅ Limpiar hora cuando cambia la fecha
  useEffect(() => {
    if (fechaSeleccionada) {
      setHoraSeleccionada("")
      setSlots([])
    }
  }, [fechaSeleccionada])

  // Cargar slots cuando hay médico, me_id y fecha
  useEffect(() => {
    if (medicoSeleccionado && medicoEspecialidadId && fechaSeleccionada) {
      cargarSlots()
    } else {
      setSlots([])
      setHoraSeleccionada("")
    }
  }, [medicoSeleccionado, medicoEspecialidadId, fechaSeleccionada])

  const cargarSlots = async () => {
    try {
      setLoading(true)
      setError("")
      
      const medicoObj = medicos.find(m => {
        const medicoUsuarioId = m.usuario?.id || m.id
        return medicoUsuarioId === Number(medicoSeleccionado)
      })

      if (!medicoObj) {
        console.error("❌ No se encontró el objeto médico")
        setError("Error al cargar horarios: médico no encontrado")
        return
      }

      const medicoId = medicoObj.id

      console.log("Cargando slots para:", {
        medicoUsuarioId: medicoSeleccionado,
        medicoId: medicoId,
        medEsp: medicoEspecialidadId,
        fecha: fechaSeleccionada
      })
      
      const data = await horariosController.getHorariosDisponibles(
        Number(medicoId),
        Number(medicoEspecialidadId),
        fechaSeleccionada
      )
      
      console.log("Slots recibidos:", data)
      setSlots(data?.disponibles || [])
      
      if (!data?.disponibles || data.disponibles.length === 0) {
        setError("No hay horarios disponibles para esta fecha")
      }
    } catch (e) {
      console.error("Error cargando slots:", e)
      setSlots([])
      setError(e?.mensaje || e?.error || "No hay horarios disponibles para esa fecha")
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
    setSuccess("")

    if (!horaSeleccionada || !medicoEspecialidadId) {
      setError("Debe seleccionar una hora y especialidad")
      return
    }

    // ✅ Si no hay usuario autenticado, mostrar modal de RUT
    if (!user) {
      setShowRutModal(true)
      return
    }

    // ✅ Si hay usuario autenticado, proceder directamente
    await agendarCitaDirecta()
  }

  const agendarCitaDirecta = async () => {
    setLoading(true)
    setError("")
    try {
      const slotSeleccionado = slots.find(s => s.horaInicio === horaSeleccionada)
      let fechaHoraISO = slotSeleccionado?.fechaHora
      if (!fechaHoraISO) throw new Error("No se pudo obtener la fecha del slot seleccionado")
      if (!fechaHoraISO.includes('Z') && !fechaHoraISO.includes('+') && !fechaHoraISO.includes('-', 10)) {
        fechaHoraISO = fechaHoraISO + '-03:00'
      }

      const ok = await confirm({
        title: '¿Confirmar agendamiento?',
        text: [
          getMedicoNombre() ? `Médico: ${getMedicoNombre()}` : null,
          fechaSeleccionada ? `Fecha: ${fechaSeleccionada}` : null,
          slotSeleccionado ? `Hora: ${slotSeleccionado.horaInicio} - ${slotSeleccionado.horaFin}` : null,
          slotSeleccionado?.box ? `Box: ${slotSeleccionado.box}` : null
        ].filter(Boolean).join(' • '),
        confirmButtonText: 'Agendar',
        variant: 'primary'
      })
      if (!ok) { setLoading(false); return }

      // alerts.showLoading('Agendando cita...') // <- quitar
      setProcessing(true) // <- mostrar modal de carga

      const medicoObj = medicos.find(m => {
        const medicoUsuarioId = m.usuario?.id || m.id
        return medicoUsuarioId === Number(medicoSeleccionado)
      })
      if (!medicoObj) throw new Error("Error: médico no encontrado")

      const citaData = {
        medico: Number(medicoObj.id),
        medico_especialidad: Number(medicoEspecialidadId),
        fechaHora: fechaHoraISO,
        descripcion: descripcion,
        prioridad: "Normal"
      }

      if (user) {
        citaData.usuario_id = Number(userData.id)
      } else if (tempUserData) {
        citaData.paciente = Number(tempUserData.id)
      } else {
        throw new Error("No se pudo identificar al paciente")
      }

      const resultado = await agendarCitaController.agendarCita(citaData)
      console.log("✅ Cita creada:", resultado)
      setSuccess('¡Cita agendada exitosamente!')
      // Limpieza opcional del formulario
      setHoraSeleccionada("")
      setFechaSeleccionada("")
      setDescripcion("")
      setSlots([])
    } catch (err) {
      console.error("❌ Error agendando cita:", err)
      const errorMsg = err?.fechaHora?.[0] || err?.paciente?.[0] || err?.usuario_id?.[0] || err?.error || err?.message || "Error al agendar la cita"
      setError(errorMsg)
    } finally {
      setProcessing(false) // <- cerrar modal de carga
      setLoading(false)
    }
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
        setError("")
        
        // ✅ Agendar la cita después de verificar el RUT
        await agendarCitaDirecta()
      } else {
        setError("RUT no registrado. Por favor regístrese primero.")
      }
    } catch (err) {
      setError("Error al verificar RUT: " + (err?.message || err))
    } finally {
      setLoading(false)
    }
  }

  const getMedicoNombre = () => {
    const medico = medicos.find((m) => {
      const id = m.usuario?.id ?? m.id
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
                <p className="mb-0 text-muted small">Seleccione especialidad, médico, fecha y hora</p>
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
                  <Row className="g-3">
                    <Col md={6}>
                      <Form.Group>
                        <Form.Label className="fw-medium small mb-1">Especialidad *</Form.Label>
                        <Form.Select
                          value={especialidadSeleccionada}
                          onChange={(e) => setEspecialidadSeleccionada(e.target.value)}
                        >
                          <option value="">Seleccione especialidad...</option>
                          {especialidades.map((esp) => (
                            <option key={esp.id} value={esp.nombre}>
                              {esp.nombre}
                            </option>
                          ))}
                        </Form.Select>
                      </Form.Group>
                    </Col>

                    <Col md={6}>
                      <Form.Group>
                        <Form.Label className="fw-medium small mb-1">Médico *</Form.Label>
                        <Form.Select
                          value={medicoSeleccionado}
                          onChange={(e) => setMedicoSeleccionado(e.target.value)}
                          disabled={!especialidadSeleccionada}
                        >
                          <option value="">
                            {!especialidadSeleccionada 
                              ? "Primero seleccione una especialidad..." 
                              : medicosFiltrados.length === 0 
                                ? "No hay médicos disponibles" 
                                : "Seleccione médico..."}
                          </option>
                          {medicosFiltrados.map((medico) => (
                            <option key={medico.usuario?.id ?? medico.id} value={medico.usuario?.id ?? medico.id}>
                              Dr(a). {medico.usuario?.nombre || medico.nombre}
                            </option>
                          ))}
                        </Form.Select>
                        {especialidadSeleccionada && medicosFiltrados.length === 0 && (
                          <Form.Text className="text-danger">
                            No hay médicos disponibles para esta especialidad
                          </Form.Text>
                        )}
                      </Form.Group>
                    </Col>

                    <Col md={6}>
                      <Form.Group>
                        <Form.Label className="fw-medium small mb-1">Fecha *</Form.Label>
                        <Form.Control
                          type="date"
                          value={fechaSeleccionada}
                          onChange={(e) => setFechaSeleccionada(e.target.value)}
                          min={new Date().toISOString().split("T")[0]}
                          disabled={!medicoSeleccionado}
                        />
                      </Form.Group>
                    </Col>

                    <Col md={6}>
                      <Form.Group>
                        <Form.Label className="fw-medium small mb-1">Hora *</Form.Label>
                        <Form.Select
                          value={horaSeleccionada}
                          onChange={(e) => setHoraSeleccionada(e.target.value)}
                          disabled={!fechaSeleccionada || !medicoEspecialidadId || slots.length === 0}
                        >
                          <option value="">
                            {!fechaSeleccionada 
                              ? "Primero seleccione una fecha..." 
                              : slots.length === 0 
                                ? "Sin horarios disponibles" 
                                : "Seleccione hora..."}
                          </option>
                          {slots.map((s, idx) => (
                            <option key={idx} value={s.horaInicio}>
                              {s.horaInicio} - {s.horaFin} | Box {s.box}
                            </option>
                          ))}
                        </Form.Select>
                      </Form.Group>
                    </Col>

                    <Col xs={12}>
                      <Form.Group>
                        <Form.Label className="fw-medium small mb-1">Descripción (opcional)</Form.Label>
                        <Form.Control
                          as="textarea"
                          rows={2}
                          value={descripcion}
                          onChange={(e) => setDescripcion(e.target.value)}
                          placeholder="Motivo de la consulta, síntomas breves..."
                        />
                      </Form.Group>
                    </Col>
                  </Row>

                  <div className="d-flex justify-content-end mt-3 gap-2">
                    <Button
                      variant="outline-secondary"
                      onClick={() => {
                        setEspecialidadSeleccionada("")
                        setMedicoSeleccionado("")
                        setFechaSeleccionada("")
                        setHoraSeleccionada("")
                        setDescripcion("")
                        setSlots([])
                        setError("")
                      }}
                    >
                      Limpiar
                    </Button>

                    <Button
                      variant="primary"
                      type="submit"
                      disabled={loading || !medicoSeleccionado || !fechaSeleccionada || !horaSeleccionada}
                    >
                      {loading ? (
                        <>
                          <Spinner animation="border" size="sm" className="me-2" />
                          Procesando...
                        </>
                      ) : (
                        <>
                          <FaCheckCircle className="me-2" /> Agendar Cita
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
          <Button variant="secondary" onClick={() => setShowRutModal(false)}>Cancelar</Button>
          <Button variant="primary" onClick={handleRutSubmit} disabled={loading}>
            {loading ? (
              <>
                <Spinner animation="border" size="sm" className="me-2" />
                Verificando y agendando...
              </>
            ) : (
              "Verificar y Agendar"
            )}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal de procesamiento (sustituye al showLoading de SweetAlert) */}
      <Modal show={processing} centered backdrop="static" keyboard={false}>
        <Modal.Body className="d-flex align-items-center gap-3">
          <Spinner animation="border" variant="primary" />
          <div>
            <div className="fw-bold">Agendando cita...</div>
            <div className="text-muted small">Por favor, espere</div>
          </div>
        </Modal.Body>
      </Modal>
    </div>
  )
}
