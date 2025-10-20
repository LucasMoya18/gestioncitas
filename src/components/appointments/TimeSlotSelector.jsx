"use client"

import React, { useState, useEffect } from "react"
import { Row, Col, Card, Badge, Spinner, Alert } from "react-bootstrap"
import { FaClock, FaCheckCircle } from "react-icons/fa"

export default function TimeSlotSelector({ 
  medicoId, 
  medicoEspecialidadId, 
  fecha, 
  onSelectSlot, 
  selectedSlot 
}) {
  const [slots, setSlots] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [info, setInfo] = useState(null)

  useEffect(() => {
    if (medicoId && medicoEspecialidadId && fecha) {
      loadSlots()
    }
  }, [medicoId, medicoEspecialidadId, fecha])

  const loadSlots = async () => {
    setLoading(true)
    setError("")
    try {
      const { agendarCitaController } = await import("../../controllers/agendarCitaController")
      const data = await agendarCitaController.getHorariosDisponibles(
        medicoId,
        medicoEspecialidadId,
        fecha
      )
      setSlots(data.disponibles || [])
      setInfo({
        medico: data.medico,
        especialidad: data.especialidad,
        box: data.box,
        dia: data.dia
      })
    } catch (e) {
      setError(e?.error || e?.message || "Error cargando horarios disponibles")
      setSlots([])
    } finally {
      setLoading(false)
    }
  }

  const groupSlotsByPeriod = () => {
    const morning = slots.filter(s => {
      const hour = parseInt(s.hora.split(':')[0])
      return hour >= 8 && hour < 12
    })
    const afternoon = slots.filter(s => {
      const hour = parseInt(s.hora.split(':')[0])
      return hour >= 12 && hour < 17
    })
    const evening = slots.filter(s => {
      const hour = parseInt(s.hora.split(':')[0])
      return hour >= 17 && hour < 20
    })
    return { morning, afternoon, evening }
  }

  if (loading) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" variant="primary" />
        <p className="mt-3 text-muted">Cargando horarios disponibles...</p>
      </div>
    )
  }

  if (error) {
    return <Alert variant="danger">{error}</Alert>
  }

  if (!slots.length) {
    return (
      <Alert variant="warning">
        <FaClock className="me-2" />
        No hay horarios disponibles para la fecha seleccionada.
      </Alert>
    )
  }

  const { morning, afternoon, evening } = groupSlotsByPeriod()

  return (
    <div>
      {info && (
        <Card className="mb-4 border-0 shadow-sm">
          <Card.Body>
            <Row>
              <Col md={3}>
                <small className="text-muted d-block">Médico</small>
                <strong>{info.medico}</strong>
              </Col>
              <Col md={3}>
                <small className="text-muted d-block">Especialidad</small>
                <strong>{info.especialidad}</strong>
              </Col>
              <Col md={3}>
                <small className="text-muted d-block">Box</small>
                <Badge bg="info" className="fs-6">{info.box}</Badge>
              </Col>
              <Col md={3}>
                <small className="text-muted d-block">Día</small>
                <strong>{info.dia}</strong>
              </Col>
            </Row>
          </Card.Body>
        </Card>
      )}

      {morning.length > 0 && (
        <div className="mb-4">
          <h6 className="text-primary mb-3">
            <FaClock className="me-2" />
            Mañana (8:00 AM - 12:00 PM)
          </h6>
          <Row className="g-2">
            {morning.map((slot, idx) => (
              <Col xs={6} sm={4} md={3} lg={2} key={idx}>
                <Card 
                  className={`time-slot-card ${selectedSlot === slot.fechaHora ? 'selected' : ''}`}
                  onClick={() => onSelectSlot(slot)}
                  style={{ cursor: 'pointer' }}
                >
                  <Card.Body className="text-center p-2">
                    {selectedSlot === slot.fechaHora && (
                      <FaCheckCircle className="text-success mb-1" />
                    )}
                    <div className="fw-bold">{slot.hora}</div>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        </div>
      )}

      {afternoon.length > 0 && (
        <div className="mb-4">
          <h6 className="text-primary mb-3">
            <FaClock className="me-2" />
            Tarde (12:00 PM - 5:00 PM)
          </h6>
          <Row className="g-2">
            {afternoon.map((slot, idx) => (
              <Col xs={6} sm={4} md={3} lg={2} key={idx}>
                <Card 
                  className={`time-slot-card ${selectedSlot === slot.fechaHora ? 'selected' : ''}`}
                  onClick={() => onSelectSlot(slot)}
                  style={{ cursor: 'pointer' }}
                >
                  <Card.Body className="text-center p-2">
                    {selectedSlot === slot.fechaHora && (
                      <FaCheckCircle className="text-success mb-1" />
                    )}
                    <div className="fw-bold">{slot.hora}</div>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        </div>
      )}

      {evening.length > 0 && (
        <div className="mb-4">
          <h6 className="text-primary mb-3">
            <FaClock className="me-2" />
            Noche (5:00 PM - 8:00 PM)
          </h6>
          <Row className="g-2">
            {evening.map((slot, idx) => (
              <Col xs={6} sm={4} md={3} lg={2} key={idx}>
                <Card 
                  className={`time-slot-card ${selectedSlot === slot.fechaHora ? 'selected' : ''}`}
                  onClick={() => onSelectSlot(slot)}
                  style={{ cursor: 'pointer' }}
                >
                  <Card.Body className="text-center p-2">
                    {selectedSlot === slot.fechaHora && (
                      <FaCheckCircle className="text-success mb-1" />
                    )}
                    <div className="fw-bold">{slot.hora}</div>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        </div>
      )}

      <style jsx global>{`
        .time-slot-card {
          transition: all 0.3s ease;
          border: 2px solid #e9ecef;
        }
        .time-slot-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 8px rgba(0,0,0,0.1);
          border-color: #0d6efd;
        }
        .time-slot-card.selected {
          background-color: #d1e7dd;
          border-color: #198754;
        }
      `}</style>
    </div>
  )
}