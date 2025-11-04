"use client"

import { useState, useEffect, useMemo } from "react";
import { Table, Form, Pagination, Button, Badge, Card, InputGroup, Spinner, Alert, Row, Col, Container, Modal, ButtonGroup, Dropdown, OverlayTrigger, Tooltip } from "react-bootstrap";
import {
  FaCalendarCheck,
  FaCalendarTimes,
  FaEdit,
  FaEye,
  FaCheck,
  FaTimes,
  FaExclamationTriangle,
  FaClock,
  FaUserMd,
  FaUser,
  FaSearch,
  FaFilter,
  FaSync,
  FaFileAlt,
  FaCalendarAlt  // Agregar este icono
} from "react-icons/fa"
import { agendarCitaController } from "../../controllers/agendarCitaController"

export default function AppointmentManager() {
  const [citas, setCitas] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  // Estados de filtros
  const [searchTerm, setSearchTerm] = useState("")
  const [filterEstado, setFilterEstado] = useState("Todas")
  const [filterPrioridad, setFilterPrioridad] = useState("Todas")
  const [filterFecha, setFilterFecha] = useState("")

  // Estados del modal
  const [showModal, setShowModal] = useState(false)
  const [selectedCita, setSelectedCita] = useState(null)
  const [modalMode, setModalMode] = useState("view") // 'view', 'edit', 'confirm', 'cancel', 'reschedule'
  const [editForm, setEditForm] = useState({
    descripcion: "",
    prioridad: "Normal",
    estado: "Pendiente"
  })

  // Estados para reprogramación
  const [rescheduleDate, setRescheduleDate] = useState("")
  const [rescheduleTime, setRescheduleTime] = useState("")
  const [availableSlots, setAvailableSlots] = useState([])
  const [loadingSlots, setLoadingSlots] = useState(false)

  // Controles de orden y paginación
  const [sortOrder, setSortOrder] = useState('desc'); // 'desc' | 'asc'
  const [perPage, setPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    loadCitas()
  }, [])

  useEffect(() => {
    setCurrentPage(1);
  }, [citas, perPage]);

  useEffect(() => {
    applyFilters()
  }, [citas, searchTerm, filterEstado, filterPrioridad, filterFecha])

  const loadCitas = async () => {
    setLoading(true)
    setError("")
    try {
      const data = await agendarCitaController.getCitas()
      setCitas(data || [])
    } catch (e) {
      setError("Error cargando citas: " + (e?.message || "Error desconocido"))
    } finally {
      setLoading(false)
    }
  }

  const applyFilters = () => {
    let filtered = [...citas]

    // Filtrar por búsqueda (paciente o médico)
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(
        (c) =>
          c.paciente_nombre?.toLowerCase().includes(term) ||
          c.medico_nombre?.toLowerCase().includes(term) ||
          c.especialidad_nombre?.toLowerCase().includes(term)
      )
    }

    // Filtrar por estado
    if (filterEstado !== "Todas") {
      filtered = filtered.filter((c) => c.estado === filterEstado)
    }

    // Filtrar por prioridad
    if (filterPrioridad !== "Todas") {
      filtered = filtered.filter((c) => c.prioridad === filterPrioridad)
    }

    // Filtrar por fecha
    if (filterFecha) {
      filtered = filtered.filter((c) => {
        const citaFecha = new Date(c.fechaHora).toISOString().split("T")[0]
        return citaFecha === filterFecha
      })
    }

    // No sobre-escribir citas, retornar el filtrado
    return filtered
  }

  // Aplicar filtros primero, luego ordenar y paginar
  const filteredCitas = applyFilters()

  const sortedCitas = useMemo(() => {
    const arr = [...filteredCitas];
    arr.sort((a, b) => {
      const da = new Date(a.fechaHora);
      const db = new Date(b.fechaHora);
      return sortOrder === 'desc' ? db - da : da - db;
    });
    return arr;
  }, [filteredCitas, sortOrder]);

  const total = sortedCitas.length;
  const totalPages = Math.max(1, Math.ceil(total / perPage));
  const safePage = Math.min(currentPage, totalPages);
  const startIdx = (safePage - 1) * perPage;
  const pagedCitas = sortedCitas.slice(startIdx, startIdx + perPage);
  const showingFrom = total === 0 ? 0 : startIdx + 1;
  const showingTo = Math.min(startIdx + perPage, total);

  const handlePerPageChange = (e) => {
    let v = parseInt(e.target.value, 10);
    if (isNaN(v) || v <= 0) v = 1;
    if (v > 100) v = 100;
    setPerPage(v);
    setCurrentPage(1);
  };

  const openModal = (cita, mode) => {
    setSelectedCita(cita)
    setModalMode(mode)
    setEditForm({
      descripcion: cita.descripcion || "",
      prioridad: cita.prioridad || "Normal",
      estado: cita.estado || "Pendiente"
    })
    
    // Inicializar fecha y hora para reprogramación
    if (mode === 'reschedule') {
      const fecha = new Date(cita.fechaHora)
      const fechaStr = fecha.toISOString().split('T')[0]
      setRescheduleDate(fechaStr)
      setRescheduleTime("")
      setAvailableSlots([])
      
      // ✅ Cargar slots automáticamente para la fecha actual
      // Usar setTimeout para asegurar que el estado se actualizó
      setTimeout(() => {
        loadRescheduleSlotsWithDate(fechaStr, cita)
      }, 100)
    }
    
    setShowModal(true)
    setError("")
    setSuccess("")
  }

  const closeModal = () => {
    setShowModal(false)
    setSelectedCita(null)
    setEditForm({ descripcion: "", prioridad: "Normal", estado: "Pendiente" })
    setRescheduleDate("")
    setRescheduleTime("")
    setAvailableSlots([])
    setError("")
    setSuccess("")
  }

  // ✅ Función helper que acepta la fecha y cita como parámetros
  const loadRescheduleSlotsWithDate = async (fecha, cita = selectedCita) => {
    if (!cita || !fecha) return
    
    setLoadingSlots(true)
    setError("")
    try {
      const response = await agendarCitaController.getMedicos()
      const medico = response.find(m => m.id === cita.medico)
      
      if (!medico) {
        setError("No se encontró el médico")
        return
      }

      // Obtener medico_especialidad_id
      const medicoEspecialidadId = cita.medico_especialidad

      const slotsResponse = await fetch(`http://127.0.0.1:8000/api/citas/horarios_disponibles/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          medico_id: medico.id,
          medico_especialidad_id: medicoEspecialidadId,
          fecha: fecha
        })
      })

      if (!slotsResponse.ok) {
        throw new Error('Error obteniendo horarios disponibles')
      }

      const slotsData = await slotsResponse.json()
      setAvailableSlots(slotsData.disponibles || [])
      
      if (slotsData.disponibles && slotsData.disponibles.length === 0) {
        setError('No hay horarios disponibles para esta fecha')
      }
    } catch (err) {
      console.error("Error cargando slots:", err)
      setError("Error cargando horarios disponibles: " + (err?.message || "Error desconocido"))
      setAvailableSlots([])
    } finally {
      setLoadingSlots(false)
    }
  }

  // Cargar slots disponibles cuando se selecciona una fecha para reprogramar
  const loadRescheduleSlots = async (fecha) => {
    await loadRescheduleSlotsWithDate(fecha, selectedCita)
  }

  const handleRescheduleCita = async () => {
    if (!selectedCita) return
    
    if (!rescheduleDate || !rescheduleTime) {
      setError("Debe seleccionar fecha y hora")
      return
    }

    setLoading(true)
    setError("")
    try {
      // Encontrar el slot seleccionado para obtener fechaHora completo en UTC
      const slotSeleccionado = availableSlots.find(s => s.horaInicio === rescheduleTime)
      if (!slotSeleccionado) {
        throw new Error("Horario seleccionado no válido")
      }

      const nuevaFechaHora = slotSeleccionado.fechaHora

      await agendarCitaController.reprogramarCita(selectedCita.id, nuevaFechaHora)
      
      setSuccess('Cita reprogramada exitosamente')
      await loadCitas()
      setTimeout(() => { closeModal() }, 1000)
    } catch (e) {
      const msg = e?.detail || e?.message || "Error reprogramando cita"
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  const formatFecha = (fechaHora) => {
    //  Formatear en zona horaria de Chile (America/Santiago)
    const date = new Date(fechaHora)
    return date.toLocaleDateString("es-CL", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      timeZone: "America/Santiago"
    })
  }

  const formatHora = (fechaHora) => {
    //  Formatear en zona horaria de Chile (America/Santiago)
    const date = new Date(fechaHora)
    return date.toLocaleTimeString("es-CL", {
      hour: "2-digit",
      minute: "2-digit",
      timeZone: "America/Santiago"
    })
  }

  const getEstadoBadge = (estado) => {
    const variants = {
      Pendiente: "warning",
      Confirmada: "success",
      Cancelada: "danger",
      Reprogramada: "info"
    }
    return <Badge bg={variants[estado] || "secondary"}>{estado}</Badge>
  }

  const getPrioridadBadge = (prioridad) => {
    return prioridad === "Urgencia" ? (
      <Badge bg="danger">
        <FaExclamationTriangle className="me-1" />
        Urgencia
      </Badge>
    ) : (
      <Badge bg="secondary">Normal</Badge>
    )
  }

  // Estadísticas
  const stats = {
    total: citas.length,
    pendientes: citas.filter((c) => c.estado === "Pendiente").length,
    confirmadas: citas.filter((c) => c.estado === "Confirmada").length,
    canceladas: citas.filter((c) => c.estado === "Cancelada").length,
    urgencias: citas.filter((c) => c.prioridad === "Urgencia").length
  }

  return (
    <Container fluid className="py-4">
      {/* Header con Estadísticas */}
      <Row className="mb-4">
        <Col>
          <h2 className="h4 mb-0">
            <FaCalendarCheck className="me-2 text-primary" />
            Gestión de Citas
          </h2>
        </Col>
        <Col xs="auto">
          <Button variant="primary" onClick={loadCitas} disabled={loading}>
            {loading ? (
              <Spinner size="sm" animation="border" />
            ) : (
              <>
                <FaSync className="me-2" />
                Actualizar
              </>
            )}
          </Button>
        </Col>
      </Row>

      {/* Estadísticas Cards */}
      <Row className="mb-4">
        <Col md={6} lg={2}>
          <Card className="stat-card border-0 shadow-sm">
            <Card.Body className="text-center">
              <h3 className="h2 mb-0 text-primary">{stats.total}</h3>
              <small className="text-muted">Total Citas</small>
            </Card.Body>
          </Card>
        </Col>
        <Col md={6} lg={2}>
          <Card className="stat-card border-0 shadow-sm">
            <Card.Body className="text-center">
              <h3 className="h2 mb-0 text-warning">{stats.pendientes}</h3>
              <small className="text-muted">Pendientes</small>
            </Card.Body>
          </Card>
        </Col>
        <Col md={6} lg={2}>
          <Card className="stat-card border-0 shadow-sm">
            <Card.Body className="text-center">
              <h3 className="h2 mb-0 text-success">{stats.confirmadas}</h3>
              <small className="text-muted">Confirmadas</small>
            </Card.Body>
          </Card>
        </Col>
        <Col md={6} lg={2}>
          <Card className="stat-card border-0 shadow-sm">
            <Card.Body className="text-center">
              <h3 className="h2 mb-0 text-danger">{stats.canceladas}</h3>
              <small className="text-muted">Canceladas</small>
            </Card.Body>
          </Card>
        </Col>
        <Col md={6} lg={2}>
          <Card className="stat-card border-0 shadow-sm">
            <Card.Body className="text-center">
              <h3 className="h2 mb-0 text-danger">{stats.urgencias}</h3>
              <small className="text-muted">Urgencias</small>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Filtros */}
      <Card className="mb-4 border-0 shadow-sm">
        <Card.Body>
          <Row className="g-3">
            <Col md={4}>
              <InputGroup>
                <InputGroup.Text>
                  <FaSearch />
                </InputGroup.Text>
                <Form.Control
                  placeholder="Buscar por paciente, médico o especialidad..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </InputGroup>
            </Col>
            <Col md={2}>
              <Form.Select
                value={filterEstado}
                onChange={(e) => setFilterEstado(e.target.value)}
              >
                <option value="Todas">Todos los estados</option>
                <option value="Pendiente">Pendiente</option>
                <option value="Confirmada">Confirmada</option>
                <option value="Cancelada">Cancelada</option>
                <option value="Reprogramada">Reprogramada</option>
              </Form.Select>
            </Col>
            <Col md={2}>
              <Form.Select
                value={filterPrioridad}
                onChange={(e) => setFilterPrioridad(e.target.value)}
              >
                <option value="Todas">Todas las prioridades</option>
                <option value="Normal">Normal</option>
                <option value="Urgencia">Urgencia</option>
              </Form.Select>
            </Col>
            <Col md={2}>
              <Form.Control
                type="date"
                value={filterFecha}
                onChange={(e) => setFilterFecha(e.target.value)}
              />
            </Col>
            <Col md={1}>
              <Button
                variant="outline-secondary"
                className="w-100"
                onClick={() => {
                  setSearchTerm("")
                  setFilterEstado("Todas")
                  setFilterPrioridad("Todas")
                  setFilterFecha("")
                }}
              >
                <FaTimes />
              </Button>
            </Col>
            {/* Agregar controles de orden y paginación */}
            <Col md={12} className="border-top pt-3 mt-3">
              <div className="d-flex align-items-center gap-3 flex-wrap">
                <Form.Label className="mb-0 text-nowrap">Ordenar:</Form.Label>
                <Form.Select size="sm" value={sortOrder} onChange={(e) => setSortOrder(e.target.value)} style={{ width: 200 }}>
                  <option value="desc">Más nuevas primero</option>
                  <option value="asc">Más antiguas primero</option>
                </Form.Select>
                <InputGroup size="sm" style={{ width: 180 }}>
                  <InputGroup.Text>Por página</InputGroup.Text>
                  <Form.Control type="number" min={1} max={100} value={perPage} onChange={handlePerPageChange} />
                </InputGroup>
                <small className="text-muted">
                  Mostrando {showingFrom}-{showingTo} de {total}
                </small>
              </div>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Mensajes */}
      {error && (
        <Alert variant="danger" dismissible onClose={() => setError("")}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert variant="success" dismissible onClose={() => setSuccess("")}>
          {success}
        </Alert>
      )}

      {/* Tabla de Citas */}
      <Card className="border-0 shadow-sm">
        <Card.Body className="p-0">
          {loading && !citas.length ? (
            <div className="text-center py-5">
              <Spinner animation="border" variant="primary" />
              <p className="mt-3 text-muted">Cargando citas...</p>
            </div>
          ) : pagedCitas.length === 0 ? (
            <div className="text-center py-5">
              <FaCalendarTimes size={48} className="text-muted mb-3" />
              <p className="text-muted">No se encontraron citas</p>
            </div>
          ) : (
            <>
              <div className="table-responsive">
                <Table hover className="mb-0">
                  <thead className="table-light">
                    <tr>
                      <th>Paciente</th>
                      <th>Médico</th>
                      <th>Especialidad</th>
                      <th>Fecha</th>
                      <th>Hora</th>
                      <th>Estado</th>
                      <th className="text-center">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pagedCitas.map((cita) => (
                      <tr key={cita.id} className="align-middle">
                        <td>
                          <FaUser className="me-2 text-muted" />
                          {cita.paciente_nombre}
                        </td>
                        <td>
                          <FaUserMd className="me-2 text-primary" />
                          {cita.medico_nombre}
                        </td>
                        <td>{cita.especialidad_nombre}</td>
                        <td>{formatFecha(cita.fechaHora)}</td>
                        <td>
                          <FaClock className="me-1 text-muted" />
                          {formatHora(cita.fechaHora)}
                        </td>
                        <td>
                          <Badge bg={cita.estado === 'Confirmada' ? 'success' : cita.estado === 'Pendiente' ? 'warning' : cita.estado === 'Cancelada' ? 'danger' : cita.estado === 'Reprogramada' ? 'info' : 'secondary'}>
                            {cita.estado}
                          </Badge>
                        </td>
                        <td>
                          <div className="d-flex gap-1 justify-content-center flex-wrap">
                            <OverlayTrigger
                              placement="top"
                              overlay={<Tooltip>Ver detalles</Tooltip>}
                            >
                              <Button
                                size="sm"
                                variant="outline-info"
                                onClick={() => openModal(cita, "view")}
                              >
                                <FaEye />
                              </Button>
                            </OverlayTrigger>

                            {cita.estado === "Pendiente" && (
                              <OverlayTrigger
                                placement="top"
                                overlay={<Tooltip>Confirmar cita</Tooltip>}
                              >
                                <Button
                                  size="sm"
                                  variant="outline-success"
                                  onClick={() => openModal(cita, "confirm")}
                                >
                                  <FaCheck />
                                </Button>
                              </OverlayTrigger>
                            )}

                            {cita.estado !== "Cancelada" && (
                              <OverlayTrigger
                                placement="top"
                                overlay={<Tooltip>Reprogramar cita</Tooltip>}
                              >
                                <Button
                                  size="sm"
                                  variant="outline-primary"
                                  onClick={() => openModal(cita, "reschedule")}
                                >
                                  <FaCalendarAlt />
                                </Button>
                              </OverlayTrigger>
                            )}

                            <OverlayTrigger
                              placement="top"
                              overlay={<Tooltip>Editar cita</Tooltip>}
                            >
                              <Button
                                size="sm"
                                variant="outline-warning"
                                onClick={() => openModal(cita, "edit")}
                              >
                                <FaEdit />
                              </Button>
                            </OverlayTrigger>

                            {cita.estado !== "Cancelada" && (
                              <OverlayTrigger
                                placement="top"
                                overlay={<Tooltip>Cancelar cita</Tooltip>}
                              >
                                <Button
                                  size="sm"
                                  variant="outline-danger"
                                  onClick={() => openModal(cita, "cancel")}
                                >
                                  <FaTimes />
                                </Button>
                              </OverlayTrigger>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>

              {/* Paginador */}
              <div className="d-flex justify-content-center p-3">
                <Pagination className="mb-0">
                  <Pagination.First onClick={() => setCurrentPage(1)} disabled={safePage === 1} />
                  <Pagination.Prev onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={safePage === 1} />
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                    <Pagination.Item key={p} active={p === safePage} onClick={() => setCurrentPage(p)}>
                      {p}
                    </Pagination.Item>
                  ))}
                  <Pagination.Next onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={safePage === totalPages} />
                  <Pagination.Last onClick={() => setCurrentPage(totalPages)} disabled={safePage === totalPages} />
                </Pagination>
              </div>
            </>
          )}
        </Card.Body>
      </Card>

      {/* Modal de Gestión */}
      <Modal show={showModal} onHide={closeModal} size="lg" centered>
        <Modal.Header closeButton className="bg-primary text-white">
          <Modal.Title>
            {modalMode === "view" && (
              <>
                <FaEye className="me-2" />
                Detalles de la Cita
              </>
            )}
            {modalMode === "edit" && (
              <>
                <FaEdit className="me-2" />
                Editar Cita
              </>
            )}
            {modalMode === "confirm" && (
              <>
                <FaCheck className="me-2" />
                Confirmar Cita
              </>
            )}
            {modalMode === "cancel" && (
              <>
                <FaTimes className="me-2" />
                Cancelar Cita
              </>
            )}
            {modalMode === "reschedule" && (
              <>
                <FaCalendarAlt className="me-2" />
                Reprogramar Cita
              </>
            )}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedCita && (
            <>
              <Row className="mb-3">
                <Col md={6}>
                  <Card className="border-0 bg-light">
                    <Card.Body>
                      <h6 className="text-muted mb-2">Paciente</h6>
                      <p className="mb-0">
                        <FaUser className="me-2" />
                        {selectedCita.paciente_nombre}
                      </p>
                    </Card.Body>
                  </Card>
                </Col>
                <Col md={6}>
                  <Card className="border-0 bg-light">
                    <Card.Body>
                      <h6 className="text-muted mb-2">Médico</h6>
                      <p className="mb-0">
                        <FaUserMd className="me-2" />
                        {selectedCita.medico_nombre}
                      </p>
                    </Card.Body>
                  </Card>
                </Col>
              </Row>

              <Row className="mb-3">
                <Col md={4}>
                  <Card className="border-0 bg-light">
                    <Card.Body>
                      <h6 className="text-muted mb-2">Especialidad</h6>
                      <p className="mb-0">{selectedCita.especialidad_nombre}</p>
                    </Card.Body>
                  </Card>
                </Col>
                <Col md={4}>
                  <Card className="border-0 bg-light">
                    <Card.Body>
                      <h6 className="text-muted mb-2">Fecha y Hora {modalMode === "reschedule" && "(Actual)"}</h6>
                      <p className="mb-0">
                        {formatFecha(selectedCita.fechaHora)} - {formatHora(selectedCita.fechaHora)}
                      </p>
                    </Card.Body>
                  </Card>
                </Col>
                <Col md={4}>
                  <Card className="border-0 bg-light">
                    <Card.Body>
                      <h6 className="text-muted mb-2">Box</h6>
                      <p className="mb-0">{selectedCita.box_nombre || "No asignado"}</p>
                    </Card.Body>
                  </Card>
                </Col>
              </Row>

              {modalMode === "view" && (
                <>
                  <Row className="mb-3">
                    <Col md={6}>
                      <Card className="border-0 bg-light">
                        <Card.Body>
                          <h6 className="text-muted mb-2">Estado</h6>
                          {getEstadoBadge(selectedCita.estado)}
                        </Card.Body>
                      </Card>
                    </Col>
                    <Col md={6}>
                      <Card className="border-0 bg-light">
                        <Card.Body>
                          <h6 className="text-muted mb-2">Prioridad</h6>
                          {getPrioridadBadge(selectedCita.prioridad)}
                        </Card.Body>
                      </Card>
                    </Col>
                  </Row>

                  {selectedCita.descripcion && (
                    <Card className="border-0 bg-light">
                      <Card.Body>
                        <h6 className="text-muted mb-2">
                          <FaFileAlt className="me-2" />
                          Descripción / Motivo
                        </h6>
                        <p className="mb-0">{selectedCita.descripcion}</p>
                      </Card.Body>
                    </Card>
                  )}
                </>
              )}

              {modalMode === "edit" && (
                <Form>
                  <Form.Group className="mb-3">
                    <Form.Label>Estado</Form.Label>
                    <Form.Select
                      value={editForm.estado}
                      onChange={(e) =>
                        setEditForm({ ...editForm, estado: e.target.value })
                      }
                    >
                      <option value="Pendiente">Pendiente</option>
                      <option value="Confirmada">Confirmada</option>
                      <option value="Cancelada">Cancelada</option>
                      <option value="Reprogramada">Reprogramada</option>
                    </Form.Select>
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Prioridad</Form.Label>
                    <Form.Select
                      value={editForm.prioridad}
                      onChange={(e) =>
                        setEditForm({ ...editForm, prioridad: e.target.value })
                      }
                    >
                      <option value="Normal">Normal</option>
                      <option value="Urgencia">Urgencia</option>
                    </Form.Select>
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Descripción / Motivo</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={4}
                      value={editForm.descripcion}
                      onChange={(e) =>
                        setEditForm({ ...editForm, descripcion: e.target.value })
                      }
                      placeholder="Ingrese el motivo o descripción de la cita..."
                    />
                  </Form.Group>
                </Form>
              )}

              {modalMode === "confirm" && (
                <Alert variant="info">
                  <FaCheck className="me-2" />
                  ¿Está seguro de confirmar esta cita?
                </Alert>
              )}

              {modalMode === "cancel" && (
                <Alert variant="warning">
                  <FaExclamationTriangle className="me-2" />
                  ¿Está seguro de cancelar esta cita? Esta acción no se puede deshacer.
                </Alert>
              )}

              {modalMode === "reschedule" && (
                <>
                  <Alert variant="info">
                    <FaCalendarAlt className="me-2" />
                    Seleccione la nueva fecha y hora para la cita. El estado cambiará a "Reprogramada".
                  </Alert>

                  <Form>
                    <Form.Group className="mb-3">
                      <Form.Label>Nueva Fecha</Form.Label>
                      <Form.Control
                        type="date"
                        value={rescheduleDate}
                        min={new Date().toISOString().split('T')[0]}
                        onChange={(e) => {
                          setRescheduleDate(e.target.value)
                          setRescheduleTime("")
                          if (e.target.value) {
                            loadRescheduleSlots(e.target.value)
                          }
                        }}
                      />
                    </Form.Group>

                    {rescheduleDate && (
                      <Form.Group className="mb-3">
                        <Form.Label>
                          Hora Disponible
                          {loadingSlots && <Spinner size="sm" animation="border" className="ms-2" />}
                        </Form.Label>
                        <Form.Select
                          value={rescheduleTime}
                          onChange={(e) => setRescheduleTime(e.target.value)}
                          disabled={loadingSlots || availableSlots.length === 0}
                        >
                          <option value="">Seleccione una hora</option>
                          {availableSlots.map((slot, idx) => (
                            <option key={idx} value={slot.horaInicio}>
                              {slot.horaInicio} - {slot.horaFin} {slot.box && `(${slot.box})`}
                            </option>
                          ))}
                        </Form.Select>
                        {rescheduleDate && availableSlots.length === 0 && !loadingSlots && (
                          <Form.Text className="text-danger">
                            No hay horarios disponibles para esta fecha
                          </Form.Text>
                        )}
                      </Form.Group>
                    )}
                  </Form>
                </>
              )}

              {error && <Alert variant="danger" className="mt-3">{error}</Alert>}
              {success && <Alert variant="success" className="mt-3">{success}</Alert>}
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={closeModal}>
            Cerrar
          </Button>

          {modalMode === "confirm" && (
            <Button
              variant="success"
              onClick={handleConfirmCita}
              disabled={loading}
            >
              {loading ? (
                <Spinner size="sm" animation="border" />
              ) : (
                <>
                  <FaCheck className="me-2" />
                  Confirmar Cita
                </>
              )}
            </Button>
          )}

          {modalMode === "edit" && (
            <Button
              variant="primary"
              onClick={handleUpdateCita}
              disabled={loading}
            >
              {loading ? (
                <Spinner size="sm" animation="border" />
              ) : (
                <>
                  <FaEdit className="me-2" />
                  Guardar Cambios
                </>
              )}
            </Button>
          )}

          {modalMode === "cancel" && (
            <Button
              variant="danger"
              onClick={handleCancelCita}
              disabled={loading}
            >
              {loading ? (
                <Spinner size="sm" animation="border" />
              ) : (
                <>
                  <FaTimes className="me-2" />
                  Cancelar Cita
                </>
              )}
            </Button>
          )}

          {modalMode === "reschedule" && (
            <Button
              variant="primary"
              onClick={handleRescheduleCita}
              disabled={loading || !rescheduleDate || !rescheduleTime}
            >
              {loading ? (
                <Spinner size="sm" animation="border" />
              ) : (
                <>
                  <FaCalendarAlt className="me-2" />
                  Reprogramar Cita
                </>
              )}
            </Button>
          )}
        </Modal.Footer>
      </Modal>
    </Container>
  )
}