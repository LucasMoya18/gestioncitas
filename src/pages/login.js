import React, { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { Container, Row, Col, Card, Form, Button, Alert } from 'react-bootstrap';
import { FaSignInAlt, FaArrowLeft } from 'react-icons/fa';
import axios from 'axios';
import { useRouter } from 'next/router';

export default function LoginPage() {
  const [formData, setFormData] = useState({
    rut: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await axios.post('https://proyecto-production-c22e.up.railway.app/api/login/', formData);
      // Guardar token o información de usuario (ajustar según respuesta de tu API)
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      router.push('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>Iniciar Sesión - Clínica Salud Integral</title>
        <meta name="description" content="Inicia sesión en tu cuenta" />
      </Head>

      <div className="bg-light min-vh-100 d-flex align-items-center">
        <Container>
          <Row className="justify-content-center">
            <Col md={6} lg={5}>
              <Card className="shadow-sm">
                <Card.Body className="p-5">
                    <div className="text-center mb-4">
                        <Link href="/" passHref legacyBehavior>
                            <a className="text-decoration-none d-inline-block mb-3">
                            <FaArrowLeft className="me-2" />
                            Volver al inicio
                            </a>
                        </Link>
                        <h2 className="fw-bold text-primary">Iniciar Sesión</h2>
                        <p className="text-muted">Accede a tu cuenta para gestionar tus citas</p>
                    </div>

                  {error && <Alert variant="danger">{error}</Alert>}

                  <Form onSubmit={handleSubmit}>
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

                    <Form.Group className="mb-4">
                      <Form.Label>Contraseña</Form.Label>
                      <Form.Control
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="Ingresa tu contraseña"
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
                          <FaSignInAlt className="me-2" />
                          Iniciar Sesión
                        </>
                      )}
                    </Button>
                  </Form>

                  <div className="text-center mt-4">
                    <span className="text-muted">¿No tienes una cuenta? </span>
                    <Link href="/register" className="text-decoration-none">
                      Regístrate aquí
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