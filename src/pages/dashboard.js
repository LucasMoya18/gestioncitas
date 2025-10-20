import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import Link from "next/link";
import { useRouter } from 'next/router';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

import { Container, Row, Col, Card, Navbar, Nav, Button, Table, Badge, Spinner, Alert, Tabs, Tab } from 'react-bootstrap';
import { FaStethoscope, FaSignOutAlt, FaCalendar, FaUser, FaClock, FaMapMarkerAlt, FaCheckCircle, FaExclamationTriangle, FaUserShield } from 'react-icons/fa';

import AppointmentCalendar from '@/components/appointments/AppointmentCalendar';
import AdminPanel from '@/components/admin/AdminPanel'

const API_URL = "http://127.0.0.1:8000/api";
const api = axios.create({ baseURL: API_URL, headers: { "Content-Type": "application/json" }});

export default function Dashboard() {
  const { user, logout, loading: authLoading, getUserData, isAdmin, isMedico, isPaciente } = useAuth();
  const router = useRouter();
  
  // Estados para datos reales
  const [citas, setCitas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("citas");
  
  useEffect(() => {
    if (user) {
      const userData = getUserData();
      console.log("🔍 Dashboard - User data:", userData);
      console.log("🔍 Dashboard - isAdmin:", isAdmin);
      console.log("🔍 Dashboard - isMedico:", isMedico);
      console.log("🔍 Dashboard - isPaciente:", isPaciente);
      cargarCitas();
    }
  }, [user]);

  const cargarCitas = async () => {
    try {
      setLoading(true);
      setError("");
      
      const userData = getUserData();
      if (!userData) {
        setError("No se pudo obtener información del usuario");
        return;
      }

      const response = await api.get("/citas/");
      let citasUsuario = [];

      if (isPaciente) {
        // Paciente: solo sus citas
        citasUsuario = response.data.filter(c => c.paciente === userData.id);
      } else if (isMedico) {
        // Médico: solo sus citas
        citasUsuario = response.data.filter(c => c.medico === userData.id);
      } else if (isAdmin) {
        // Admin: solo sus propias citas (si agenda como paciente)
        citasUsuario = response.data.filter(c => c.paciente === userData.id);
      }

      citasUsuario.sort((a, b) => new Date(a.fechaHora) - new Date(b.fechaHora));
      setCitas(citasUsuario);
      console.log("Citas cargadas:", citasUsuario);
    } catch (err) {
      console.error("Error cargando citas:", err);
      setError("Error al cargar las citas: " + (err.message || "Error desconocido"));
      setCitas([]);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  const formatFecha = (fechaHora) => {
    const fecha = new Date(fechaHora);
    return fecha.toLocaleDateString('es-CL', { 
      day: '2-digit', 
      month: 'short', 
      year: 'numeric' 
    });
  };

  const formatHora = (fechaHora) => {
    const fecha = new Date(fechaHora);
    return fecha.toLocaleTimeString('es-CL', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    });
  };

  const getStatusVariant = (estado) => {
    switch (estado) {
      case 'Confirmada': return 'success';
      case 'Pendiente': return 'warning';
      case 'Cancelada': return 'danger';
      case 'Reprogramada': return 'info';
      default: return 'secondary';
    }
  };

  const getStatusIcon = (estado) => {
    switch (estado) {
      case 'Confirmada': return <FaCheckCircle className="me-1" />;
      case 'Pendiente': return <FaClock className="me-1" />;
      case 'Cancelada': return <FaExclamationTriangle className="me-1" />;
      default: return null;
    }
  };

  // Calcular estadísticas
  const citasProgramadas = citas.filter(c => c.estado !== 'Cancelada').length;
  const citasConfirmadas = citas.filter(c => c.estado === 'Confirmada').length;
  const citasPendientes = citas.filter(c => c.estado === 'Pendiente').length;

  useEffect(() => {
    // Evita redirigir mientras AuthContext sigue cargando
    if (authLoading) return;
    if (!user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  // Muestra spinner mientras Auth o datos están cargando
  if (authLoading || loading) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-100">
        <Spinner animation="border" variant="primary" />
      </div>
    );
  }

  // Si aún no hay user justo al terminar la carga, evita "pantalla en blanco"
  if (!user) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-100">
        <Spinner animation="border" variant="primary" />
      </div>
    );
  }

  const userData = getUserData();
  
  if (!userData) {
    console.error("❌ No se pudo obtener datos del usuario:", user);
    return (
      <div className="text-center p-5">
        <p>Error cargando datos del usuario</p>
        <Button variant="primary" onClick={handleLogout}>Cerrar Sesión</Button>
      </div>
    );
  }

  console.log("✅ Renderizando Dashboard - isAdmin:", isAdmin, "userData:", userData);

  return (
    <>
      <Head>
        <title>Dashboard - Clínica Salud Integral</title>
        <meta name="description" content="Panel de control del usuario" />
      </Head>

      <Navbar bg="white" expand="lg" fixed="top" className="shadow-sm">
        <Container>
          <Link href="/" passHref legacyBehavior>
            <Navbar.Brand className="fw-bold text-primary">
              <FaStethoscope className="me-2" />
              Clínica Salud Integral
            </Navbar.Brand>
          </Link>
          
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="ms-auto">
              <Nav.Link 
                href="#citas" 
                className="text-dark fw-medium"
                onClick={(e) => { e.preventDefault(); setActiveTab("citas"); }}
              >
                Mis Citas
              </Nav.Link>
              <Nav.Link 
                href="#perfil" 
                className="text-dark fw-medium"
                onClick={(e) => { e.preventDefault(); setActiveTab("perfil"); }}
              >
                Mi Perfil
              </Nav.Link>
              {isAdmin && (
                <Nav.Link 
                  href="#admin" 
                  className="text-dark fw-medium"
                  onClick={(e) => { e.preventDefault(); setActiveTab("admin"); }}
                >
                  <FaUserShield className="me-1" />
                  Administración
                </Nav.Link>
              )}
              <Nav.Item className="ms-2">
                <Button variant="outline-danger" onClick={handleLogout}>
                  <FaSignOutAlt className="me-2" />
                  Cerrar Sesión
                </Button>
              </Nav.Item>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      <div style={{ paddingTop: '90px' }}>
        <Container>
          {/* Welcome Section */}
          <Row className="mb-4">
            <Col>
              <div className="d-flex justify-content-between align-items-center flex-wrap">
                <div>
                  <h1 className="fw-bold text-primary">Bienvenido, {userData?.nombre || 'Usuario'}</h1>
                  <p className="text-muted">
                    {userData?.correo || 'Sin correo'} • {userData?.rut || 'Sin RUT'}
                    {userData?.telefono && ` • ${userData.telefono}`}
                  </p>
                </div>
                <Badge bg="light" text="dark" className="fs-6 p-3">
                  <FaUser className="me-2" />
                  {userData?.rol || 'Usuario'}
                </Badge>
              </div>
            </Col>
          </Row>

          {/* Error Alert */}
          {error && (
            <Row className="mb-4">
              <Col>
                <Alert variant="danger" dismissible onClose={() => setError("")}>
                  {error}
                </Alert>
              </Col>
            </Row>
          )}

          {/* Admin Panel primero (solo Admin) */}
          {isAdmin && (
            <Row className="mb-4">
              <Col>
                <Card className="border-0 shadow-sm">
                  <Card.Body className="p-3">
                    <AdminPanel />
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          )}

          {/* Stats Cards (después del panel) */}
          <Row className="mb-4">
            <Col md={4}>
              <Card className="border-0 shadow-sm text-center">
                <Card.Body className="p-4">
                  <div className="bg-primary bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{width: '60px', height: '60px'}}>
                    <FaCalendar className="text-primary fs-4" />
                  </div>
                  <h3 className="fw-bold text-primary">{citasProgramadas}</h3>
                  <p className="text-muted mb-0">Citas Programadas</p>
                </Card.Body>
              </Card>
            </Col>
            <Col md={4}>
              <Card className="border-0 shadow-sm text-center">
                <Card.Body className="p-4">
                  <div className="bg-success bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{width: '60px', height: '60px'}}>
                    <FaClock className="text-success fs-4" />
                  </div>
                  <h3 className="fw-bold text-success">{citasConfirmadas}</h3>
                  <p className="text-muted mb-0">Citas Confirmadas</p>
                </Card.Body>
              </Card>
            </Col>
            <Col md={4}>
              <Card className="border-0 shadow-sm text-center">
                <Card.Body className="p-4">
                  <div className="bg-warning bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{width: '60px', height: '60px'}}>
                    <FaMapMarkerAlt className="text-warning fs-4" />
                  </div>
                  <h3 className="fw-bold text-warning">{citasPendientes}</h3>
                  <p className="text-muted mb-0">Por Confirmar</p>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          {/* Tabs para separar contenido */}
          <Tabs
            activeKey={activeTab}
            onSelect={(k) => setActiveTab(k)}
            className="mb-4"
            id="dashboard-tabs"
          >
            {/* Tab: Mis Citas */}
            <Tab eventKey="citas" title={<span><FaCalendar className="me-2" />Mis Citas</span>}>
              <Card className="border-0 shadow-sm">
                <Card.Header className="bg-white border-0 d-flex justify-content-between align-items-center">
                  <h4 className="fw-bold mb-0">
                    {isMedico ? 'Mis Pacientes' : 'Mis Próximas Citas'}
                  </h4>
                  <Button 
                    variant="outline-primary" 
                    size="sm" 
                    onClick={cargarCitas}
                  >
                    Actualizar
                  </Button>
                </Card.Header>
                <Card.Body>
                  {citas.length === 0 ? (
                    <div className="text-center py-5">
                      <FaCalendar className="text-muted mb-3" size={50} />
                      <p className="text-muted">No tienes citas agendadas</p>
                      <Button as={Link} href="/agendar-cita" variant="primary">
                        Agendar Nueva Cita
                      </Button>
                    </div>
                  ) : (
                    <Table responsive hover>
                      <thead>
                        <tr>
                          {isMedico ? (
                            <>
                              <th>Paciente</th>
                              <th>Especialidad</th>
                              <th>Fecha</th>
                              <th>Hora</th>
                              <th>Box</th>
                              <th>Estado</th>
                              <th>Descripción</th>
                            </>
                          ) : (
                            <>
                              <th>Médico</th>
                              <th>Especialidad</th>
                              <th>Fecha</th>
                              <th>Hora</th>
                              <th>Box</th>
                              <th>Estado</th>
                              <th>Descripción</th>
                            </>
                          )}
                        </tr>
                      </thead>
                      <tbody>
                        {citas.map((cita) => (
                          <tr key={cita.id}>
                            <td className="fw-semibold">
                              {isMedico 
                                ? (cita.paciente_nombre || `Paciente #${cita.paciente}`)
                                : (cita.medico_nombre ? `Dr(a). ${cita.medico_nombre}` : `Médico #${cita.medico}`)
                              }
                            </td>
                            <td>{cita.especialidad_nombre || 'Sin especialidad'}</td>
                            <td>{formatFecha(cita.fechaHora)}</td>
                            <td>{formatHora(cita.fechaHora)}</td>
                            <td>
                              <Badge bg="info" className="text-white">
                                {cita.box_nombre || 'Sin box'}
                              </Badge>
                            </td>
                            <td>
                              <Badge bg={getStatusVariant(cita.estado)}>
                                {getStatusIcon(cita.estado)}
                                {cita.estado}
                              </Badge>
                            </td>
                            <td>
                              <small className="text-muted">
                                {cita.descripcion || 'Sin descripción'}
                              </small>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  )}
                </Card.Body>
              </Card>
            </Tab>

            {/* Tab: Mi Perfil */}
            <Tab eventKey="perfil" title={<span><FaUser className="me-2" />Mi Perfil</span>}>
              <Card className="border-0 shadow-sm">
                <Card.Header className="bg-white border-0">
                  <h4 className="fw-bold mb-0">Mi Información</h4>
                </Card.Header>
                <Card.Body>
                  <Row>
                    <Col md={6}>
                      <div className="mb-3">
                        <label className="fw-semibold text-muted">Nombre completo</label>
                        <p className="fs-5">{userData?.nombre || '—'}</p>
                      </div>
                    </Col>
                    <Col md={6}>
                      <div className="mb-3">
                        <label className="fw-semibold text-muted">RUT</label>
                        <p className="fs-5">{userData?.rut || '—'}</p>
                      </div>
                    </Col>
                  </Row>
                  <Row>
                    <Col md={6}>
                      <div className="mb-3">
                        <label className="fw-semibold text-muted">Correo electrónico</label>
                        <p className="fs-5">{userData?.correo || '—'}</p>
                      </div>
                    </Col>
                    <Col md={6}>
                      <div className="mb-3">
                        <label className="fw-semibold text-muted">Teléfono</label>
                        <p className="fs-5">{userData?.telefono || 'No especificado'}</p>
                      </div>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>
            </Tab>

            {/* Tab: Administración (se oculta para Admin porque ya está arriba) */}
            {/* {!isAdmin && (
              <Tab eventKey="admin" title={<span><FaUserShield className="me-2" />Administración</span>}>
                <AdminPanel />
              </Tab>
            )} */}
          </Tabs>

          {/* Action Card */}
          <Row className="mt-4">
            <Col>
              <Card className="border-0 shadow-sm">
                <Card.Body className="text-center p-5">
                  <h3 className="fw-bold mb-4">¿Qué deseas hacer?</h3>
                  <div className="d-flex justify-content-center gap-3 flex-wrap">
                    <Button
                      as={Link}
                      href="/agendar-cita"
                      variant="primary"
                      size="lg"
                      className="px-4"
                    >
                      <FaCalendar className="me-2" />
                      Agendar Nueva Cita
                    </Button>
                    <Button 
                      variant="outline-primary" 
                      size="lg" 
                      className="px-4"
                      onClick={cargarCitas}
                    >
                      Actualizar Citas
                    </Button>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>

        <div className="mt-5">
          <AppointmentCalendar />
        </div>
      </div>
    </>
  );
}