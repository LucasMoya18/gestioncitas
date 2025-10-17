import React, { useEffect } from 'react';
import Head from 'next/head';
import Link from "next/link";
import { useRouter } from 'next/router';
import { useAuth } from '../context/AuthContext';

import { Container, Row, Col, Card, Navbar, Nav, Button, Table, Badge, Spinner } from 'react-bootstrap';
import { FaStethoscope, FaSignOutAlt, FaCalendar, FaUser, FaClock, FaMapMarkerAlt } from 'react-icons/fa';

import AppointmentCalendar from '@/components/appointments/AppointmentCalendar';
import AdminPanel from '@/components/admin/AdminPanel'

export default function Dashboard() {
  const { user, logout, loading: authLoading, getUserData, isAdmin } = useAuth();
  const router = useRouter();
  
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
    // Debug log
    console.log("User data:", user);
  }, [user, authLoading, router]);

  const handleLogout = () => {
    logout();
    router.push('/');
  };



  if (authLoading) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-100">
        <Spinner animation="border" variant="primary" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const userData = getUserData();
  
  // Verificación adicional
  if (!userData) {
    console.error("No se pudo obtener datos del usuario:", user);
    return (
      <div className="text-center p-5">
        <p>Error cargando datos del usuario</p>
        <Button variant="primary" onClick={handleLogout}>Cerrar Sesión</Button>
      </div>
    );
  }

  // Datos de ejemplo para las citas
  const appointments = [
    { id: 1, doctor: 'Dr. Carlos Rodríguez', specialty: 'Cardiología', date: '15 Dic 2023', time: '10:00 AM', status: 'confirmada' },
    { id: 2, doctor: 'Dra. María González', specialty: 'Dermatología', date: '18 Dic 2023', time: '11:30 AM', status: 'pendiente' },
    { id: 3, doctor: 'Dr. Juan Pérez', specialty: 'Ortopedia', date: '20 Dic 2023', time: '03:15 PM', status: 'cancelada' }
  ];

  const getStatusVariant = (status) => {
    switch (status) {
      case 'confirmada': return 'success';
      case 'pendiente': return 'warning';
      case 'cancelada': return 'danger';
      default: return 'secondary';
    }
  };

  return (
    <>
      <Head>
        <title>Dashboard - Clínica Salud Integral</title>
        <meta name="description" content="Panel de control del paciente" />
      </Head>

      <Navbar bg="white" expand="lg" fixed="top" className="shadow-sm">
        <Container>
          <Navbar.Brand href="/" className="fw-bold text-primary">
            <FaStethoscope className="me-2" />
            Clínica Salud Integral
          </Navbar.Brand>
          
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="ms-auto">
              <Nav.Link href="#citas" className="text-dark fw-medium">Mis Citas</Nav.Link>
              <Nav.Link href="#perfil" className="text-dark fw-medium">Mi Perfil</Nav.Link>
              <Nav.Link href="#historial" className="text-dark fw-medium">Historial</Nav.Link>
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
          <Row className="mb-5">
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

          {/* User Profile Section */}
          <Row className="mb-5">
            <Col>
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
                  <Button variant="outline-primary" size="sm">
                    Editar Información
                  </Button>
                </Card.Body>
              </Card>
            </Col>
          </Row>
          {/* Stats Cards */}
          <Row className="mb-5">
            <Col md={4}>
              <Card className="border-0 shadow-sm text-center">
                <Card.Body className="p-4">
                  <div className="bg-primary bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{width: '60px', height: '60px'}}>
                    <FaCalendar className="text-primary fs-4" />
                  </div>
                  <h3 className="fw-bold text-primary">3</h3>
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
                  <h3 className="fw-bold text-success">2</h3>
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
                  <h3 className="fw-bold text-warning">1</h3>
                  <p className="text-muted mb-0">Por Confirmar</p>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          {/* Appointments Table */}
          <Row id="citas">
            <Col>
              <Card className="border-0 shadow-sm">
                <Card.Header className="bg-white border-0">
                  <h4 className="fw-bold mb-0">Mis Próximas Citas</h4>
                </Card.Header>
                <Card.Body>
                  <Table responsive hover>
                    <thead>
                      <tr>
                        <th>Médico</th>
                        <th>Especialidad</th>
                        <th>Fecha</th>
                        <th>Hora</th>
                        <th>Estado</th>
                        <th>Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {appointments.map((appointment) => (
                        <tr key={appointment.id}>
                          <td className="fw-semibold">{appointment.doctor}</td>
                          <td>{appointment.specialty}</td>
                          <td>{appointment.date}</td>
                          <td>{appointment.time}</td>
                          <td>
                            <Badge bg={getStatusVariant(appointment.status)}>
                              {appointment.status}
                            </Badge>
                          </td>
                          <td>
                            <Button variant="outline-primary" size="sm" className="me-2">
                              Ver
                            </Button>
                            <Button variant="outline-secondary" size="sm">
                              Editar
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          {/* Admin panel: solo visible para administradores */}
          {isAdmin && (
            <Row className="mb-4">
              <Col>
                <AdminPanel />
              </Col>
            </Row>
          )}

          <Row className="mt-5">
            <Col>
              <Card className="border-0 shadow-sm">
                <Card.Body className="text-center p-5">
                  <h3 className="fw-bold mb-4">¿Qué deseas hacer?</h3>
                  <div className="d-flex justify-content-center gap-3 flex-wrap">
                    <Link href="/agendar-cita" legacyBehavior>
                      <a>
                        <Button variant="primary" size="lg" className="px-4">
                          <FaCalendar className="me-2" />
                          Agendar Nueva Cita
                        </Button>
                      </a>
                    </Link>
                    <Button variant="outline-primary" size="lg" className="px-4">
                      Ver Historial Completo
                    </Button>
                    <Button variant="outline-secondary" size="lg" className="px-4">
                      Actualizar Perfil
                    </Button>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>

        <AppointmentCalendar />
      </div>
    </>
  );
}