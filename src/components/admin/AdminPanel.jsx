"use client"

import React, { useEffect, useState } from "react"
import { Container, Card, Button, Table, Form, Modal, Row, Col, Alert, Spinner, InputGroup, ButtonGroup, Nav, Tab } from "react-bootstrap"
import { FaPlus, FaTrash, FaEdit, FaMinus, FaClock, FaClinicMedical, FaStethoscope, FaCalendarCheck } from "react-icons/fa"
import { agendarCitaController } from "../../controllers/agendarCitaController"
import { useAuth } from "../../context/AuthContext"
import MedScheduleManager from "./MedScheduleManager"
import BoxManager from "./BoxManager"
import SpecialtyManager from "./SpecialtyManager"
import AppointmentManager from "./AppointmentManager"
import { useConfirm } from "../../utils/confirm";
import { formatRut, normalizeRutWithDash } from "../../utils/rutFormatter"

export default function AdminPanel() {
  const { user, isAdmin, isMedico } = useAuth()
  const [activeTab, setActiveTab] = useState("citas")
  const [especialidades, setEspecialidades] = useState([])
  const [medicos, setMedicos] = useState([])
  const [loading, setLoading] = useState(false)
  const [err, setErr] = useState("")
  const [medicoEspecialidades, setMedicoEspecialidades] = useState([]) // <-- FALTA ESTE ESTADO
  const [showEspModal, setShowEspModal] = useState(false)
  const [espName, setEspName] = useState("")
  const [editEspId, setEditEspId] = useState(null)
  const [showMedModal, setShowMedModal] = useState(false)
  const [editMedId, setEditMedId] = useState(null)
  const [medForm, setMedForm] = useState({
    nombre: "",
    correo: "",
    password: "",
    telefono: "",
    rut: "",
    especialidades: []
  })
  const [rutDisplay, setRutDisplay] = useState("") // visual 11.111.111-1

  // Estado para gestor de horarios
  const [showScheduleModal, setShowScheduleModal] = useState(false)
  const [selectedMedicoForSchedule, setSelectedMedicoForSchedule] = useState(null)

  // Estado para gestor de boxes
  const [showBoxModal, setShowBoxModal] = useState(false)
  const [selectedMedico, setSelectedMedico] = useState(null)

  // Estado para gestor de especialidades
  const [showSpecialtyModal, setShowSpecialtyModal] = useState(false)
  const [selectedMedicoForSpecialty, setSelectedMedicoForSpecialty] = useState(null)

  const confirm = useConfirm();

  useEffect(() => {
    if (!isAdmin && !isMedico) return
    cargarDatos()
  }, [isAdmin, isMedico])

  const cargarDatos = async () => {
    setLoading(true)
    setErr("")
    try {
      const [espData, medData, medEspData] = await Promise.all([
        agendarCitaController.getEspecialidades(),
        agendarCitaController.getMedicos(),
        agendarCitaController.getMedicoEspecialidades()
      ])
      setEspecialidades(espData)
      setMedicos(medData)
      setMedicoEspecialidades(medEspData || [])
    } catch (error) {
      setErr("Error cargando datos: " + (error?.message || error))
    } finally {
      setLoading(false)
    }
  }

  const openNewEspecialidad = () => {
    setEditEspId(null)
    setEspName("")
    setShowEspModal(true)
  }

  const saveEspecialidad = async () => {
    try {
      setLoading(true)
      if (editEspId) {
        await agendarCitaController.updateEspecialidad(editEspId, { nombre: espName })
      } else {
        await agendarCitaController.createEspecialidad({ nombre: espName })
      }
      setShowEspModal(false)
      await cargarDatos()
    } catch (e) {
      setErr("Error guardando especialidad")
    } finally {
      setLoading(false)
    }
  }

  const removeEspecialidad = async (id) => {
    const ok = await confirm({
      title: '¿Eliminar la especialidad?',
      text: 'Esta acción no se puede deshacer.',
      variant: 'danger',
      confirmButtonText: 'Sí, eliminar'
    })
    if (!ok) return
    try {
      await agendarCitaController.deleteEspecialidad(id)
      await cargarDatos()
    } catch (e) {
      setErr("Error eliminando especialidad")
    }
  }

  const startEditEspecialidad = (esp) => {
    setEditEspId(esp.id)
    setEspName(esp.nombre)
    setShowEspModal(true)
  }

  const openNewMedico = () => {
    setEditMedId(null)
    setMedForm({ nombre: "", correo: "", password: "", telefono: "", rut: "", especialidades: [] })
    setRutDisplay("") // reset visual
    setShowMedModal(true)
    setErr("")
  }

  const startEditMedico = (m) => {
    const rutSrc = m.usuario?.rut || m.rut || ""
    setEditMedId(m.usuario?.id || m.id)
    setMedForm({
      nombre: m.usuario?.nombre || m.nombre || "",
      correo: m.usuario?.correo || m.correo || "",
      password: "",
      telefono: m.usuario?.telefono || m.telefono || "",
      rut: normalizeRutWithDash(rutSrc), // mantener normalizado con guión
      especialidades: []
    })
    setRutDisplay(formatRut(rutSrc)) // mostrar con puntos y guión
    setShowMedModal(true)
    setErr("")
  }

  const handleRutChange = (e) => {
    const value = e.target.value || ""
    setRutDisplay(formatRut(value)) // visual 11.111.111-1
    setMedForm(prev => ({ ...prev, rut: normalizeRutWithDash(value) })) // enviar 11111111-1
  }

  const saveMedico = async () => {
    setErr("")
    if (!medForm.nombre || !medForm.correo || !medForm.rut) {
      setErr("Complete nombre, correo y RUT")
      return
    }
    if (!editMedId && !medForm.password) {
      setErr("La contraseña es requerida para nuevo médico")
      return
    }

    try {
      let medicoId = null

      if (editMedId) {
        // Actualizar datos del USUARIO (PATCH) para evitar requerir password y rol obligatorios
        await agendarCitaController.updateUsuario(editMedId, {
          nombre: medForm.nombre,
          correo: medForm.correo,
          telefono: medForm.telefono,
          rut: medForm.rut, // 11111111-1
          ...(medForm.password?.trim() ? { password: medForm.password } : {}),
          rol: "Medico",
        })
        medicoId = editMedId
      } else {
        // Crear médico (crea usuario + médico)
        const created = await agendarCitaController.createMedico({
          nombre: medForm.nombre,
          correo: medForm.correo,
          telefono: medForm.telefono,
          rut: medForm.rut, // 11111111-1
          password: medForm.password
        })
        medicoId = created?.id || created?.usuario?.id
      }

      if (!medicoId) {
        setErr("No se pudo obtener el ID del médico.")
        return
      }

      await cargarDatos()
      setShowMedModal(false)
      setMedForm({ nombre: "", correo: "", password: "", telefono: "", rut: "", especialidades: [] })
      setRutDisplay("")
      setEditMedId(null)
    } catch (error) {
      const apiMsg = error?.response?.data
        ? JSON.stringify(error.response.data)
        : (error?.message || "Error guardando médico")
      setErr("Error guardando médico: " + apiMsg)
    }
  }

  const removeMedico = async (m) => {
    const ok = await confirm({
      title: `¿Eliminar al médico ${m.usuario?.nombre || m.nombre}?`,
      text: 'Esta acción no se puede deshacer. Se eliminarán también sus horarios y especialidades.',
      variant: 'danger',
      confirmButtonText: 'Sí, eliminar'
    })
    if (!ok) return
    
    try {
      setLoading(true)
      setErr("")
      
      //  Usar el ID del médico (pk), no del usuario
      const medicoId = m.id || m.usuario?.id
      
      console.log(' Eliminando médico:', medicoId, m)
      
      await agendarCitaController.deleteMedico(medicoId)
      
      console.log(' Médico eliminado, recargando datos...')
      
      //  Recargar datos después de eliminar
      await cargarDatos()
      
      setErr("") // Limpiar error si había alguno
      
    } catch (error) {
      console.error(' Error eliminando médico:', error)
      setErr("Error eliminando médico: " + (error?.message || error))
    } finally {
      setLoading(false)
    }
  }

  const openScheduleManager = (medico) => {
    setSelectedMedicoForSchedule(medico)
    setShowScheduleModal(true)
  }

  const closeScheduleManager = () => {
    setShowScheduleModal(false)
    setSelectedMedicoForSchedule(null)
  }

  const openBoxManager = (medico) => {
    setSelectedMedico(medico)
    setShowBoxModal(true)
  }

  const closeBoxManager = async () => {
    setShowBoxModal(false)
    setSelectedMedico(null)
    await cargarDatos()
  }

  const openSpecialtyManager = (medico) => {
    setSelectedMedicoForSpecialty(medico)
    setShowSpecialtyModal(true)
  }

  const closeSpecialtyManager = async () => {
    setShowSpecialtyModal(false)
    setSelectedMedicoForSpecialty(null)
    await cargarDatos()
  }

  if (!isAdmin) return null

  return (
    <Container fluid className="py-4">
      <h1 className="h3 mb-4">Panel de Administración</h1>

      <Tab.Container activeKey={activeTab} onSelect={(k) => setActiveTab(k)}>
        <Nav variant="tabs" className="mb-4">
          <Nav.Item>
            <Nav.Link eventKey="citas">
              <FaCalendarCheck className="me-2" />
              Gestión de Citas
            </Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link eventKey="especialidades">
              <FaStethoscope className="me-2" />
              Especialidades
            </Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link eventKey="medicos">
              <FaClinicMedical className="me-2" />
              Médicos
            </Nav.Link>
          </Nav.Item>
        </Nav>

        <Tab.Content>
          <Tab.Pane eventKey="citas">
            <AppointmentManager />
          </Tab.Pane>

          <Tab.Pane eventKey="especialidades">
            {/* Tabla de Especialidades existente */}
            <Card className="mb-4">
              <Card.Header className="d-flex justify-content-between align-items-center">
                <h5>Especialidades</h5>
                <Button size="sm" onClick={openNewEspecialidad}>
                  + Nueva Especialidad
                </Button>
              </Card.Header>
              <Card.Body>
                <Table striped bordered hover size="sm">
                  <thead>
                    <tr>
                      <th>Nombre</th>
                      <th className="text-center">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {especialidades.map(e => (
                      <tr key={e.id}>
                        <td>{e.nombre}</td>
                        <td className="text-center">
                          <ButtonGroup size="sm">
                            <Button variant="outline-secondary" onClick={() => startEditEspecialidad(e)}>
                              <FaEdit />
                            </Button>
                            <Button variant="outline-danger" onClick={() => removeEspecialidad(e.id)}>
                              <FaTrash />
                            </Button>
                          </ButtonGroup>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </Card.Body>
            </Card>
          </Tab.Pane>

          <Tab.Pane eventKey="medicos">
            {/* Tabla de Médicos existente */}
            <Card className="mb-4">
              <Card.Header className="d-flex justify-content-between align-items-center">
                <h5>Médicos</h5>
                <Button size="sm" onClick={openNewMedico}>
                  + Nuevo Médico
                </Button>
              </Card.Header>
              <Card.Body>
                <Table striped bordered hover size="sm">
                  <thead>
                    <tr>
                      <th>Nombre</th>
                      <th>RUT</th>
                      <th>Correo</th>
                      <th>Especialidades</th>
                      <th className="text-center">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {medicos.map(m => {
                      const espMedico = (medicoEspecialidades || [])
                        .filter(me => me.medico?.id === m.usuario?.id || me.medico === (m.usuario?.id || m.id))
                        .map(me => me.especialidad?.nombre || "Sin nombre")
                        .join(", ")

                      return (
                        <tr key={m.usuario?.id || m.id}>
                          <td>{m.usuario?.nombre || m.nombre}</td>
                          <td>{m.usuario?.rut || m.rut}</td>
                          <td>{m.usuario?.correo || m.correo}</td>
                          <td>{espMedico || "Sin especialidades"}</td>
                          <td className="text-center">
                            <ButtonGroup size="sm">
                              <Button variant="success" onClick={() => openSpecialtyManager(m)} title="Gestionar Especialidades">
                                <FaStethoscope />
                              </Button>
                              <Button variant="primary" onClick={() => openScheduleManager(m)} title="Gestionar Horarios">
                                <FaClock />
                              </Button>
                              <Button variant="info" onClick={() => openBoxManager(m)} title="Gestionar Boxes">
                                <FaClinicMedical />
                              </Button>
                              <Button variant="warning" onClick={() => startEditMedico(m)} title="Editar Médico">
                                <FaEdit />
                              </Button>
                              <Button variant="danger" onClick={() => removeMedico(m)} title="Eliminar Médico">
                                <FaTrash />
                              </Button>
                            </ButtonGroup>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </Table>
              </Card.Body>
            </Card>
          </Tab.Pane>
        </Tab.Content>
      </Tab.Container>

      {/* Modal Especialidad */}
      <Modal show={showEspModal} onHide={() => setShowEspModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>{editEspId ? "Editar Especialidad" : "Nueva Especialidad"}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group>
            <Form.Label>Nombre</Form.Label>
            <Form.Control value={espName} onChange={(e) => setEspName(e.target.value)} />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowEspModal(false)}>Cancelar</Button>
          <Button variant="primary" onClick={saveEspecialidad} disabled={!espName.trim() || loading}>
            {loading ? "Guardando..." : "Guardar"}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal Médico */}
      <Modal show={showMedModal} onHide={() => setShowMedModal(false)} centered size="lg">
        <Modal.Header closeButton>
          <Modal.Title>{editMedId ? "Editar Médico" : "Crear Médico"}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Row className="g-2">
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Nombre</Form.Label>
                  <Form.Control value={medForm.nombre} onChange={(e) => setMedForm({ ...medForm, nombre: e.target.value })} />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Correo</Form.Label>
                  <Form.Control type="email" value={medForm.correo} onChange={(e) => setMedForm({ ...medForm, correo: e.target.value })} />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>RUT</Form.Label>
                  <Form.Control
                    value={rutDisplay}
                    onChange={handleRutChange}
                    disabled={!!editMedId}  // bloquear al editar
                    placeholder="11.111.111-1"
                    maxLength={12}
                  />
                  {editMedId && (
                    <Form.Text className="text-muted">
                      El RUT no se puede modificar una vez creado.
                    </Form.Text>
                  )}
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Teléfono</Form.Label>
                  <Form.Control value={medForm.telefono} onChange={(e) => setMedForm({ ...medForm, telefono: e.target.value })} />
                </Form.Group>
              </Col>
              <Col md={12}>
                <Form.Group>
                  <Form.Label>{editMedId ? "Nueva contraseña (opcional)" : "Contraseña"}</Form.Label>
                  <Form.Control type="password" value={medForm.password} onChange={(e) => setMedForm({ ...medForm, password: e.target.value })} />
                </Form.Group>
              </Col>
            </Row>
            {err && <Alert variant="danger" className="mt-2">{err}</Alert>}
            <Alert variant="info" className="mt-3">
              <small>
                Después de crear/editar el médico, use los botones de la tabla para:
                <ul className="mb-0 mt-2">
                  <li><FaStethoscope className="text-success" /> <strong>Especialidades:</strong> Asignar especialidades al médico</li>
                  <li><FaClinicMedical className="text-info" /> <strong>Boxes:</strong> Crear y gestionar boxes/consultorios</li>
                  <li><FaClock className="text-info" /> <strong>Horarios:</strong> Configurar disponibilidad por especialidad</li>
                </ul>
              </small>
            </Alert>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowMedModal(false)}>Cancelar</Button>
          <Button variant="primary" onClick={saveMedico} disabled={loading}>
            {loading ? "Guardando..." : (editMedId ? "Actualizar" : "Crear")}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Gestor de horarios */}
      {showScheduleModal && (
        <MedScheduleManager
          show={showScheduleModal}
          onClose={closeScheduleManager}
          medico={selectedMedicoForSchedule}
        />
      )}

      {/* Gestor de boxes */}
      {showBoxModal && (
        <BoxManager
          show={showBoxModal}
          onClose={closeBoxManager}
          medico={selectedMedico}
        />
      )}

      {/* Gestor de especialidades */}
      {showSpecialtyModal && (
        <SpecialtyManager
          show={showSpecialtyModal}
          onClose={closeSpecialtyManager}
          medico={selectedMedicoForSpecialty}
        />
      )}
    </Container>
  )
}