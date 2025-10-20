"use client"

import React, { useState, useEffect } from "react"
import { Modal, Button, Form, Table, Alert, Badge, Card, InputGroup } from "react-bootstrap"
import { FaClinicMedical, FaPlus, FaEdit, FaTrash, FaSave, FaTimes } from "react-icons/fa"
import { boxesController } from "../../controllers/boxesController"
import { useConfirm } from "../../utils/confirm";

export default function BoxManager({ show, onClose, medico }) {
  const confirm = useConfirm();
  const [boxes, setBoxes] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [editingId, setEditingId] = useState(null)
  const [editNombre, setEditNombre] = useState("")
  const [newBox, setNewBox] = useState("")

  useEffect(() => { if (show && medico) loadData() }, [show, medico])

  const loadData = async () => {
    setLoading(true)
    setError("")
    try {
      const data = await boxesController.list(medico.usuario?.id || medico.id)
      setBoxes(data || [])
    } catch (e) { setError("Error cargando boxes") }
    finally { setLoading(false) }
  }

  const addBox = async () => {
    if (!newBox.trim()) { setError("Ingrese un nombre de box"); return }
    try {
      setLoading(true)
      await boxesController.create({ medico: (medico.usuario?.id || medico.id), nombre: newBox.trim(), activo: true })
      setNewBox("")
      await loadData()
    } catch (e) { 
      setError(e?.message || "Error creando box")
    }
    finally { setLoading(false) }
  }

  const startEdit = (b) => { setEditingId(b.id); setEditNombre(b.nombre) }
  const cancelEdit = () => { setEditingId(null); setEditNombre("") }

  const saveEdit = async (id) => {
    if (!editNombre.trim()) { setError("El nombre no puede estar vacío"); return }
    try {
      setLoading(true)
      await boxesController.update(id, { nombre: editNombre.trim() })
      await loadData()
      cancelEdit()
    } catch (e) { 
      setError(e?.message || "Error actualizando box")
    }
    finally { setLoading(false) }
  }

  const removeBox = async (id) => {
    const ok = await confirm({
      title: '¿Eliminar el box?',
      text: 'Esta acción no se puede deshacer.',
      variant: 'danger',
      confirmButtonText: 'Sí, eliminar'
    })
    if (!ok) return
    try {
      setLoading(true)
      await boxesController.remove(id)
      await loadData()
    } catch (e) { 
      setError(e?.message || "Error eliminando box")
    }
    finally { setLoading(false) }
  }

  return (
    <Modal show={show} onHide={onClose} size="lg" centered>
      <Modal.Header closeButton className="bg-info text-white">
        <Modal.Title>
          <FaClinicMedical className="me-2" />
          Gestión de Boxes del Médico
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {medico && (
          <Alert variant="info" className="mb-3">
            <strong>Médico:</strong> {medico.usuario?.nombre || medico.nombre}
            <br />
            <small className="text-muted">Cree y administre los boxes (consultorios) asociados al médico.</small>
          </Alert>
        )}

        {error && <Alert variant="danger" dismissible onClose={() => setError("")}>{error}</Alert>}

        <Card className="mb-4 border-0 shadow-sm">
          <Card.Header className="bg-light">
            <strong>Agregar Box</strong>
          </Card.Header>
          <Card.Body className="d-flex gap-2">
            <Form.Control
              placeholder="Ej: Box 101"
              value={newBox}
              onChange={(e) => setNewBox(e.target.value)}
              disabled={loading}
            />
            <Button onClick={addBox} disabled={loading || !newBox.trim()}>
              <FaPlus className="me-1" /> Agregar
            </Button>
          </Card.Body>
        </Card>

        <Card className="border-0 shadow-sm">
          <Card.Header className="bg-light">
            <strong>Boxes del Médico</strong>
          </Card.Header>
          <Card.Body className="p-0">
            {boxes.length === 0 ? (
              <div className="text-center py-4 text-muted">No hay boxes creados</div>
            ) : (
              <Table responsive hover className="mb-0">
                <thead className="table-light">
                  <tr>
                    <th>Nombre</th>
                    <th>Estado</th>
                    <th className="text-center">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {boxes.map(b => (
                    <tr key={b.id}>
                      <td>
                        {editingId === b.id ? (
                          <InputGroup size="sm">
                            <Form.Control value={editNombre} onChange={(e) => setEditNombre(e.target.value)} />
                            <Button variant="success" onClick={() => saveEdit(b.id)}><FaSave /></Button>
                            <Button variant="secondary" onClick={cancelEdit}><FaTimes /></Button>
                          </InputGroup>
                        ) : (
                          <span className="fw-bold">{b.nombre}</span>
                        )}
                      </td>
                      <td>
                        <Badge bg={b.activo ? "success" : "secondary"}>{b.activo ? "Activo" : "Inactivo"}</Badge>
                      </td>
                      <td className="text-center">
                        {editingId !== b.id && (
                          <>
                            <Button size="sm" variant="outline-warning" className="me-2" onClick={() => startEdit(b)}><FaEdit /></Button>
                            <Button size="sm" variant="outline-danger" onClick={() => removeBox(b.id)}><FaTrash /></Button>
                          </>
                        )}
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