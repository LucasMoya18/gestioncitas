import React, { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { Container, Row, Col, Card, Form, Button, Alert, Spinner } from 'react-bootstrap';
import { FaUser, FaEnvelope, FaLock, FaPhone, FaIdCard, FaUserPlus, FaHome } from 'react-icons/fa';
import { useRouter } from 'next/router';
import { registerController } from '../controllers/registerController';
import { formatRut, normalizeRut, validateRut, normalizeRutWithDash } from '../utils/rutFormatter';

export default function RegisterPage() {
  const router = useRouter()
  
  const [formData, setFormData] = useState({
    nombre: "",
    correo: "",
    password: "",
    confirmPassword: "",
    telefono: "",
    rut: "",
    rol: "Paciente"
  })
  
  const [rutDisplay, setRutDisplay] = useState("") // Visual: 11.111.111-1
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'rut') {
      const formatted = formatRut(value);
      setRutDisplay(formatted);
      // Guardar para enviar: 11111111-1
      const normalizedDash = normalizeRutWithDash(value);
      setFormData({
        ...formData,
        rut: normalizedDash
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
    setError("");
  }

  const validateForm = () => {
    if (formData.password !== formData.confirmPassword) {
      setError("Las contraseñas no coinciden")
      return false
    }
    if (formData.password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres")
      return false
    }
    if (!validateRut(formData.rut)) {
      setError("RUT inválido. Verifica el formato y dígito verificador")
      return false
    }
    // Validar largo sobre RUT sin guión
    const clean = normalizeRut(formData.rut);
    if (clean.length < 8 || clean.length > 9) {
      setError("RUT debe tener entre 8 y 9 dígitos (sin dígito verificador)")
      return false
    }
    return true
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
    
    if (!validateForm()) return

    setLoading(true)

    try {
      const { confirmPassword, ...dataToSend } = formData
      await registerController.register(dataToSend)
      setSuccess(true)
      setTimeout(() => router.push("/login"), 1500)
    } catch (err) {
      setError(err.message || "Error al registrar. Intenta nuevamente.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Head>
        <title>Registro - Clínica Salud Integral</title>
        <meta name="description" content="Crea una nueva cuenta" />
      </Head>

      <div className="bg-light min-vh-100 d-flex align-items-center">
        <Container>
          <Row className="justify-content-center">
            <Col md={6} lg={5}>
              <Card className="shadow-sm">
                <Card.Body className="p-5">
                  <div className="text-center mb-4">
                    <Link href="/" className="text-decoration-none d-inline-block mb-3">
                      <FaHome className="me-2" />
                      Volver al inicio
                    </Link>
                    <h2 className="fw-bold text-primary">Crear Cuenta</h2>
                    <p className="text-muted">Regístrate para gestionar tus citas</p>
                  </div>

                  {error && <Alert variant="danger">{error}</Alert>}
                  {success && <Alert variant="success">¡Registro exitoso! Redirigiendo...</Alert>}

                  <Form onSubmit={handleSubmit}>
                    <Form.Group className="mb-3">
                      <Form.Label className="fw-medium">
                        <FaUser className="me-2" />
                        Nombre Completo
                      </Form.Label>
                      <Form.Control
                        type="text"
                        name="nombre"
                        placeholder="Juan Pérez"
                        value={formData.nombre}
                        onChange={handleChange}
                        required
                      />
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label className="fw-medium">
                        <FaIdCard className="me-2" />
                        RUT
                      </Form.Label>
                      <Form.Control
                        type="text"
                        name="rut"
                        placeholder="11.111.111-1"
                        value={rutDisplay}
                        onChange={handleChange}
                        maxLength={12}
                        required
                      />
                      
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label className="fw-medium">
                        <FaEnvelope className="me-2" />
                        Correo Electrónico
                      </Form.Label>
                      <Form.Control
                        type="email"
                        name="correo"
                        placeholder="ejemplo@correo.com"
                        value={formData.correo}
                        onChange={handleChange}
                        required
                      />
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label className="fw-medium">
                        <FaPhone className="me-2" />
                        Teléfono
                      </Form.Label>
                      <Form.Control
                        type="tel"
                        name="telefono"
                        placeholder="912345678"
                        value={formData.telefono}
                        onChange={handleChange}
                        required
                      />
                    </Form.Group>

                    <Row>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label className="fw-medium">
                            <FaLock className="me-2" />
                            Contraseña
                          </Form.Label>
                          <Form.Control
                            type="password"
                            name="password"
                            placeholder="••••••••"
                            value={formData.password}
                            onChange={handleChange}
                            required
                          />
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group className="mb-4">
                          <Form.Label className="fw-medium">
                            <FaLock className="me-2" />
                            Confirmar Contraseña
                          </Form.Label>
                          <Form.Control
                            type="password"
                            name="confirmPassword"
                            placeholder="••••••••"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            required
                          />
                        </Form.Group>
                      </Col>
                    </Row>

                    <Button 
                      variant="primary" 
                      type="submit" 
                      className="w-100 py-2" 
                      disabled={loading || success}
                    >
                      {loading ? (
                        <>
                          <Spinner animation="border" size="sm" className="me-2" />
                          Registrando...
                        </>
                      ) : (
                        <>
                          <FaUserPlus className="me-2" />
                          Crear Cuenta
                        </>
                      )}
                    </Button>
                  </Form>

                  <div className="text-center mt-4">
                    <span className="text-muted">¿Ya tienes una cuenta? </span>
                    <Link href="/login" className="text-decoration-none">
                      Inicia sesión aquí
                    </Link>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      </div>
    </>
  );
}