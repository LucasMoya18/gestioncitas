import React, { useEffect, useState } from "react"
import { Card, Row, Col, Spinner, Button, Badge } from "react-bootstrap"
import { FaArrowUp, FaArrowDown, FaUsers, FaCalendarAlt, FaBell, FaChartBar } from "react-icons/fa"
import { agendarCitaController } from "../../controllers/agendarCitaController"

export default function KpiWidget() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const load = async () => {
    setLoading(true)
    setError("")
    try {
      const res = await agendarCitaController.getKpis()
      setData(res)
    } catch (e) {
      setError(e?.message || "Error cargando KPIs")
      setData(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const pctBadge = (pct) => {
    if (pct === null || pct === undefined) return <Badge bg="secondary">N/A</Badge>
    const positive = pct > 0
    const Icon = positive ? FaArrowUp : FaArrowDown
    const variant = positive ? "success" : "danger"
    return (
      <Badge bg={variant} className="ms-2">
        <Icon className="me-1" />{Math.abs(pct)}%
      </Badge>
    )
  }

  return (
    <Card className="mb-4">
      <Card.Header className="d-flex justify-content-between align-items-center">
        <div><FaChartBar className="me-2" />Indicadores (KPIs)</div>
        <div>
          <Button size="sm" variant="outline-primary" onClick={load} disabled={loading}>
            {loading ? <Spinner animation="border" size="sm" /> : "Refrescar"}
          </Button>
        </div>
      </Card.Header>

      <Card.Body>
        {loading && !data ? (
          <div className="text-center py-4"><Spinner animation="border" /></div>
        ) : error ? (
          <div className="text-danger">{error}</div>
        ) : data ? (
          <Row className="g-3">
            <Col md={6} lg={3}>
              <Card className="h-100">
                <Card.Body>
                  <div className="d-flex align-items-center">
                    <FaUsers size={26} className="me-2 text-primary" />
                    <div>
                      <div className="text-muted small">Nuevos pacientes</div>
                      <div className="fs-5 fw-bold">{data.new_patients.current_month}</div>
                      <div className="small text-muted">
                        Mes anterior: {data.new_patients.last_month}
                        {pctBadge(data.new_patients.percentage_change)}
                      </div>
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </Col>

            <Col md={6} lg={3}>
              <Card className="h-100">
                <Card.Body>
                  <div className="d-flex align-items-center">
                    <FaCalendarAlt size={26} className="me-2 text-success" />
                    <div>
                      <div className="text-muted small">Citas (mes)</div>
                      <div className="fs-5 fw-bold">{data.citas.current_month}</div>
                      <div className="small text-muted">
                        Mes anterior: {data.citas.last_month}
                        {pctBadge(data.citas.percentage_change)}
                      </div>
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </Col>

            <Col md={6} lg={3}>
              <Card className="h-100">
                <Card.Body>
                  <div className="d-flex align-items-center">
                    <FaBell size={26} className="me-2 text-warning" />
                    <div>
                      <div className="text-muted small">Confirmadas próximas 30d</div>
                      <div className="fs-5 fw-bold">{data.upcoming_confirmed}</div>
                      <div className="small text-muted">Confirmadas y próximas</div>
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </Col>

            <Col md={6} lg={3}>
              <Card className="h-100">
                <Card.Body>
                  <div className="d-flex align-items-center">
                    <FaCalendarAlt size={26} className="me-2 text-danger" />
                    <div>
                      <div className="text-muted small">Pendientes</div>
                      <div className="fs-5 fw-bold">{data.pending_total}</div>
                      <div className="small text-muted">Citas en estado Pendiente</div>
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        ) : (
          <div className="text-muted">Sin datos</div>
        )}
      </Card.Body>
    </Card>
  )
}