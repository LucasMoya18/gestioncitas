import React, { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { Container, Row, Col, Card, Navbar, Nav } from 'react-bootstrap';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { useAuth } from "../context/AuthContext";
import { FaStethoscope, FaCalendarCheck, FaBell, FaUserMd, FaSignInAlt, FaUserPlus } from 'react-icons/fa';

export default function HomePage() {
  const [date, setDate] = useState(new Date());
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
  };
  
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
          <Navbar.Brand href="#" className="fw-bold text-primary">
            <FaStethoscope className="me-2" />
            Clínica Salud Integral
          </Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="ms-auto">
              <Nav.Link href="#" className="text-dark fw-medium">Inicio</Nav.Link>
              <Nav.Link href="#" className="text-dark fw-medium">Servicios</Nav.Link>
              <Nav.Link href="#" className="text-dark fw-medium">Médicos</Nav.Link>
              <Nav.Link href="#" className="text-dark fw-medium">Contacto</Nav.Link>
              
              {user ? (
                <>
                  <Nav.Item className="ms-2">
                    <Link href="/dashboard" passHref legacyBehavior>
                      <Nav.Link className="btn btn-outline-primary fw-medium">
                        Mi Dashboard
                      </Nav.Link>
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
                    <Link href="/login" passHref legacyBehavior>
                      <Nav.Link className="btn btn-primary fw-medium">
                        <FaSignInAlt className="me-2" />
                        Iniciar Sesión
                      </Nav.Link>
                    </Link>
                  </Nav.Item>
                  <Nav.Item className="ms-2">
                    <Link href="/register" passHref legacyBehavior>
                      <Nav.Link className="btn btn-outline-primary fw-medium">
                        <FaUserPlus className="me-2" />
                        Registrarse
                      </Nav.Link>
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
        <section className="pt-5 pb-5 bg-primary bg-gradient">
            <div className="container py-5">
            <div className="row align-items-center">
                
                {/* Texto */}
                <div className="col-lg-6 text-center text-lg-start mb-5 mb-lg-0">
                <h1 className="display-4 fw-bold text-white mb-4">
                    Gestiona tus citas médicas de forma fácil y rápida
                </h1>
                <p className="lead text-white-50 mb-4">
                    Agenda, modifica o cancela tus citas con especialistas desde la comodidad de tu hogar.
                </p>
                <div className="d-flex flex-column flex-sm-row justify-content-center justify-content-lg-start gap-3">
                    <a href="#" className="btn btn-light text-primary fw-semibold px-4 py-3 rounded-pill shadow-sm">
                    Agendar Cita
                    </a>
                    <a href="#" className="btn btn-outline-light fw-semibold px-4 py-3 rounded-pill">
                    Más Información
                    </a>
                </div>
                </div>

                {/* Imagen */}
                <div className="col-lg-6 text-center">
                <div className="bg-white p-3 rounded-4 shadow-sm d-inline-block">
                    <img
                    src="calendar.png"
                    alt="Sistema de citas médicas"
                    className="img-fluid"
                    style={{ maxWidth: "360px" }}
                    />
                </div>
                </div>
            </div>
            </div>
        </section>


        {/* Features Section */}
        <section className="py-5 bg-light">
            <div className="container py-5">
            <h2 className="text-center fw-bold text-dark mb-5">¿Por qué usar nuestro sistema de citas?</h2>
            
            <div className="row g-4">
                <div className="col-md-4">
                <div className="card h-100 border-0 shadow-sm">
                    <div className="card-body text-center p-4">
                    <div className="bg-blue-100 rounded-circle d-inline-flex align-items-center justify-content-center mb-4" style={{width: '80px', height: '80px'}}>
                        <i className="fas fa-calendar-check text-primary fs-3"></i>
                    </div>
                    <h4 className="fw-semibold mb-3">Agenda 24/7</h4>
                    <p className="text-muted">Solicita tu cita en cualquier momento del día, sin restricciones de horario.</p>
                    </div>
                </div>
                </div>
                
                <div className="col-md-4">
                <div className="card h-100 border-0 shadow-sm">
                    <div className="card-body text-center p-4">
                    <div className="bg-green-100 rounded-circle d-inline-flex align-items-center justify-content-center mb-4" style={{width: '80px', height: '80px'}}>
                        <i className="fas fa-bell text-success fs-3"></i>
                    </div>
                    <h4 className="fw-semibold mb-3">Recordatorios Automáticos</h4>
                    <p className="text-muted">Recibe notificaciones por email o SMS para no olvidar tu cita médica.</p>
                    </div>
                </div>
                </div>
                
                <div className="col-md-4">
                <div className="card h-100 border-0 shadow-sm">
                    <div className="card-body text-center p-4">
                    <div className="bg-purple-100 rounded-circle d-inline-flex align-items-center justify-content-center mb-4" style={{width: '80px', height: '80px'}}>
                        <i className="fas fa-user-md text-purple fs-3"></i>
                    </div>
                    <h4 className="fw-semibold mb-3">Amplia Red de Especialistas</h4>
                    <p className="text-muted">Accede a nuestra red de profesionales de la salud con diversas especialidades.</p>
                    </div>
                </div>
                </div>
            </div>
            </div>
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
                  <button className="btn btn-primary btn-lg">
                    <FaCalendarCheck className="me-2" />
                    Reservar Cita Seleccionada
                  </button>
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
                        <div className="bg-gray-300 rounded-circle me-3" style={{width: '50px', height: '50px'}}></div>
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
                        <div className="bg-gray-300 rounded-circle me-3" style={{width: '50px', height: '50px'}}></div>
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

        {/* Call to Action */}
        <section className="py-5 bg-primary">
            <div className="container py-5 text-center">
            <h2 className="fw-bold text-white mb-4">¿Listo para agendar tu cita?</h2>
            <p className="lead text-white mb-4 mx-auto" style={{maxWidth: '600px'}}>
                Regístrate en nuestro sistema y comienza a gestionar tus citas médicas de manera fácil y segura.
            </p>
            <a href="#" className="btn btn-light text-primary fw-semibold px-5 py-3">Comenzar ahora</a>
            </div>
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
    </>
  );
}


