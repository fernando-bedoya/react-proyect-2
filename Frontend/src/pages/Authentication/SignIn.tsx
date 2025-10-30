import React, { useState } from "react";
import { Container, Row, Col, Card, Form, Button, Alert, Spinner, InputGroup } from "react-bootstrap";
import { Formik, Form as FormikForm } from "formik";
import * as Yup from "yup";
import { LogIn, Mail, Lock, Eye, EyeOff } from "lucide-react";
import { User } from "../../models/User";
import SecurityService from '../../services/securityService';
import { useNavigate } from "react-router-dom";

const SignIn: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async (user: User) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await SecurityService.login(user);
      console.log('Usuario autenticado:', response);
      
      await new Promise(resolve => setTimeout(resolve, 500));
      
      navigate("/");
    } catch (error: any) {
      console.error('Error al iniciar sesión', error);
      setError(error.response?.data?.message || 'Credenciales inválidas. Por favor, intente nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container fluid className="min-vh-100 d-flex align-items-center justify-content-center" 
      style={{ 
        background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
        padding: '2rem 0'
      }}
    >
      <Row className="w-100 justify-content-center">
        <Col xs={12} sm={10} md={8} lg={6} xl={5}>
          <Card className="shadow-lg border-0" style={{ borderRadius: '1rem' }}>
            <Card.Body className="p-4 p-md-5">
              <div className="text-center mb-4">
                <div 
                  className="mx-auto mb-3 d-flex align-items-center justify-content-center"
                  style={{
                    width: '80px',
                    height: '80px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                    boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)'
                  }}
                >
                  <LogIn size={40} color="white" />
                </div>
                <h2 className="fw-bold mb-2" style={{ color: '#1f2937' }}>
                  Bienvenido de nuevo
                </h2>
                <p className="text-muted mb-0">
                  Ingrese sus credenciales para continuar
                </p>
              </div>

              {error && (
                <Alert 
                  variant="danger" 
                  dismissible 
                  onClose={() => setError(null)}
                  className="mb-4"
                >
                  <div className="d-flex align-items-center">
                    <strong className="me-2">⚠</strong>
                    {error}
                  </div>
                </Alert>
              )}

              <Formik
                initialValues={{
                  email: "",
                  password: ""
                }}
                validationSchema={Yup.object({
                  email: Yup.string().email("Email inválido").required("El email es obligatorio"),
                  password: Yup.string().min(6, "La contraseña debe tener al menos 6 caracteres").required("La contraseña es obligatoria"),
                })}
                onSubmit={(values) => {
                  handleLogin(values);
                }}
              >
                {({ errors, touched, handleChange, handleBlur, values }) => (
                  <FormikForm>
                    <Form.Group className="mb-3">
                      <Form.Label className="fw-semibold">
                        <Mail size={16} className="me-2" />
                        Correo Electrónico
                      </Form.Label>
                      <InputGroup>
                        <InputGroup.Text style={{ backgroundColor: '#f8f9fa' }}>
                          <Mail size={18} color="#6b7280" />
                        </InputGroup.Text>
                        <Form.Control
                          type="email"
                          name="email"
                          placeholder="usuario@ejemplo.com"
                          value={values.email}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          isInvalid={touched.email && !!errors.email}
                          disabled={loading}
                        />
                        <Form.Control.Feedback type="invalid">
                          {errors.email}
                        </Form.Control.Feedback>
                      </InputGroup>
                    </Form.Group>

                    <Form.Group className="mb-4">
                      <Form.Label className="fw-semibold">
                        <Lock size={16} className="me-2" />
                        Contraseña
                      </Form.Label>
                      <InputGroup>
                        <InputGroup.Text style={{ backgroundColor: '#f8f9fa' }}>
                          <Lock size={18} color="#6b7280" />
                        </InputGroup.Text>
                        <Form.Control
                          type={showPassword ? "text" : "password"}
                          name="password"
                          placeholder="••••••••"
                          value={values.password}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          isInvalid={touched.password && !!errors.password}
                          disabled={loading}
                        />
                        <Button 
                          variant="outline-secondary"
                          onClick={() => setShowPassword(!showPassword)}
                          disabled={loading}
                        >
                          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </Button>
                        <Form.Control.Feedback type="invalid">
                          {errors.password}
                        </Form.Control.Feedback>
                      </InputGroup>
                    </Form.Group>

                    <div className="d-flex justify-content-between align-items-center mb-4">
                      <Form.Check type="checkbox" id="remember-me" label="Recordarme" />
                      <a href="#" style={{ color: '#10b981' }}>¿Olvidó su contraseña?</a>
                    </div>

                    <Button
                      type="submit"
                      className="w-100 py-3 fw-semibold d-flex align-items-center justify-content-center gap-2"
                      style={{ backgroundColor: '#10b981', borderColor: '#10b981' }}
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <Spinner as="span" animation="border" size="sm" />
                          <span>Iniciando sesión...</span>
                        </>
                      ) : (
                        <>
                          <LogIn size={20} />
                          <span>Iniciar Sesión</span>
                        </>
                      )}
                    </Button>
                  </FormikForm>
                )}
              </Formik>
            </Card.Body>

            <Card.Footer className="text-center py-3" style={{ backgroundColor: '#f8f9fa' }}>
              <small className="text-muted">© 2024 Tu Aplicación. Todos los derechos reservados.</small>
            </Card.Footer>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default SignIn;
