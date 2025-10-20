"use client"

import React, { useState, useEffect } from "react"
import { Modal, Button, Form, Table, Alert, Badge, Card } from "react-bootstrap"
import { FaStethoscope, FaPlus, FaTrash } from "react-icons/fa"
import { agendarCitaController } from "../../controllers/agendarCitaController"
import { useConfirm } from "../../utils/confirm"

export default function SpecialtyManager({ show, onClose, medico }) {
  const confirm = useConfirm()
  const [medicoEspecialidades, setMedicoEspecialidades] = useState([])
  const [especialidades, setEspecialidades] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [newEspId, setNewEspId] = useState("")

  useEffect(() => {
    if (show && medico) {
      loadData()
    }
  }, [show, medico])

  const loadData = async () => {
    setLoading(true)
    setError("")
    try {
      const [medEspData, espData] = await Promise.all([
        agendarCitaController.getMedicoEspecialidades(medico.usuario?.id || medico.id),
        agendarCitaController.getEspecialidades()
      ])
      setMedicoEspecialidades(medEspData || [])
      setEspecialidades(espData || [])
    } catch (e) {
      setError("Error cargando datos: " + (e?.message || e))
    } finally {
      setLoading(false)
    }
  }

  const addEspecialidad = async () => {
    if (!newEspId) {
      setError("Seleccione una especialidad")
      return
    }

    // Verificar si ya existe
    const existe = medicoEspecialidades.some(
      me => (me.especialidad?.id || me.especialidad) === parseInt(newEspId)
    )

    if (existe) {
      setError("El médico ya tiene asignada esta especialidad")
      return
    }

    try {
      setLoading(true)
      await agendarCitaController.createMedicoEspecialidad({
        medico_id: medico.usuario?.id || medico.id,
        especialidad_id: newEspId,
        activo: true
      })
      await loadData()
      setNewEspId("")
      setError("")
    } catch (e) {
      setError("Error agregando especialidad: " + (e?.message || e))
    } finally {
      setLoading(false)
    }
  }

  const removeEspecialidad = async (id) => {
    const ok = await confirm({
      title: '¿Eliminar la especialidad del médico?',
      text: 'Esta acción no se puede deshacer.',
      variant: 'danger',
      confirmButtonText: 'Sí, eliminar'
    })
    if (!ok) return
    
    try {
      setLoading(true)
      await agendarCitaController.deleteMedicoEspecialidad(id)
      await loadData()
    } catch (e) {
      setError("Error eliminando especialidad: " + (e?.message || e))
    } finally {
      setLoading(false)
    }
  }

  const especialidadesDisponibles = especialidades.filter(esp => 
    !medicoEspecialidades.some(me => 
      (me.especialidad?.id || me.especialidad) === esp.id
    )
  )

  return (
    <Modal show={show} onHide={onClose} size="lg" centered>
      <Modal.Header closeButton className="bg-success text-white">
        <Modal.Title>
          <FaStethoscope className="me-2" />
          Gestión de Especialidades del Médico
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {medico && (
          <Alert variant="info" className="mb-3">
            <strong>Médico:</strong> {medico.usuario?.nombre || medico.nombre}
            <br />
            <small className="text-muted">
              Asigne las especialidades que practica este médico
            </small>
          </Alert>
        )}

        {error && <Alert variant="danger" dismissible onClose={() => setError("")}>{error}</Alert>}

        {/* Formulario para agregar especialidad */}
        <Card className="mb-4 border-0 shadow-sm">
          <Card.Header className="bg-light">
            <strong>Agregar Especialidad</strong>
          </Card.Header>
          <Card.Body>
            <div className="d-flex gap-2 align-items-end">
              <Form.Group className="flex-grow-1">
                <Form.Label>Especialidad</Form.Label>
                <Form.Select
                  value={newEspId}
                  onChange={(e) => setNewEspId(e.target.value)}
                  disabled={loading}
                >
                  <option value="">Seleccione especialidad...</option>
                  {especialidadesDisponibles.map(esp => (
                    <option key={esp.id} value={esp.id}>{esp.nombre}</option>
                  ))}
                </Form.Select>
              </Form.Group>
              <Button
                variant="success"
                onClick={addEspecialidad}
                disabled={loading || !newEspId}
                style={{ height: '38px' }}
              >
                <FaPlus className="me-1" />
                Agregar
              </Button>
            </div>
          </Card.Body>
        </Card>

        {/* Tabla de especialidades actuales */}
        <Card className="border-0 shadow-sm">
          <Card.Header className="bg-light">
            <strong>Especialidades Asignadas</strong>
          </Card.Header>
          <Card.Body className="p-0">
            {medicoEspecialidades.length === 0 ? (
              <div className="text-center py-4 text-muted">
                No hay especialidades asignadas
              </div>
            ) : (
              <Table responsive hover className="mb-0">
                <thead className="table-light">
                  <tr>
                    <th>Especialidad</th>
                    <th>Estado</th>
                    <th className="text-center">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {medicoEspecialidades.map(me => (
                    <tr key={me.id}>
                      <td>
                        <Badge bg="success" className="fs-6">
                          {me.especialidad?.nombre || "N/A"}
                        </Badge>
                      </td>
                      <td>
                        <Badge bg={me.activo ? "success" : "secondary"}>
                          {me.activo ? "Activo" : "Inactivo"}
                        </Badge>
                      </td>
                      <td className="text-center">
                        <Button
                          size="sm"
                          variant="outline-danger"
                          onClick={() => removeEspecialidad(me.id)}
                        >
                          <FaTrash />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            )}
          </Card.Body>
        </Card>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onClose}>Cerrar</Button>
      </Modal.Footer>
    </Modal>
  )
}