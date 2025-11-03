// Componente SignUp.tsx - Página de registro de usuarios con autenticación mediante email/password y proveedores sociales (Google, GitHub, Microsoft).
// Permite crear cuentas usando Firebase Authentication y guarda los datos del usuario en el backend Flask.
// Incluye validación de formularios con Formik y Yup, y notificaciones con SweetAlert2.

import React, { useState } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert, Spinner } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { Formik, Field, ErrorMessage, Form as FormikForm } from 'formik';
import * as Yup from 'yup';
import { UserPlus, Mail, User as UserIcon } from 'lucide-react';
import { 
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  GithubAuthProvider,
  OAuthProvider,
  signInWithPopup,
  fetchSignInMethodsForEmail
} from 'firebase/auth';
import { auth } from '../../firebase';
import { User } from '../../models/User';
import { userService } from '../../services/userService';
import Swal from 'sweetalert2';
import { useDispatch } from 'react-redux';
import { setUser } from '../../store/userSlice';

const SignUp: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch(); // Hook de Redux para despachar acciones
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Función para guardar usuario en el backend
  const saveUserToBackend = async (userData: { name: string; email: string }) => {
    try {
      // Intentar crear el usuario
      const createdUser = await userService.createUser(userData);
      return { user: createdUser, isNew: true };
    } catch (error: any) {
      console.error('Error al guardar en backend:', error);
      
      // Si el error es porque el email ya existe (400), buscar el usuario existente
      if (error.response?.status === 400 && error.response?.data?.error?.includes('Email already registered')) {
        console.log('Usuario ya existe, buscando en base de datos...');
        try {
          // Obtener todos los usuarios y buscar por email
          const allUsers = await userService.getUsers();
          const existingUser = allUsers.find((u: any) => u.email === userData.email);
          
          if (existingUser) {
            console.log('Usuario encontrado:', existingUser);
            return { user: existingUser, isNew: false };
          }
        } catch (searchError) {
          console.error('Error al buscar usuario existente:', searchError);
        }
      }
      
      throw error;
    }
  };

  // Registro con email/password
  const handleSignUp = async (values: User & { confirmPassword?: string }) => {
    setLoading(true);
    setError(null);

    try {
      // 1. Crear usuario en Firebase
      if (values.password) {
        await createUserWithEmailAndPassword(auth, values.email!, values.password);
      }

      // 2. Guardar en backend
      const { confirmPassword, password, ...userData } = values;
      const createdUser = await saveUserToBackend(userData as { name: string; email: string });
      
      if (createdUser) {
        Swal.fire({
          title: '¡Registro Exitoso!',
          text: 'Tu cuenta ha sido creada correctamente',
          icon: 'success',
          timer: 2000,
          showConfirmButton: false
        });
        
        setTimeout(() => {
          navigate('/auth/signin');
        }, 2000);
      }
    } catch (error: any) {
      console.error('Error al registrar usuario:', error);
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

  // Autenticación con Google
  const handleGoogleLogin = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      
      // Guardar en backend (o recuperar si ya existe)
      const backendResult = await saveUserToBackend({
        name: user.displayName || 'Usuario de Google',
        email: user.email!
      });
      
      // IMPORTANTE: Guardar el usuario en Redux para que se muestre en el header
      dispatch(setUser(backendResult.user));
      
      if (backendResult.isNew) {
        // Usuario nuevo creado
        Swal.fire({
          title: '¡Registro Exitoso!',
          text: 'Cuenta creada con Google',
          icon: 'success',
          timer: 2000,
          showConfirmButton: false
        });
      } else {
        // Usuario ya existía
        Swal.fire({
          title: '¡Bienvenido de nuevo!',
          text: 'Sesión iniciada correctamente',
          icon: 'success',
          timer: 2000,
          showConfirmButton: false
        });
      }
      
      setTimeout(() => navigate('/'), 2000);
    } catch (error: any) {
      console.error('Error en Google login:', error);
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

  // Autenticación con GitHub
  const handleGithubLogin = async () => {
    setLoading(true);
    setError(null);

    try {
        const provider = new GithubAuthProvider();
        const result = await signInWithPopup(auth, provider);
        const user = result.user;

        // Guardar en backend (o recuperar si ya existe)
        const backendResult = await saveUserToBackend({
            name: user.displayName || user.email?.split('@')[0] || 'Usuario de GitHub',
            email: user.email!
        });

        // IMPORTANTE: Guardar el usuario en Redux para que se muestre en el header
        dispatch(setUser(backendResult.user));

        if (backendResult.isNew) {
            // Usuario nuevo creado
            Swal.fire({
                title: '¡Registro Exitoso!',
                text: 'Cuenta creada con GitHub',
                icon: 'success',
                timer: 2000,
                showConfirmButton: false
            });
        } else {
            // Usuario ya existía
            Swal.fire({
                title: '¡Bienvenido de nuevo!',
                text: 'Sesión iniciada correctamente',
                icon: 'success',
                timer: 2000,
                showConfirmButton: false
            });
        }

        setTimeout(() => navigate('/'), 2000);
    } catch (error: any) {
        console.error('Error en GitHub login:', error);
        let errorMsg = 'Error al iniciar sesión con GitHub';

        if (error.code === 'auth/account-exists-with-different-credential') {
            errorMsg = 'Ya existe una cuenta con este email usando otro método. Por favor, inicia sesión con ese método y vincula tu cuenta.';
            const existingProvider = await fetchSignInMethodsForEmail(auth, error.customData.email);
            console.log('Método existente:', existingProvider);
        }

        setError(errorMsg);
        Swal.fire('Error', errorMsg, 'error');
    } finally {
        setLoading(false);
    }
  };

  // Autenticación con Microsoft
  const handleMicrosoftLogin = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const provider = new OAuthProvider('microsoft.com');
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      
      // Guardar en backend (o recuperar si ya existe)
      const backendResult = await saveUserToBackend({
        name: user.displayName || 'Usuario de Microsoft',
        email: user.email!
      });
      
      // IMPORTANTE: Guardar el usuario en Redux para que se muestre en el header
      dispatch(setUser(backendResult.user));
      
      Swal.fire({
        title: '¡Bienvenido!',
        text: 'Sesión iniciada con Microsoft',
        icon: 'success',
        timer: 2000,
        showConfirmButton: false
      });
      
      setTimeout(() => navigate('/'), 2000);
    } catch (error: any) {
      console.error('Error en Microsoft login:', error);
      let errorMsg = 'Error al iniciar sesión con Microsoft';
      
      // Error específico: Microsoft no está configurado en Firebase/Azure
      if (error.code === 'auth/unauthorized-domain' || error.message?.includes('unauthorized_client')) {
        await Swal.fire({
          icon: 'error',
          title: 'Microsoft no configurado',
          html: `
            <p>La autenticación con Microsoft no está habilitada en este proyecto.</p>
            <p><strong>Para habilitar Microsoft:</strong></p>
            <ol style="text-align: left; margin-top: 10px;">
              <li>Ve a <a href="https://portal.azure.com" target="_blank">Azure Portal</a></li>
              <li>Crea una aplicación en Azure AD</li>
              <li>Copia el Client ID y Client Secret</li>
              <li>Ve a <a href="https://console.firebase.google.com" target="_blank">Firebase Console</a></li>
              <li>En Authentication → Sign-in method, habilita Microsoft</li>
              <li>Ingresa las credenciales de Azure</li>
            </ol>
            <p style="margin-top: 10px;"><strong>Por ahora, usa otro método:</strong> Google, GitHub o Email</p>
          `,
          confirmButtonText: 'Entendido',
          width: 600
        });
        
        setLoading(false);
        return; // Salir sin mostrar error adicional
      }
      
      // Error específico: PKCE requerido para Microsoft (error de configuración de Azure)
      if (error.code === 'auth/invalid-credential' && error.message?.includes('Proof Key for Code Exchange')) {
        await Swal.fire({
          icon: 'error',
          title: 'Error de configuración de Microsoft',
          html: `
            <p><strong>Microsoft está parcialmente configurado pero falta PKCE.</strong></p>
            <p>Este es un requisito de seguridad de Microsoft Azure.</p>
            <p><strong>Solución:</strong></p>
            <ol style="text-align: left; margin-top: 10px;">
              <li>Ve a <a href="https://portal.azure.com" target="_blank">Azure Portal</a></li>
              <li>Abre tu aplicación en "App registrations"</li>
              <li>Ve a <strong>Authentication</strong> en el menú lateral</li>
              <li>En <strong>Platform configurations → Web</strong>:</li>
              <ul style="margin-left: 20px;">
                <li>✅ Marca "Access tokens"</li>
                <li>✅ Marca "ID tokens"</li>
              </ul>
              <li>En <strong>Advanced settings</strong>:</li>
              <ul style="margin-left: 20px;">
                <li>✅ Habilita "Allow public client flows"</li>
              </ul>
              <li>Haz clic en <strong>Save</strong></li>
            </ol>
            <p style="margin-top: 10px;"><strong>Por ahora, usa:</strong> Google, GitHub o Email/Password</p>
          `,
          confirmButtonText: 'Entendido',
          width: 650
        });
        
        setLoading(false);
        return; // Salir sin mostrar error adicional
      }
      
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

              {/* Botones de autenticación social */}
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
                    {/* Nombre */}
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

                    {/* Email */}
                    <Form.Group className="mb-3">
                      <Form.Label className="fw-semibold">
                        <Mail size={16} className="me-2" />
                        Correo Electrónico
                      </Form.Label>
                      <Field
                        name="email"
                        type="email"
                        className={`form-control ${errors.email && touched.email ? 'is-invalid' : ''}`}
                        placeholder="Ingresa tu correo electrónico"
                        disabled={loading}
                      />
                      <ErrorMessage name="email" component="div" className="invalid-feedback" />
                    </Form.Group>

                    {/* Contraseña */}
                    <Form.Group className="mb-4">
                      <Form.Label className="fw-semibold">
                        Contraseña
                      </Form.Label>
                      <Field
                        name="password"
                        type="password"
                        className={`form-control ${errors.password && touched.password ? 'is-invalid' : ''}`}
                        placeholder="Crea una contraseña"
                        disabled={loading}
                      />
                      <ErrorMessage name="password" component="div" className="invalid-feedback" />
                    </Form.Group>

                    {/* Confirmar Contraseña */}
                    <Form.Group className="mb-4">
                      <Form.Label className="fw-semibold">
                        Confirmar Contraseña
                      </Form.Label>
                      <Field
                        name="confirmPassword"
                        type="password"
                        className={`form-control ${errors.confirmPassword && touched.confirmPassword ? 'is-invalid' : ''}`}
                        placeholder="Confirma tu contraseña"
                        disabled={loading}
                      />
                      <ErrorMessage name="confirmPassword" component="div" className="invalid-feedback" />
                    </Form.Group>

                    {/* Botón de Registro */}
                    <div className="d-grid gap-2 mb-4">
                      <Button 
                        type="submit" 
                        variant="success" 
                        size="lg"
                        disabled={loading}
                        className="fw-semibold"
                      >
                        {loading ? (
                          <>
                            <Spinner animation="border" size="sm" className="me-2" />
                            Registrando...
                          </>
                        ) : (
                          'Crear Cuenta'
                        )}
                      </Button>
                    </div>

                    <div className="text-center">
                      <span className="text-muted">
                        ¿Ya tienes una cuenta?{' '}
                        <Link to="/auth/signin" className="text-decoration-none fw-semibold" style={{ color: '#10b981' }}>
                          Inicia sesión
                        </Link>
                      </span>
                    </div>
                  </FormikForm>
                )}
              </Formik>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default SignUp;
