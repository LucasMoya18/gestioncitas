import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { Container, Row, Col, Card, Form, Button, Alert, Spinner } from 'react-bootstrap';
import { FaSignInAlt, FaArrowLeft, FaIdCard, FaLock } from 'react-icons/fa';
import { useRouter } from 'next/router';
import { useAuth } from '../context/AuthContext';
import { loginController } from '../controllers/loginController';
import { formatRut, normalizeRutWithDash } from '../utils/rutFormatter';

export default function LoginPage() {
  const [formData, setFormData] = useState({
    rut: '',
    password: ''
  });
  const [rutDisplay, setRutDisplay] = useState(''); // visual 11.111.111-1
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
    setError('');
    const { name, value } = e.target;

    if (name === 'rut') {
      setRutDisplay(formatRut(value)); // visual 11.111.111-1
      setFormData(prev => ({ ...prev, rut: normalizeRutWithDash(value) })); // guardar 11111111-1
      return;
    }

    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.rut || !formData.password) {
      setError("Todos los campos son requeridos")
      return
    }

    setLoading(true)
    setError("")

    try {
      const response = await loginController.login(formData.rut, formData.password)
      
      //  Verificar si la respuesta es exitosa
      if (!response.ok) {
        throw new Error(response.message || 'Error al iniciar sesión')
      }
      
      const { user, access, token, message } = response;
      
      //  El token puede venir como 'access' o 'token'
      const authToken = access || token;
      
      if (!authToken) {
        throw new Error('No se recibió token de autenticación del servidor')
      }

      // Login con token
      login(user, authToken)
      
      // Mostrar mensaje de bienvenida si existe
      if (message) {
        console.log("", message);
      }
      
      setTimeout(() => {
        const rol = user.rol;
        console.log("🔄 Redirigiendo según rol:", rol);
        
        if (rol === 'Medico') {
          router.push('/dashboard?tab=medico');
        } else if (rol === 'Administrador' || rol === 'Admin') {
          router.push('/dashboard?tab=admin');
        } else if (rol === 'Paciente') {
          router.push('/dashboard');
        } else {
          router.push('/dashboard');
        }
      }, 100);
    } catch (err) {
      console.error(' Error en login:', err);
      setError(err.message || "Error al iniciar sesión")
    } finally {
      setLoading(false)
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
                      <Form.Label className="fw-medium">
                        <FaIdCard className="me-2" />
                        RUT
                      </Form.Label>
                      <Form.Control
                        type="text"
                        name="rut"
                        value={rutDisplay}
                        onChange={handleChange}
                        placeholder="11.111.111-1"
                        maxLength={12}
                        required
                      />
                      <Form.Text className="text-muted">
                        Formato automático. Acepta dígito K.
                      </Form.Text>
                    </Form.Group>

                    <Form.Group className="mb-4">
                      <Form.Label className="fw-medium">
                        <FaLock className="me-2" />
                        Contraseña
                      </Form.Label>
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

                  
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      </div>
    </>
  );
}