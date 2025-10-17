import React, { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { Container, Row, Col, Card, Form, Button, Alert } from 'react-bootstrap';
import { FaUserPlus, FaArrowLeft } from 'react-icons/fa';
import { useRouter } from 'next/router';
import { registerPaciente } from '../controllers/registerController';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    nombre: '',
    telefono: '',
    rut: '',
    correo: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // formatea RUT a 11.111.111-3 (cuando tenga al menos 2 caracteres)
  const formatRut = (value) => {
    if (!value) return ''
    // limpiar y permitir K
    let v = value.toString().toUpperCase().replace(/[^0-9Kk]/g, '')
    if (v.length === 1) return v
    const verifier = v.slice(-1)
    let numbers = v.slice(0, -1).replace(/\D/g, '')
    if (!numbers) return `${verifier}`
    // agrupar cada 3 desde la derecha
    const rev = numbers.split('').reverse().join('')
    const grouped = rev.match(/.{1,3}/g)?.join('.').split('').reverse().join('') || numbers
    return `${grouped}-${verifier}`
  }

  const normalizeRut = (formatted) => {
    if (!formatted) return ''
    return formatted.toString().replace(/\./g, '').replace(/-/g, '').toUpperCase()
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    if (name === 'rut') {
      setFormData({
        ...formData,
        rut: formatRut(value)
      })
      return
    }
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // enviar rut normalizado al backend (sin puntos ni guión)
      const payload = { ...formData, rut: normalizeRut(formData.rut) }
      await registerPaciente(payload);
      
      // Redirigir a login después de registro exitoso
      router.push('/login');
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>Registro - Clínica Salud Integral</title>
        <meta name="description" content="Crea una nueva cuenta" />
      </Head>

      <div className="bg-light min-vh-100 d-flex align-items-center">
        <Container>
          <Row className="justify-content-center">
            <Col md={8} lg={6}>
              <Card className="shadow-sm">
                <Card.Body className="p-5">
                    <div className="text-center mb-4">
                        <Link href="/" passHref legacyBehavior>
                            <a className="text-decoration-none d-inline-block mb-3">
                            <FaArrowLeft className="me-2" />
                            Volver al inicio
                            </a>
                        </Link>
                        <h2 className="fw-bold text-primary">Crear Cuenta</h2>
                        <p className="text-muted">Regístrate para gestionar tus citas médicas</p>
                    </div>

                  {error && <Alert variant="danger">{error}</Alert>}

                  <Form onSubmit={handleSubmit}>
                    <Row>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Nombre Completo</Form.Label>
                          <Form.Control
                            type="text"
                            name="nombre"
                            value={formData.nombre}
                            onChange={handleChange}
                            placeholder="Juan Pérez"
                            required
                          />
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Teléfono</Form.Label>
                          <Form.Control
                            type="tel"
                            name="telefono"
                            value={formData.telefono}
                            onChange={handleChange}
                            placeholder="987654321"
                            required
                          />
                        </Form.Group>
                      </Col>
                    </Row>

                    <Form.Group className="mb-3">
                      <Form.Label>RUT</Form.Label>
                      <Form.Control
                        type="text"
                        name="rut"
                        value={formData.rut}
                        onChange={handleChange}
                        placeholder="12.345.678-9"
                        required
                      />
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label>Correo Electrónico</Form.Label>
                      <Form.Control
                        type="email"
                        name="correo"
                        value={formData.correo}
                        onChange={handleChange}
                        placeholder="juan@test.com"
                        required
                      />
                    </Form.Group>

                    <Form.Group className="mb-4">
                      <Form.Label>Contraseña</Form.Label>
                      <Form.Control
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="Crea una contraseña segura"
                        required
                      />
                    </Form.Group>

                    <Button 
                      variant="primary" 
                      type="submit" 
                      className="w-100 py-2" 
                      disabled={loading}
                    >
                      {loading ? 'Cargando...' : (
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