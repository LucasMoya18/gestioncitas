import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { Container, Row, Col, Card, Button, Spinner, Navbar, Nav } from 'react-bootstrap';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { FaStethoscope, FaCalendarCheck, FaBell, FaUserMd, FaSignInAlt, FaUserPlus, FaSignOutAlt, FaCalendarPlus, FaClock, FaHospital } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import ApiToggle from '../components/ApiToggle'; // <<--- ADD

export default function HomePage() {
  const [date, setDate] = useState(new Date());
  const { user, logout, loading: authLoading } = useAuth();

  const handleLogout = () => {
    logout();
  };

  if (authLoading) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-100">
        <Spinner animation="border" variant="primary" />
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Clínica Salud Integral</title>
        <meta name="description" content="Sistema de gestión de citas médicas" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      {/* Header */}
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
              {/* coloca el toggle aquí */}
              <div className="d-flex align-items-center me-3">
                <ApiToggle />
              </div>

              <Nav.Link href="#" className="text-dark fw-medium">Inicio</Nav.Link>
              <Nav.Link href="#" className="text-dark fw-medium">Servicios</Nav.Link>
              <Nav.Link href="#" className="text-dark fw-medium">Médicos</Nav.Link>
              <Nav.Link href="#" className="text-dark fw-medium">Contacto</Nav.Link>
              
              {user ? (
                <>
                  <Nav.Item className="ms-2">
                    <Link href="/dashboard">
                      <Button variant="outline-primary" className="fw-medium">
                        Mi Dashboard
                      </Button>
                    </Link>
                  </Nav.Item>
                  <Nav.Item className="ms-2">
                    <Button variant="outline-danger" onClick={handleLogout} className="fw-medium">
                      <FaSignOutAlt className="me-2" />
                      Cerrar Sesión
                    </Button>
                  </Nav.Item>
                </>
              ) : (
                <>
                  <Nav.Item className="ms-2">
                    <Link href="/login">
                      <Button variant="primary" className="fw-medium">
                        <FaSignInAlt className="me-2" />
                        Iniciar Sesión
                      </Button>
                    </Link>
                  </Nav.Item>
                  <Nav.Item className="ms-2">
                    <Link href="/register">
                      <Button variant="outline-primary" className="fw-medium">
                        <FaUserPlus className="me-2" />
                        Registrarse
                      </Button>
                    </Link>
                  </Nav.Item>
                </>
              )}
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      <div style={{ paddingTop: '76px' }}>
        {/* Hero Section */}
        <section className="hero-section text-center py-5 bg-primary text-white">
          <Container>
            <h1 className="display-4 fw-bold mb-4">
              <FaHospital className="me-3" />
              Sistema de Gestión de Citas Médicas
            </h1>
            <p className="lead mb-4">
              Agenda tus consultas médicas de manera rápida, segura y eficiente
            </p>
            <div className="d-flex gap-3 justify-content-center">
              <Link href="/agendar-cita">
                <Button variant="light" size="lg" className="px-4">
                  <FaCalendarPlus className="me-2" />
                  Agendar Cita
                </Button>
              </Link>
              <Link href="/login">
                <Button variant="outline-light" size="lg" className="px-4">
                  Iniciar Sesión
                </Button>
              </Link>
            </div>
          </Container>
        </section>

        {/* Features Section */}
        <section className="features-section py-5">
          <Container>
            <h2 className="text-center mb-5 fw-bold">¿Por qué elegirnos?</h2>
            <Row className="g-4">
              <Col md={4}>
                <Card className="h-100 text-center shadow-sm border-0">
                  <Card.Body className="p-4">
                    <FaCalendarPlus className="text-primary mb-3" size={50} />
                    <Card.Title className="fw-bold">Fácil Agendamiento</Card.Title>
                    <Card.Text className="text-muted">
                      Agenda tus citas en pocos clics, sin complicaciones
                    </Card.Text>
                  </Card.Body>
                </Card>
              </Col>
              <Col md={4}>
                <Card className="h-100 text-center shadow-sm border-0">
                  <Card.Body className="p-4">
                    <FaUserMd className="text-primary mb-3" size={50} />
                    <Card.Title className="fw-bold">Profesionales Calificados</Card.Title>
                    <Card.Text className="text-muted">
                      Acceso a médicos especialistas de alta calidad
                    </Card.Text>
                  </Card.Body>
                </Card>
              </Col>
              <Col md={4}>
                <Card className="h-100 text-center shadow-sm border-0">
                  <Card.Body className="p-4">
                    <FaClock className="text-primary mb-3" size={50} />
                    <Card.Title className="fw-bold">Horarios Flexibles</Card.Title>
                    <Card.Text className="text-muted">
                      Encuentra el horario que mejor se adapte a ti
                    </Card.Text>
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          </Container>
        </section>

        {/* Calendar Section */}
        <section className="py-5 bg-white">
          <Container>
            <h2 className="text-center fw-bold text-dark mb-5">Calendario de Citas Disponibles</h2>
            <Row className="justify-content-center">
              <Col md={8}>
                <Card className="shadow-sm">
                  <Card.Body className="p-4">
                    <Calendar 
                      onChange={setDate} 
                      value={date} 
                      className="w-100 border-0"
                      minDate={new Date()}
                    />
                  </Card.Body>
                </Card>
                <div className="text-center mt-4">
                  <Link href="/agendar-cita">
                    <Button variant="primary" size="lg">
                      <FaCalendarCheck className="me-2" />
                      Reservar Cita Seleccionada
                    </Button>
                  </Link>
                </div>
              </Col>
            </Row>
          </Container>
        </section>

        {/* How it Works Section */}
        <section className="py-5 bg-white">
          <div className="container py-5">
            <h2 className="text-center fw-bold text-dark mb-5">¿Cómo funciona?</h2>
            
            <div className="row">
              <div className="col-md-3 text-center mb-4 mb-md-0">
                <div className="bg-primary text-white rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{width: '60px', height: '60px'}}>
                  <span className="fw-bold fs-5">1</span>
                </div>
                <h5 className="fw-semibold mb-2">Regístrate</h5>
                <p className="text-muted">Crea una cuenta con tus datos personales de manera segura.</p>
              </div>
              
              <div className="col-md-3 text-center mb-4 mb-md-0">
                <div className="bg-primary text-white rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{width: '60px', height: '60px'}}>
                  <span className="fw-bold fs-5">2</span>
                </div>
                <h5 className="fw-semibold mb-2">Selecciona especialidad</h5>
                <p className="text-muted">Elige el tipo de consulta y especialista que necesitas.</p>
              </div>
              
              <div className="col-md-3 text-center mb-4 mb-md-0">
                <div className="bg-primary text-white rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{width: '60px', height: '60px'}}>
                  <span className="fw-bold fs-5">3</span>
                </div>
                <h5 className="fw-semibold mb-2">Elige fecha y hora</h5>
                <p className="text-muted">Selecciona el horario que mejor se adapte a tu disponibilidad.</p>
              </div>
              
              <div className="col-md-3 text-center">
                <div className="bg-primary text-white rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{width: '60px', height: '60px'}}>
                  <span className="fw-bold fs-5">4</span>
                </div>
                <h5 className="fw-semibold mb-2">Confirma tu cita</h5>
                <p className="text-muted">Recibe la confirmación inmediata de tu cita médica.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="py-5 bg-light">
          <div className="container py-5">
            <h2 className="text-center fw-bold text-dark mb-5">Opiniones de nuestros pacientes</h2>
            
            <div className="row g-4">
              <div className="col-md-6">
                <div className="card h-100 border-0 shadow-sm">
                  <div className="card-body p-4">
                    <div className="text-warning mb-3">
                      <i className="fas fa-star"></i>
                      <i className="fas fa-star"></i>
                      <i className="fas fa-star"></i>
                      <i className="fas fa-star"></i>
                      <i className="fas fa-star"></i>
                    </div>
                    <p className="text-muted mb-4">"Desde que implementaron este sistema, agendar mis citas se ha vuelto mucho más sencillo. Los recordatorios me han ayudado a no faltar a mis consultas."</p>
                    <div className="d-flex align-items-center">
                      <div className="bg-secondary rounded-circle me-3" style={{width: '50px', height: '50px'}}></div>
                      <div>
                        <h6 className="fw-semibold mb-0">María González</h6>
                        <small className="text-muted">Paciente frecuente</small>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="col-md-6">
                <div className="card h-100 border-0 shadow-sm">
                  <div className="card-body p-4">
                    <div className="text-warning mb-3">
                      <i className="fas fa-star"></i>
                      <i className="fas fa-star"></i>
                      <i className="fas fa-star"></i>
                      <i className="fas fa-star"></i>
                      <i className="fas fa-star-half-alt"></i>
                    </div>
                    <p className="text-muted mb-4">"Como persona con movilidad reducida, este sistema me ha facilitado mucho el acceso a la salud. No tengo que desplazarme para reservar hora con mi médico."</p>
                    <div className="d-flex align-items-center">
                      <div className="bg-secondary rounded-circle me-3" style={{width: '50px', height: '50px'}}></div>
                      <div>
                        <h6 className="fw-semibold mb-0">Carlos Mendoza</h6>
                        <small className="text-muted">Paciente desde 2018</small>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="cta-section py-5 bg-light">
          <Container className="text-center">
            <h2 className="fw-bold mb-4">¿Listo para agendar tu cita?</h2>
            <p className="lead mb-4 text-muted">
              Comienza ahora y accede a atención médica de calidad
            </p>
            <div className="d-flex gap-3 justify-content-center">
              <Link href="/register">
                <Button variant="primary" size="lg" className="px-4">
                  Crear Cuenta
                </Button>
              </Link>
              <Link href="/agendar-cita">
                <Button variant="outline-primary" size="lg" className="px-4">
                  <FaCalendarPlus className="me-2" />
                  Agendar sin Registro
                </Button>
              </Link>
            </div>
          </Container>
        </section>

        {/* Footer */}
        <footer className="bg-dark text-white py-5">
          <div className="container py-4">
            <div className="row">
              <div className="col-md-3 mb-4 mb-md-0">
                <h5 className="fw-semibold mb-3">Clínica Salud Integral</h5>
                <p className="text-secondary">Ofreciendo servicios médicos de calidad con tecnología de vanguardia.</p>
              </div>
              
              <div className="col-md-3 mb-4 mb-md-0">
                <h6 className="fw-semibold mb-3">Enlaces rápidos</h6>
                <ul className="list-unstyled">
                  <li className="mb-2"><a href="#" className="text-secondary text-decoration-none">Inicio</a></li>
                  <li className="mb-2"><a href="#" className="text-secondary text-decoration-none">Servicios</a></li>
                  <li className="mb-2"><a href="#" className="text-secondary text-decoration-none">Médicos</a></li>
                  <li><a href="#" className="text-secondary text-decoration-none">Contacto</a></li>
                </ul>
              </div>
              
              <div className="col-md-3 mb-4 mb-md-0">
                <h6 className="fw-semibold mb-3">Horario de atención</h6>
                <p className="text-secondary mb-1">Lunes a Viernes: 8:00 - 20:00</p>
                <p className="text-secondary mb-1">Sábados: 9:00 - 14:00</p>
                <p className="text-secondary">Urgencias: 24/7</p>
              </div>
              
              <div className="col-md-3">
                <h6 className="fw-semibold mb-3">Contacto</h6>
                <p className="text-secondary mb-2">
                  <i className="fas fa-map-marker-alt me-2"></i> Av. Principal 123, Santiago
                </p>
                <p className="text-secondary mb-2">
                  <i className="fas fa-phone me-2"></i> (2) 2345 6789
                </p>
                <p className="text-secondary">
                  <i className="fas fa-envelope me-2"></i> info@clinicasalud.cl
                </p>
              </div>
            </div>
            
            <hr className="border-secondary my-4" />
            
            <div className="text-center text-secondary">
              <p className="mb-0">&copy; 2023 Clínica Salud Integral. Todos los derechos reservados.</p>
            </div>
          </div>
        </footer>
      </div>

      <style jsx>{`
        .hero-section {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          min-height: 60vh;
          display: flex;
          align-items: center;
        }

        .features-section {
          background-color: #f8f9fa;
        }

        .card {
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }

        .card:hover {
          transform: translateY(-10px);
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1) !important;
        }

        .cta-section {
          border-top: 3px solid #667eea;
        }
      `}</style>
    </>
  );
}
