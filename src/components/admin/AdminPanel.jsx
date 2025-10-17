"use client"

import React, { useEffect, useState } from "react"
import { Card, Button, Table, Form, Modal, Row, Col, Alert, Spinner, InputGroup } from "react-bootstrap"
import { FaPlus, FaTrash, FaEdit, FaMinus } from "react-icons/fa"
import { agendarCitaController } from "../../controllers/agendarCitaController"
import { useAuth } from "../../context/AuthContext"
import MedScheduleManager from './MedScheduleManager' // nuevo componente

export default function AdminPanel() {
  const { user, isAdmin, isMedico } = useAuth()
  const [especialidades, setEspecialidades] = useState([])
  const [medicos, setMedicos] = useState([])
  const [loading, setLoading] = useState(false)
  const [err, setErr] = useState("")
  const [showEspModal, setShowEspModal] = useState(false)
  const [espName, setEspName] = useState("")
  const [editEspId, setEditEspId] = useState(null)

  // Nuevo estado para administrar médicos
  const [showMedModal, setShowMedModal] = useState(false)
  const [editMedId, setEditMedId] = useState(null)
  const [medForm, setMedForm] = useState({
    nombre: "",
    correo: "",
    password: "",
    telefono: "",
    rut: "",
    // ahora guardamos array de objetos { especialidad_id, box }
    especialidades: []
  })

  // Estado para gestor de horarios
  const [showScheduleModal, setShowScheduleModal] = useState(false)
  const [selectedMedEsp, setSelectedMedEsp] = useState(null)

  useEffect(() => {
    // cargar para admins; si es médico, también cargamos (pero filtrado luego)
    if (!isAdmin && !isMedico) return
    cargarDatos()
  }, [isAdmin, isMedico])

  const cargarDatos = async () => {
    setLoading(true)
    try {
      // traer especialidades y medicos
      const [esp, med] = await Promise.all([
        agendarCitaController.getEspecialidades(),
        agendarCitaController.getMedicos()
      ])
      // traer medico-especialidades solo si el controlador tiene la función
      const medEsp = typeof agendarCitaController.getMedicoEspecialidades === "function"
        ? await agendarCitaController.getMedicoEspecialidades()
        : []

      // agrupar medico-especialidades por id del medico (usar usuario.id cuando exista)
      const grouped = {}
      ;(medEsp || []).forEach(me => {
        const medicoId = me.medico?.usuario?.id ?? me.medico ?? me.medico_id
        if (!grouped[medicoId]) grouped[medicoId] = []
        grouped[medicoId].push(me)
      })

      // anexar medico_especialidades a cada médico
      const medWithEsp = (med || []).map(m => {
        const id = m.usuario?.id ?? m.id
        return { ...m, medico_especialidades: grouped[id] || [] }
      })

      // si es médico, filtrar para mostrar solo al propio médico
      let finalMedicos = medWithEsp
      if (isMedico && user) {
        const myId = user.usuario?.id ?? user.id
        finalMedicos = medWithEsp.filter(m => (m.usuario?.id ?? m.id) === myId)
      }

      setEspecialidades(esp || [])
      setMedicos(finalMedicos || [])
    } catch (e) {
      console.error("cargarDatos error:", e)
      setErr("Error al cargar datos")
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
      cargarDatos()
    } catch (e) {
      setErr("Error guardando especialidad")
    } finally {
      setLoading(false)
    }
  }

  const removeEspecialidad = async (id) => {
    if (!confirm("Eliminar especialidad?")) return
    try {
      await agendarCitaController.deleteEspecialidad(id)
      cargarDatos()
    } catch (e) {
      setErr("Error eliminando especialidad")
    }
  }

  const startEditEspecialidad = (esp) => {
    setEditEspId(esp.id)
    setEspName(esp.nombre)
    setShowEspModal(true)
  }

  // --- Funciones para médicos ---
  const openNewMedico = () => {
    setEditMedId(null)
    setMedForm({ nombre: "", correo: "", password: "", telefono: "", rut: "", especialidades: [] })
    setShowMedModal(true)
    setErr("")
  }

  const startEditMedico = (m) => {
    setEditMedId(m.usuario?.id ?? m.id)
    setMedForm({
      nombre: m.usuario?.nombre || m.nombre || "",
      correo: m.usuario?.correo || m.correo || "",
      password: "", // no rellenar password por seguridad
      telefono: m.usuario?.telefono || m.telefono || "",
      rut: m.usuario?.rut || m.rut || "",
      especialidades: (m.medico_especialidades || m.especialidades || []).map(me => ({
        especialidad_id: me.especialidad?.id ?? me.especialidad ?? "",
        box: me.box || ""
      }))
    })
    setShowMedModal(true)
    setErr("")
  }

  const addEspecialidadRow = () => {
    setMedForm(prev => ({ ...prev, especialidades: [...prev.especialidades, { especialidad_id: "", box: "" }] }))
  }

  const updateEspecialidadRow = (index, patch) => {
    setMedForm(prev => {
      const next = { ...prev, especialidades: [...prev.especialidades] }
      next.especialidades[index] = { ...next.especialidades[index], ...patch }
      return next
    })
  }

  const removeEspecialidadRow = (index) => {
    setMedForm(prev => {
      const next = { ...prev, especialidades: prev.especialidades.filter((_, i) => i !== index) }
      return next
    })
  }

  const saveMedico = async () => {
    // validaciones simples
    if (!medForm.nombre || !medForm.correo || !medForm.rut) {
      setErr("Nombre, correo y RUT son obligatorios")
      return
    }
    setLoading(true)
    try {
      const payload = {
        usuario: {
          nombre: medForm.nombre,
          correo: medForm.correo,
          telefono: medForm.telefono,
          rut: medForm.rut,
          rol: "Medico"
        },
        // enviar especialidades como array de objetos { especialidad_id, box }
        medico_especialidades: medForm.especialidades.map(s => ({
          especialidad_id: s.especialidad_id,
          box: s.box || ""
        })),
        especialidad_texto: "" // opcional de compatibilidad
      }
      // incluir contraseña solo al crear o si se especifica al editar
      if (!editMedId && medForm.password) {
        payload.usuario.password = medForm.password
      } else if (!editMedId && !medForm.password) {
        setErr("Debe especificar una contraseña para el nuevo médico")
        setLoading(false)
        return
      } else if (editMedId && medForm.password) {
        payload.usuario.password = medForm.password
      }

      if (editMedId) {
        await agendarCitaController.updateMedico(editMedId, payload)
      } else {
        await agendarCitaController.createMedico(payload)
      }

      setShowMedModal(false)
      cargarDatos()
    } catch (e) {
      console.error("Error guardando médico:", e)
      setErr("Error guardando médico")
    } finally {
      setLoading(false)
    }
  }

  const removeMedico = async (m) => {
    const id = m.usuario?.id ?? m.id
    if (!confirm("Eliminar médico?")) return
    try {
      await agendarCitaController.deleteMedico(id)
      cargarDatos()
    } catch (e) {
      setErr("Error eliminando médico")
    }
  }

  const openScheduleManager = (medicoEspecialidad) => {
    console.log("openScheduleManager:", medicoEspecialidad)
    setSelectedMedEsp(medicoEspecialidad)
    setShowScheduleModal(true)
  }

  const closeScheduleManager = () => {
    setShowScheduleModal(false)
    setSelectedMedEsp(null)
  }

  const onScheduleSaved = async () => {
    // refrescar datos y cerrar modal cuando MedScheduleManager notifique cambios
    await cargarDatos()
    closeScheduleManager()
  }

  if (!isAdmin) return null

  return (
    <Card className="mb-4 shadow-sm">
      <Card.Header className="d-flex justify-content-between align-items-center">
        <h5 className="mb-0">Administración — Doctores & Especialidades</h5>
        <div>
          <Button variant="outline-primary" size="sm" className="me-2" onClick={cargarDatos}>Refrescar</Button>
          <Button variant="outline-success" size="sm" className="me-2" onClick={openNewMedico}><FaPlus className="me-1" /> Nuevo Doctor</Button>
          <Button variant="primary" size="sm" onClick={openNewEspecialidad}><FaPlus className="me-1" /> Nueva Especialidad</Button>
        </div>
      </Card.Header>
      <Card.Body>
        {err && <Alert variant="danger">{err}</Alert>}
        {loading ? (
          <div className="text-center py-4"><Spinner /></div>
        ) : (
          <>
            <Row>
              <Col md={6}>
                <h6>Especialidades</h6>
                <Table size="sm" hover>
                  <thead><tr><th>Nombre</th><th></th></tr></thead>
                  <tbody>
                    {especialidades.map(e => (
                      <tr key={e.id}>
                        <td>{e.nombre}</td>
                        <td className="text-end">
                          <Button variant="outline-secondary" size="sm" className="me-2" onClick={() => startEditEspecialidad(e)}><FaEdit /></Button>
                          <Button variant="outline-danger" size="sm" onClick={() => removeEspecialidad(e.id)}><FaTrash /></Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </Col>

              <Col md={6}>
                <h6>Doctores</h6>
                <Table size="sm" hover>
                  <thead><tr><th>Nombre</th><th>Especialidad</th><th></th></tr></thead>
                  <tbody>
                    {medicos.map(m => (
                      <tr key={m.usuario?.id ?? m.id}>
                        <td>{m.usuario?.nombre || m.nombre}</td>
                        <td>
                          {(m.medico_especialidades || m.especialidades || []).map((me) => (
                            <div key={me.id} className="d-flex gap-2 align-items-center">
                              <small className="text-muted">{me.especialidad?.nombre || me.especialidad_texto}</small>
                              <Button size="sm" variant="outline-info" onClick={() => openScheduleManager(me)}>Horarios</Button>
                            </div>
                          ))}
                        </td>
                        <td className="text-end">
                          <Button variant="outline-secondary" size="sm" className="me-2" onClick={() => startEditMedico(m)}><FaEdit /></Button>
                          <Button variant="outline-danger" size="sm" onClick={() => removeMedico(m)}><FaTrash /></Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </Col>
            </Row>
          </>
        )}
      </Card.Body>

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
          <Button variant="primary" onClick={saveEspecialidad} disabled={!espName.trim() || loading}>{loading ? "Guardando..." : "Guardar"}</Button>
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
                  <Form.Control value={medForm.rut} onChange={(e) => setMedForm({ ...medForm, rut: e.target.value })} />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Teléfono</Form.Label>
                  <Form.Control value={medForm.telefono} onChange={(e) => setMedForm({ ...medForm, telefono: e.target.value })} />
                </Form.Group>
              </Col>

              {/* Nuevo: lista dinámica de especialidades con botón + */}
              <Col xs={12}>
                <Form.Label>Especialidades</Form.Label>
                <div className="mb-2">
                  {medForm.especialidades.map((row, idx) => (
                    <InputGroup className="mb-2" key={idx}>
                      <Form.Select
                        value={row.especialidad_id}
                        onChange={(e) => updateEspecialidadRow(idx, { especialidad_id: e.target.value })}
                      >
                        <option value="">Seleccione especialidad...</option>
                        {especialidades.map((esp) => (
                          <option key={esp.id} value={esp.id}>{esp.nombre}</option>
                        ))}
                      </Form.Select>
                      <Form.Control
                        placeholder="Box / Consultorio (opcional)"
                        value={row.box}
                        onChange={(e) => updateEspecialidadRow(idx, { box: e.target.value })}
                      />
                      <Button variant="outline-danger" onClick={() => removeEspecialidadRow(idx)}><FaMinus /></Button>
                    </InputGroup>
                  ))}

                  <div className="d-flex">
                    <Button size="sm" variant="outline-primary" onClick={addEspecialidadRow}><FaPlus className="me-1" /> Agregar especialidad</Button>
                    <Form.Text className="text-muted ms-3">Agrega una por una para indicar box y evitar duplicados.</Form.Text>
                  </div>
                </div>
              </Col>

              <Col md={6}>
                <Form.Group>
                  <Form.Label>{editMedId ? "Nueva contraseña (opcional)" : "Contraseña"}</Form.Label>
                  <Form.Control type="password" value={medForm.password} onChange={(e) => setMedForm({ ...medForm, password: e.target.value })} />
                </Form.Group>
              </Col>
            </Row>
            {err && <Alert variant="danger" className="mt-2">{err}</Alert>}
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowMedModal(false)}>Cancelar</Button>
          <Button variant="primary" onClick={saveMedico} disabled={loading}>{loading ? "Guardando..." : (editMedId ? "Actualizar" : "Crear")}</Button>
        </Modal.Footer>
      </Modal>

      {/* Gestor de horarios: abre al pulsar "Horarios" en la lista de doctores */}
      <MedScheduleManager
        show={showScheduleModal}
        onClose={closeScheduleManager}
        medicoEspecialidad={selectedMedEsp}
        onSaved={onScheduleSaved}
      />
    </Card>
  )
}