// SOLUCIÓN FINAL: No enviar password al backend
// Firebase maneja toda la autenticación
import React, { useState } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert, Spinner } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { Formik, Field, ErrorMessage, Form as FormikForm } from 'formik';
import * as Yup from 'yup';
import { UserPlus, Mail, User as UserIcon, Lock, Eye, EyeOff } from 'lucide-react';
import { 
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  GithubAuthProvider,
  OAuthProvider,
  signInWithPopup
} from 'firebase/auth';
import { auth } from '../../firebase';
import { User } from '../../models/User';
import { userService } from '../../services/userService';
import Swal from 'sweetalert2';

const SignUp: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // ✅ SOLUCIÓN: Solo enviar name y email al backend
  // Firebase ya guarda la contraseña de forma segura
  const saveUserToBackend = async (userData: { 
    name: string; 
    email: string;
  }) => {
    try {
      console.log('📤 Guardando usuario en backend (sin password)');
      console.log('   - Name:', userData.name);
      console.log('   - Email:', userData.email);
      
      const payload = {
        name: userData.name,
        email: userData.email,
        // ❌ NO enviar password - el backend no lo acepta
      };

      const createdUser = await userService.createUser(payload as any);
      
      console.log('✅ Usuario creado en backend:', createdUser);
      
      return createdUser;
    } catch (error: any) {
      console.error('❌ Error al guardar en backend:', error);
      throw error;
    }
  };

  const handleSignUp = async (values: User & { confirmPassword?: string }) => {
    setLoading(true);
    setError(null);

    try {
      console.log('🚀 Iniciando registro con Firebase + Backend');
      
      if (!values.password) {
        throw new Error('La contraseña es requerida');
      }

      // 1. Crear usuario en Firebase (guarda la contraseña de forma segura)
      console.log('🔥 Creando autenticación en Firebase...');
      const userCredential = await createUserWithEmailAndPassword(auth, values.email!, values.password);
      console.log('✅ Usuario autenticado en Firebase');

      // Obtener ID token de Firebase y guardarlo para que el backend lo valide
      try {
        const idToken = await userCredential.user.getIdToken();
        localStorage.setItem('session', idToken);
        console.log('🔑 Firebase ID token almacenado en localStorage');
      } catch (tokenErr) {
        console.warn('No se pudo obtener el ID token de Firebase:', tokenErr);
      }

      // 2. Guardar datos básicos en backend (sin password)
      console.log('💾 Guardando datos en backend...');
      const createdUser = await saveUserToBackend({
        name: values.name!,
        email: values.email!,
      });
      
      if (createdUser) {
        console.log('🎉 Registro completado exitosamente');
        console.log('   - Firebase: ✅ Autenticación creada');
        console.log('   - Backend: ✅ Usuario ID', (createdUser as any).id);
        
        Swal.fire({
          title: '¡Registro Exitoso!',
          html: `
            <p>Tu cuenta ha sido creada correctamente</p>
            <small class="text-muted">
              • Autenticación: Firebase<br>
              • Datos de usuario: Base de datos
            </small>
          `,
          icon: 'success',
          timer: 3000,
          showConfirmButton: false
        });
        
        setTimeout(() => {
          navigate('/auth/signin');
        }, 2000);
      }
    } catch (error: any) {
      console.error('❌ Error en registro:', error);
      let errorMsg = 'Error al crear la cuenta';
      
      if (error.code === 'auth/email-already-in-use') {
        errorMsg = 'Este email ya está registrado';
      } else if (error.code === 'auth/weak-password') {
        errorMsg = 'La contraseña debe tener al menos 6 caracteres';
      } else if (error.code === 'auth/invalid-email') {
        errorMsg = 'Email inválido';
      }
      
      setError(errorMsg);
      Swal.fire({
        title: 'Error',
        text: errorMsg,
        icon: 'error',
        confirmButtonColor: '#10b981'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('🔐 Iniciando registro con Google');
      
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      // Store Firebase ID token so backend can validate this user when creating record
      try {
        const idToken = await user.getIdToken();
        localStorage.setItem('session', idToken);
        console.log('🔑 Firebase ID token almacenado en localStorage (Google)');
      } catch (tokenErr) {
        console.warn('No se pudo obtener el ID token tras Google SignIn:', tokenErr);
      }
      
      console.log('✅ Usuario autenticado con Google');
      
      await saveUserToBackend({
        name: user.displayName || 'Usuario de Google',
        email: user.email!,
      });
      
      Swal.fire({
        title: '¡Registro Exitoso!',
        text: 'Cuenta creada con Google',
        icon: 'success',
        timer: 2000,
        showConfirmButton: false
      });
      
      setTimeout(() => navigate('/auth/signin'), 2000);
    } catch (error: any) {
      console.error('❌ Error en Google login:', error);
      let errorMsg = 'Error al iniciar sesión con Google';
      
      if (error.code === 'auth/popup-blocked') {
        errorMsg = 'El popup fue bloqueado. Permite popups para este sitio';
      } else if (error.code === 'auth/popup-closed-by-user') {
        errorMsg = 'Login cancelado';
      }
      
      setError(errorMsg);
      Swal.fire('Error', errorMsg, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleGithubLogin = async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('🔐 Iniciando registro con GitHub');
      
      const provider = new GithubAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      try {
        const idToken = await user.getIdToken();
        localStorage.setItem('session', idToken);
        console.log('🔑 Firebase ID token almacenado en localStorage (GitHub)');
      } catch (tokenErr) {
        console.warn('No se pudo obtener el ID token tras GitHub SignIn:', tokenErr);
      }
      
      console.log('✅ Usuario autenticado con GitHub');
      
      await saveUserToBackend({
        name: user.displayName || 'Usuario de GitHub',
        email: user.email!,
      });
      
      Swal.fire({
        title: '¡Registro Exitoso!',
        text: 'Cuenta creada con GitHub',
        icon: 'success',
        timer: 2000,
        showConfirmButton: false
      });
      
      setTimeout(() => navigate('/auth/signin'), 2000);
    } catch (error: any) {
      console.error('❌ Error en GitHub login:', error);
      let errorMsg = 'Error al iniciar sesión con GitHub';
      
      if (error.code === 'auth/popup-blocked') {
        errorMsg = 'El popup fue bloqueado. Permite popups para este sitio';
      } else if (error.code === 'auth/account-exists-with-different-credential') {
        errorMsg = 'Ya existe una cuenta con este email usando otro método';
      }
      
      setError(errorMsg);
      Swal.fire('Error', errorMsg, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleMicrosoftLogin = async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('🔐 Iniciando registro con Microsoft');
      
      const provider = new OAuthProvider('microsoft.com');
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      try {
        const idToken = await user.getIdToken();
        localStorage.setItem('session', idToken);
        console.log('🔑 Firebase ID token almacenado en localStorage (Microsoft)');
      } catch (tokenErr) {
        console.warn('No se pudo obtener el ID token tras Microsoft SignIn:', tokenErr);
      }
      
      console.log('✅ Usuario autenticado con Microsoft');
      
      await saveUserToBackend({
        name: user.displayName || 'Usuario de Microsoft',
        email: user.email!,
      });
      
      Swal.fire({
        title: '¡Registro Exitoso!',
        text: 'Cuenta creada con Microsoft',
        icon: 'success',
        timer: 2000,
        showConfirmButton: false
      });
      
      setTimeout(() => navigate('/auth/signin'), 2000);
    } catch (error: any) {
      console.error('❌ Error en Microsoft login:', error);
      let errorMsg = 'Error al iniciar sesión con Microsoft';
      
      if (error.code === 'auth/popup-blocked') {
        errorMsg = 'El popup fue bloqueado. Permite popups para este sitio';
      }
      
      setError(errorMsg);
      Swal.fire('Error', errorMsg, 'error');
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
                    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
                  }}
                >
                  <UserPlus size={40} color="white" />
                </div>
                <h2 className="fw-bold mb-2">Crear Cuenta</h2>
                <p className="text-muted">Regístrate para comenzar</p>
              </div>

              {error && (
                <Alert variant="danger" dismissible onClose={() => setError(null)} className="mb-4">
                  {error}
                </Alert>
              )}

              <div className="d-grid gap-2 mb-4">
                <Button 
                  onClick={handleGoogleLogin} 
                  variant="outline-danger" 
                  disabled={loading}
                  className="d-flex align-items-center justify-content-center"
                >
                  <svg className="me-2" width="18" height="18" viewBox="0 0 18 18">
                    <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z"/>
                    <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z"/>
                    <path fill="#FBBC05" d="M3.964 10.707c-.18-.54-.282-1.117-.282-1.707 0-.593.102-1.167.282-1.707V4.961H.957C.347 6.175 0 7.55 0 9s.348 2.825.957 4.039l3.007-2.332z"/>
                    <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.961L3.964 7.293C4.672 5.163 6.656 3.58 9 3.58z"/>
                  </svg>
                  Continuar con Google
                </Button>

                <Button 
                  onClick={handleGithubLogin} 
                  variant="dark" 
                  disabled={loading}
                  className="d-flex align-items-center justify-content-center"
                >
                  <svg className="me-2" width="18" height="18" viewBox="0 0 24 24" fill="white">
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                  </svg>
                  Continuar con GitHub
                </Button>

                <Button 
                  onClick={handleMicrosoftLogin} 
                  variant="outline-primary" 
                  disabled={loading}
                  className="d-flex align-items-center justify-content-center"
                >
                  <svg className="me-2" width="18" height="18" viewBox="0 0 23 23">
                    <path fill="#f3f3f3" d="M0 0h23v23H0z"/>
                    <path fill="#f35325" d="M1 1h10v10H1z"/>
                    <path fill="#81bc06" d="M12 1h10v10H12z"/>
                    <path fill="#05a6f0" d="M1 12h10v10H1z"/>
                    <path fill="#ffba08" d="M12 12h10v10H12z"/>
                  </svg>
                  Continuar con Microsoft
                </Button>
              </div>

              <div className="text-center mb-3">
                <span className="text-muted">O regístrate con email</span>
              </div>

              <Formik
                initialValues={{
                  name: '',
                  email: '',
                  password: '',
                  confirmPassword: '',
                }}
                validationSchema={Yup.object({
                  name: Yup.string()
                    .required('El nombre es obligatorio')
                    .min(3, 'El nombre debe tener al menos 3 caracteres'),
                  email: Yup.string()
                    .email('Email inválido')
                    .required('El email es obligatorio'),
                  password: Yup.string()
                    .required('La contraseña es obligatoria')
                    .min(6, 'La contraseña debe tener al menos 6 caracteres'),
                  confirmPassword: Yup.string()
                    .required('Confirma tu contraseña')
                    .oneOf([Yup.ref('password')], 'Las contraseñas no coinciden'),
                })}
                onSubmit={(values) => {
                  handleSignUp(values);
                }}
              >
                {({ errors, touched }) => (
                  <FormikForm>
                    <Form.Group className="mb-3">
                      <Form.Label className="fw-semibold">
                        <UserIcon size={16} className="me-2" />
                        Nombre Completo
                      </Form.Label>
                      <Field
                        name="name"
                        type="text"
                        className={`form-control ${errors.name && touched.name ? 'is-invalid' : ''}`}
                        placeholder="Ingresa tu nombre completo"
                        disabled={loading}
                      />
                      <ErrorMessage name="name" component="div" className="invalid-feedback" />
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label className="fw-semibold">
                        <Mail size={16} className="me-2" />
                        Correo Electrónico
                      </Form.Label>
                      <Field
                        name="email"
                        type="email"
                        className={`form-control ${errors.email && touched.email ? 'is-invalid' : ''}`}
                        placeholder="tucorreo@ejemplo.com"
                        disabled={loading}
                      />
                      <ErrorMessage name="email" component="div" className="invalid-feedback" />
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label className="fw-semibold">
                        <Lock size={16} className="me-2" />
                        Contraseña
                      </Form.Label>
                      <div className="position-relative">
                        <Field
                          name="password"
                          type={showPassword ? 'text' : 'password'}
                          className={`form-control ${errors.password && touched.password ? 'is-invalid' : ''}`}
                          placeholder="Ingresa tu contraseña"
                          disabled={loading}
                        />
                        <button
                          type="button"
                          className="btn btn-link position-absolute end-0 top-50 translate-middle-y"
                          onClick={() => setShowPassword(!showPassword)}
                          style={{ textDecoration: 'none', color: '#6c757d' }}
                        >
                          {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                        </button>
                        <ErrorMessage name="password" component="div" className="invalid-feedback" />
                      </div>
                    </Form.Group>

                    <Form.Group className="mb-4">
                      <Form.Label className="fw-semibold">
                        <Lock size={16} className="me-2" />
                        Confirmar Contraseña
                      </Form.Label>
                      <div className="position-relative">
                        <Field
                          name="confirmPassword"
                          type={showConfirmPassword ? 'text' : 'password'}
                          className={`form-control ${errors.confirmPassword && touched.confirmPassword ? 'is-invalid' : ''}`}
                          placeholder="Confirma tu contraseña"
                          disabled={loading}
                        />
                        <button
                          type="button"
                          className="btn btn-link position-absolute end-0 top-50 translate-middle-y"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          style={{ textDecoration: 'none', color: '#6c757d' }}
                        >
                          {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                        </button>
                        <ErrorMessage name="confirmPassword" component="div" className="invalid-feedback" />
                      </div>
                    </Form.Group>

                    <Button
                      type="submit"
                      variant="success"
                      className="w-100 py-3 fw-semibold"
                      disabled={loading}
                      style={{
                        background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                        border: 'none'
                      }}
                    >
                      {loading ? (
                        <>
                          <Spinner
                            as="span"
                            animation="border"
                            size="sm"
                            role="status"
                            aria-hidden="true"
                            className="me-2"
                          />
                          Creando cuenta...
                        </>
                      ) : (
                        <>
                          <UserPlus size={20} className="me-2" />
                          Crear Cuenta
                        </>
                      )}
                    </Button>
                  </FormikForm>
                )}
              </Formik>

              <div className="text-center mt-4">
                <p className="text-muted mb-0">
                  ¿Ya tienes una cuenta?{' '}
                  <Link to="/auth/signin" className="text-success fw-semibold text-decoration-none">
                    Iniciar Sesión
                  </Link>
                </p>
              </div>
            </Card.Body>
          </Card>

          <div className="text-center mt-3">
            <p className="text-white small">
              Al registrarte, aceptas nuestros términos y condiciones
            </p>
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default SignUp;