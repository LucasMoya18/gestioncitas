"use client"
import Head from "next/head"
import { Container, Navbar, Nav, Button } from "react-bootstrap"
import { FaStethoscope, FaHome, FaSignInAlt } from "react-icons/fa"
import Link from "next/link"
import AppointmentBooking from "../components/appointments/AppointmentBooking"
import { useAuth } from "../context/AuthContext"

export default function AgendarCitaPage() {
  const { user, logout } = useAuth()

  return (
    <>
      <Head>
        <title>Agendar Cita - Clínica Salud Integral</title>
        <meta name="description" content="Agenda tu cita médica de forma rápida y sencilla" />
      </Head>

      {/* Header */}
      <Navbar bg="white" expand="lg" fixed="top" className="shadow-sm">
        <Container>
          <Navbar.Brand href="/" className="fw-bold text-primary">
            <FaStethoscope className="me-2" />
            Clínica Salud Integral
          </Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="ms-auto">
              <Link href="/" passHref legacyBehavior>
                <Nav.Link className="text-dark fw-medium">
                  <FaHome className="me-2" />
                  Inicio
                </Nav.Link>
              </Link>

              {user ? (
                <>
                  <Link href="/dashboard" passHref legacyBehavior>
                    <Nav.Link className="text-dark fw-medium">Mi Dashboard</Nav.Link>
                  </Link>
                  <Nav.Item className="ms-2">
                    <Button variant="outline-danger" onClick={logout}>
                      Cerrar Sesión
                    </Button>
                  </Nav.Item>
                </>
              ) : (
                <Link href="/login" passHref legacyBehavior>
                  <Nav.Link className="btn btn-primary text-white fw-medium ms-2">
                    <FaSignInAlt className="me-2" />
                    Iniciar Sesión
                  </Nav.Link>
                </Link>
              )}
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      <div style={{ paddingTop: "90px", minHeight: "100vh", backgroundColor: "#f8f9fa" }}>
        <AppointmentBooking />
      </div>
    </>
  )
}
