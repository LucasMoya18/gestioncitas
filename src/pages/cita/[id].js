"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { useAuth } from '@/context/AuthContext'
import { agendarCitaController } from '@/controllers/agendarCitaController'
import { Container, Card, Row, Col, Badge, Button, Spinner, Alert } from 'react-bootstrap'
import { FaCheckCircle, FaUserMd, FaCalendarAlt, FaClock, FaMapMarkerAlt, FaExclamationTriangle, FaUser, FaIdCard, FaEnvelope, FaPhone, FaArrowLeft } from 'react-icons/fa'
import Head from 'next/head'

export default function CitaDetalle() {
  const router = useRouter()
  const { id } = router.query
  const { user, isAdmin, isMedico, loading: authLoading } = useAuth()

  const [cita, setCita] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [registrandoAsistencia, setRegistrandoAsistencia] = useState(false)
  const [usuarioDetalle, setUsuarioDetalle] = useState(null)

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
      return
    }

    if (id && user) {
      cargarCita()
    }
  }, [id, user, authLoading])

  const cargarCita = async () => {
    try {
      setLoading(true)
      setError('')

      const citaEncontrada = await agendarCitaController.getCitaById(id)
      console.log('[CITA RAW]', citaEncontrada)
      setCita(citaEncontrada)
    } catch (err) {
      console.error('Error cargando cita:', err)
      
      if (err.status === 404) {
        setError('Cita no encontrada')
      } else if (err.status === 403) {
        setError('No tiene permisos para ver esta cita')
      } else {
        setError('Error al cargar la información de la cita')
      }
    } finally {
      setLoading(false)
    }
  }

  // Cargar datos del usuario dueño de la cita si viene como ID
  useEffect(() => {
    const fetchUsuario = async () => {
      try {
        if (!cita) return
        const userId =
          typeof cita.usuario === 'number'
            ? cita.usuario
            : (cita.usuario && (cita.usuario.id || cita.usuario.pk))

        if (!userId) {
          console.log('[USUARIO DETALLE] usuario no presente como ID ni objeto')
          return
        }

        const u = await agendarCitaController.getUsuarioById(userId)
        console.log('[USUARIO DETALLE]', u)
        setUsuarioDetalle(u)
      } catch (e) {
        console.log('[USUARIO DETALLE] error cargando usuario:', e)
        setUsuarioDetalle(null)
      }
    }
    fetchUsuario()
  }, [cita])

  // 🔎 Log detallado de datos del usuario dueño de la cita cuando cambia "cita"
  useEffect(() => {
    if (!cita) return
    const usuario = cita.usuario || {}
    const detallesUsuario = {
      keysPresent: Object.keys(usuario),
      nombre: usuario.nombre || cita.paciente_nombre || cita.usuario_nombre || null,
      rut: usuario.rut || cita.paciente_rut || cita.usuario_rut || null,
      correo: usuario.correo || cita.paciente_correo || cita.usuario_correo || null,
      telefono: usuario.telefono || cita.paciente_telefono || cita.usuario_telefono || null,
      rawUsuario: usuario
    }
    console.log('[CITA USUARIO DETALLES]', detallesUsuario)
  }, [cita])

  const registrarAsistencia = async () => {
    if (!cita || !isAdmin) return

    try {
      setRegistrandoAsistencia(true)

      const nota = `[Asistencia registrada por ${user?.nombre || 'Administrador'} el ${new Date().toLocaleString('es-CL')}]`
      const nuevaDescripcion = cita.descripcion
        ? `${cita.descripcion}\n${nota}`
        : nota

      // ✅ Solo actualiza la descripción, NO el estado
      await agendarCitaController.updateCita(cita.id, {
        descripcion: nuevaDescripcion
      })

      await cargarCita()
      alert('✅ Asistencia registrada correctamente')
    } catch (err) {
      console.error('Error registrando asistencia:', err)
      alert('❌ Error al registrar asistencia')
    } finally {
      setRegistrandoAsistencia(false)
    }
  }

  const tienePermiso = isAdmin || isMedico

  const formatFecha = (fechaHora) => {
    if (!fechaHora) return 'Fecha no disponible'
    try {
      const date = new Date(fechaHora)
      return date.toLocaleDateString('es-CL', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    } catch {
      return fechaHora
    }
  }

  const formatHora = (fechaHora) => {
    if (!fechaHora) return 'Hora no disponible'
    try {
      const date = new Date(fechaHora)
      return date.toLocaleTimeString('es-CL', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      })
    } catch {
      return fechaHora
    }
  }

  const getEstadoVariant = (estado) => {
    const variants = {
      'Pendiente': 'warning',
      'Confirmada': 'success',
      'Completada': 'info',
      'Cancelada': 'danger'
    }
    return variants[estado] || 'secondary'
  }

  // ✅ Helper para extraer valores con múltiples posibles nombres
  const pickValue = (obj, keys, fallback = 'No disponible') => {
    for (const k of keys) {
      if (obj && obj[k] !== undefined && obj[k] !== null && obj[k] !== '') {
        return obj[k]
      }
    }
    return fallback
  }

  if (authLoading || loading) {
    return (
      <>
        <Head>
          <title>Cargando Cita...</title>
        </Head>
        <Container fluid className="d-flex justify-content-center align-items-center vh-100">
          <div className="text-center">
            <Spinner animation="border" variant="primary" style={{ width: '4rem', height: '4rem' }} />
            <p className="mt-3 text-muted">Cargando información...</p>
          </div>
        </Container>
      </>
    )
  }

  if (!tienePermiso) {
    return (
      <>
        <Head>
          <title>Acceso Restringido</title>
        </Head>
        <Container fluid className="d-flex justify-content-center align-items-center vh-100 bg-light">
          <Card className="shadow-lg" style={{ maxWidth: '500px', width: '100%', margin: '1rem' }}>
            <Card.Body className="text-center p-4">
              <FaExclamationTriangle className="text-danger mb-3" style={{ fontSize: '3rem' }} />
              <h2 className="h4 mb-3">Acceso Restringido</h2>
              <p className="text-muted mb-4">
                Solo el personal autorizado (Administradores y Médicos) puede acceder a esta información.
              </p>
              <Button variant="primary" onClick={() => router.push('/dashboard')}>
                <FaArrowLeft className="me-2" />
                Volver al Dashboard
              </Button>
            </Card.Body>
          </Card>
        </Container>
      </>
    )
  }

  if (error) {
    return (
      <>
        <Head>
          <title>Error - Cita</title>
        </Head>
        <Container fluid className="d-flex justify-content-center align-items-center vh-100 bg-light">
          <Card className="shadow-lg" style={{ maxWidth: '500px', width: '100%', margin: '1rem' }}>
            <Card.Body className="text-center p-4">
              <FaExclamationTriangle className="text-danger mb-3" style={{ fontSize: '3rem' }} />
              <h2 className="h4 mb-3">Error</h2>
              <Alert variant="danger">{error}</Alert>
              <Button variant="primary" onClick={() => router.push('/dashboard')}>
                <FaArrowLeft className="me-2" />
                Volver al Dashboard
              </Button>
            </Card.Body>
          </Card>
        </Container>
      </>
    )
  }

  if (!cita) {
    return (
      <>
        <Head>
          <title>Cita no encontrada</title>
        </Head>
        <Container fluid className="d-flex justify-content-center align-items-center vh-100">
          <p className="text-muted">No se encontró la cita</p>
        </Container>
      </>
    )
  }

  // A partir de aquí “cita” existe
  const usuarioObj = (typeof cita.usuario === 'object' && cita.usuario) ? cita.usuario : {}
  const source = { ...(usuarioDetalle || {}), ...(usuarioObj || {}), ...(cita || {}) }

  // 🔎 Logs para diagnosticar mapeo de datos del solicitante
  console.log('[CITA USUARIO SOURCE KEYS]', Object.keys(source || {}))
  console.log('[CITA usuarioDetalle]', usuarioDetalle)

  const pacienteNombre = pickValue(
    source,
    ['nombre', 'usuario_nombre', 'paciente_nombre', 'solicitante_nombre']
  )
  const pacienteRut = pickValue(
    source,
    ['rut', 'usuario_rut', 'paciente_rut', 'solicitante_rut']
  )
  const pacienteCorreo = pickValue(
    source,
    ['correo', 'usuario_correo', 'paciente_correo', 'email', 'solicitante_correo']
  )
  const pacienteTelefono = pickValue(
    source,
    ['telefono', 'usuario_telefono', 'paciente_telefono', 'solicitante_telefono']
  )

  const asistenciaYaRegistrada = !!(cita.descripcion && cita.descripcion.includes('[Asistencia registrada'))

  return (
    <>
      <Head>
        <title>Cita #{cita.id} - Detalle</title>
      </Head>

      <div className="d-flex flex-column" style={{ backgroundColor: '#f0f2f5', minHeight: '100vh' }}>
        <Container fluid className="py-4 d-flex justify-content-center">
          <Card
            className="shadow-lg border-0 w-100"
            style={{
              maxWidth: '1320px',       // ✅ más ancho
              minHeight: '86vh',        // ✅ más alto
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            <Card.Header className="bg-primary text-white py-4">
              <div className="d-flex flex-wrap justify-content-between align-items-center">
                <h1 className="h4 mb-0 d-flex align-items-center">
                  <FaCheckCircle className="me-2" /> Cita #{cita.id}
                </h1>
                <Badge bg={getEstadoVariant(cita.estado)} className="fs-6 px-3 py-2">
                  {cita.estado}
                </Badge>
              </div>
            </Card.Header>

  
            <Card.Body className="px-4 py-4" style={{ flex: 1 }}>
              <Row className="g-4">
                {/* Solicitante */}
                <Col xl={5} lg={6}>
                  <Card className="h-100 border-0">
                    <Card.Body className="p-3">
                      <h5 className="mb-3 text-primary d-flex align-items-center">
                        <FaUser className="me-2" /> Solicitante
                      </h5>
                      <div className="mb-2">
                        <small className="text-muted">Nombre</small>
                        <div className="fw-semibold">{pacienteNombre}</div>
                      </div>
                      <div className="mb-2">
                        <small className="text-muted">RUT</small>
                        <div className="fw-semibold">{pacienteRut}</div>
                      </div>
                      <div className="mb-2">
                        <small className="text-muted">Correo</small>
                        <div className="fw-semibold text-break">{pacienteCorreo}</div>
                      </div>
                      <div className="mb-2">
                        <small className="text-muted">Teléfono</small>
                        <div className="fw-semibold">{pacienteTelefono}</div>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>

                {/* Detalles Cita */}
                <Col xl={7} lg={6}>
                  <Card className="h-100 border-0">
                    <Card.Body className="p-3">
                      <h5 className="mb-3 text-primary d-flex align-items-center">
                        <FaCalendarAlt className="me-2" /> Detalles de la Cita
                      </h5>
                      <Row className="mb-2">
                        <Col md={6} className="mb-3">
                          <small className="text-muted">Fecha</small>
                          <div className="fw-semibold">{formatFecha(cita.fechaHora)}</div>
                        </Col>
                        <Col md={6} className="mb-3">
                          <small className="text-muted">Hora</small>
                          <div className="fw-semibold">{formatHora(cita.fechaHora)}</div>
                        </Col>
                        <Col md={6} className="mb-3">
                          <small className="text-muted">Médico</small>
                          <div className="fw-semibold d-flex align-items-center">
                            <FaUserMd className="me-2 text-secondary" />
                            {cita.medico_nombre || 'No asignado'}
                          </div>
                          {cita.especialidad_nombre && (
                            <Badge bg="info" className="mt-2">{cita.especialidad_nombre}</Badge>
                          )}
                        </Col>
                        {cita.box_numero && (
                          <Col md={6} className="mb-3">
                            <small className="text-muted">Box / Consultorio</small>
                            <div className="fw-semibold d-flex align-items-center">
                              <FaMapMarkerAlt className="me-2 text-secondary" />
                              Box {cita.box_numero}
                            </div>
                          </Col>
                        )}
                        {cita.prioridad && (
                          <Col md={6} className="mb-3">
                            <small className="text-muted">Prioridad</small>
                            <div>
                              <Badge bg={
                                cita.prioridad === 'Alta' ? 'danger' :
                                cita.prioridad === 'Media' ? 'warning' : 'secondary'
                              }>
                                {cita.prioridad}
                              </Badge>
                            </div>
                          </Col>
                        )}
                      </Row>

                      {cita.descripcion && (
                        <div className="mt-3">
                          <small className="text-muted d-block mb-2">Notas</small>
                          <Card bg="light" className="border-0">
                            <Card.Body style={{ whiteSpace: 'pre-wrap', fontSize: '0.95rem' }}>
                              {cita.descripcion}
                            </Card.Body>
                          </Card>
                        </div>
                      )}
                    </Card.Body>
                  </Card>
                </Col>
              </Row>
            </Card.Body>

            <Card.Footer className="bg-white border-0 pt-2 pb-4 px-4">
              <div className="d-flex flex-wrap gap-2">
                {isAdmin && cita.estado !== 'Cancelada' && (
                  <Button
                    variant={asistenciaYaRegistrada ? 'secondary' : 'success'}
                    onClick={registrarAsistencia}
                    disabled={registrandoAsistencia || asistenciaYaRegistrada}
                  >
                    {registrandoAsistencia ? (
                      <>
                        <Spinner animation="border" size="sm" className="me-2" />
                        Registrando...
                      </>
                    ) : asistenciaYaRegistrada ? (
                      <>
                        <FaCheckCircle className="me-2" />
                        Asistencia ya registrada
                      </>
                    ) : (
                      <>
                        <FaCheckCircle className="me-2" />
                        Registrar Asistencia
                      </>
                    )}
                  </Button>
                )}
                <Button variant="secondary" onClick={() => router.push('/dashboard')}>
                  <FaArrowLeft className="me-2" /> Volver
                </Button>
              </div>
            </Card.Footer>
          </Card>
        </Container>
      </div>
    </>
  )
}