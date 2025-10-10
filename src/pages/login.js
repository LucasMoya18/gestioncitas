import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { Container, Row, Col, Card, Form, Button, Alert, Spinner } from 'react-bootstrap';
import { FaSignInAlt, FaArrowLeft } from 'react-icons/fa';
import { useRouter } from 'next/router';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { loginPaciente } from '../controllers/loginController';

export default function LoginPage() {
  const [formData, setFormData] = useState({
    rut: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { user, login, loading: authLoading } = useAuth();

  // Redirigir si ya está autenticado
  useEffect(() => {
    if (user && !authLoading) {
      router.push('/dashboard');
    }
  }, [user, authLoading, router]);

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
      const { user: userData, token } = await loginPaciente(formData.rut, formData.password);
      login(userData, token);
      router.push('/dashboard');
    } catch (err) {
      setError(err);
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="bg-light min-vh-100 d-flex align-items-center justify-content-center">
        <Spinner animation="border" variant="primary" />
      </div>
    );
  }

  if (user) {
    return (
      <div className="bg-light min-vh-100 d-flex align-items-center justify-content-center">
        <Spinner animation="border" variant="primary" />
        <span className="ms-2">Redirigiendo...</span>
      </div>
    );
  }

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
                    <Link href="/" className="text-decoration-none d-inline-block mb-3">
                      <FaArrowLeft className="me-2" />
                      Volver al inicio
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
                      {loading ? (
                        <>
                          <Spinner animation="border" size="sm" className="me-2" />
                          Iniciando sesión...
                        </>
                      ) : (
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

                  <div className="mt-4 p-3 bg-light rounded">
                    <small className="text-muted">
                      <strong>Datos de prueba:</strong><br/>
                      RUT: 12.345.678-9<br/>
                      Password: cualquier valor
                    </small>
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