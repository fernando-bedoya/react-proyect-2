import React, { useState } from "react";
import { Card, Form, Button, Alert, Spinner, InputGroup } from "react-bootstrap";
import { Formik, Form as FormikForm } from "formik";
import * as Yup from "yup";
import { LogIn, Mail, Lock, Eye, EyeOff } from "lucide-react";
import { User } from "../../models/User";
import SecurityService from '../../services/securityService';
import { useNavigate } from "react-router-dom";
import AuthLayout from "../../components/AuthLayout";
import { 
  GoogleAuthProvider,
  GithubAuthProvider,
  OAuthProvider,
  signInWithPopup,
  fetchSignInMethodsForEmail
} from 'firebase/auth';
import { auth } from '../../firebase';
import { userService } from '../../services/userService';
import Swal from 'sweetalert2';
import { useDispatch } from 'react-redux';
import { setUser } from '../../store/userSlice';

const SignIn: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async (user: User) => {
    setLoading(true);
    setError(null);
    
    try {
      // 🔐 Iniciar sesión con SecurityService (maneja tokens JWT automáticamente)
      const response = await SecurityService.login(user);
      console.log('✅ Usuario autenticado:', response);
      
      // 🔄 Sincronizar estado con Redux Store (para que esté disponible globalmente)
      // Esto es crucial para el sistema de guardianes e interceptores
      dispatch(setUser(response.user || response));
      
      // 💾 Guardar en localStorage (persistencia entre recargas)
      localStorage.setItem('user', JSON.stringify(response.user || response));
      
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // ✅ Redirección a la página de usuarios después del login exitoso
      navigate("/users/list");
    } catch (error: any) {
      console.error('Error al iniciar sesión', error);
      
      // 🔐 Manejo especial para error de credenciales inválidas
      // Este error puede ocurrir por dos razones:
      // 1. Contraseña incorrecta (usuario registrado con email/password)
      // 2. Usuario registrado con proveedor social pero intenta usar email/password
      if (error.code === 'auth/invalid-credential') {
        try {
          // 🔍 Verificar con Firebase qué métodos de autenticación tiene este email
          const signInMethods = await fetchSignInMethodsForEmail(auth, user.email || '');
          
          console.log('🔍 Métodos de autenticación para', user.email, ':', signInMethods);
          
          // Si el array de métodos está vacío, el usuario no existe en Firebase
          if (signInMethods.length === 0) {
            setError('No existe una cuenta con este correo electrónico. Por favor, regístrate primero.');
            return;
          }
          
          // Si el usuario tiene 'password' en sus métodos, significa que se registró con email/password
          // entonces simplemente escribió mal la contraseña
          if (signInMethods.includes('password')) {
            setError('Contraseña incorrecta. Por favor, verifica tu contraseña e intenta nuevamente.');
            return;
          }
          
          // Si llegamos aquí, el usuario se registró con un proveedor social (Google, GitHub, Microsoft)
          // pero está intentando iniciar sesión con email/password
          const providerNames = signInMethods.map(method => {
            if (method.includes('google')) return 'Google';
            if (method.includes('github')) return 'GitHub';
            if (method.includes('microsoft')) return 'Microsoft';
            return method;
          }).join(', ');
          
          await Swal.fire({
            icon: 'warning',
            title: '⚠️ Método de inicio de sesión incorrecto',
            html: `
              <p style="text-align: left;">La cuenta <strong>${user.email}</strong> fue creada usando: <strong>${providerNames}</strong></p>
              <p style="text-align: left; margin-top: 15px;">Por favor, utiliza el botón correspondiente a continuación en lugar del formulario de email/contraseña.</p>
            `,
            confirmButtonText: 'Entendido',
            confirmButtonColor: '#3b82f6',
          });
          setError(`Por favor, usa el botón de ${providerNames} para iniciar sesión.`);
          
        } catch (fetchError: any) {
          console.error('Error al verificar métodos de autenticación:', fetchError);
          // Si hay error al consultar Firebase, mostrar mensaje genérico
          setError('Credenciales inválidas. Por favor, verifica tu email y contraseña.');
        }
      } else {
        // Otros tipos de errores de autenticación
        setError(error.response?.data?.message || 'Credenciales inválidas. Por favor, intente nuevamente.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Función auxiliar para buscar usuario existente en backend después de login social
  const findUserInBackend = async (email: string) => {
    try {
      console.log('Buscando usuario en base de datos con email:', email);
      const users = await userService.getUsers();
      const existingUser = users.find((u: any) => u.email === email);
      
      if (existingUser) {
        console.log('Usuario encontrado en base de datos:', existingUser);
        return existingUser;
      } else {
        console.log('Usuario no encontrado en base de datos');
        throw new Error('Usuario no registrado. Por favor, regístrese primero en la página de Sign Up.');
      }
    } catch (error: any) {
      console.error('Error al buscar usuario:', error);
      throw error;
    }
  };

  // Manejo de login con Google
  const handleGoogleLogin = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      console.log('Usuario autenticado con Google:', user);

      // Buscar usuario existente en backend (NO crear uno nuevo)
      const existingUser = await findUserInBackend(user.email || '');

      // Actualizar Redux
      dispatch(setUser(existingUser));

      // Guardar en localStorage para el sistema JWT
      localStorage.setItem('user', JSON.stringify(existingUser));

      // Mostrar notificación de bienvenida
      await Swal.fire({
        icon: 'success',
        title: '¡Bienvenido de nuevo!',
        text: `Has iniciado sesión correctamente. ¡Bienvenido, ${existingUser?.name || 'Usuario'}!`,
        timer: 2000,
        showConfirmButton: false
      });

      // ✅ Redirección a la página de usuarios después del login exitoso con Google
      navigate('/users/list');
    } catch (error: any) {
      console.error('Error al iniciar sesión con Google:', error);
      
      let errorMessage = 'Error al iniciar sesión con Google. Por favor, intente nuevamente.';
      
      if (error.message && error.message.includes('Usuario no registrado')) {
        errorMessage = 'No existe una cuenta con este correo de Google. Por favor, regístrese primero.';
      } else if (error.code === 'auth/popup-blocked') {
        errorMessage = 'El popup fue bloqueado por el navegador. Por favor, permita popups para este sitio.';
      } else if (error.code === 'auth/popup-closed-by-user') {
        errorMessage = 'La ventana de autenticación fue cerrada. Por favor, intente nuevamente.';
      } else if (error.code === 'auth/account-exists-with-different-credential') {
        errorMessage = 'Este correo ya está registrado con otro proveedor (email/password, GitHub o Microsoft). Por favor, inicie sesión con el método que usó originalmente para registrarse.';
      }
      
      setError(errorMessage);
      
      // Mostrar alerta más amigable para el caso de cuenta duplicada
      if (error.code === 'auth/account-exists-with-different-credential') {
        await Swal.fire({
          icon: 'warning',
          title: 'Cuenta ya existente',
          html: `
            <p>Este correo electrónico ya está registrado con otro método de autenticación.</p>
            <p><strong>Solución:</strong> Intente iniciar sesión usando el método con el que se registró originalmente:</p>
            <ul style="text-align: left; margin-top: 10px;">
              <li>📧 Email y contraseña</li>
              <li>🔴 Google</li>
              <li>⚫ GitHub</li>
              <li>🔵 Microsoft</li>
            </ul>
          `,
          confirmButtonText: 'Entendido'
        });
      }
    } finally {
      setLoading(false);
    }
  };

  // Manejo de login con GitHub
  const handleGithubLogin = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const provider = new GithubAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      console.log('Usuario autenticado con GitHub:', user);

      // Buscar usuario existente en backend (NO crear uno nuevo)
      const existingUser = await findUserInBackend(user.email || '');

      // Actualizar Redux
      dispatch(setUser(existingUser));

      // Guardar en localStorage para el sistema JWT
      localStorage.setItem('user', JSON.stringify(existingUser));

      // Mostrar notificación de bienvenida
      await Swal.fire({
        icon: 'success',
        title: '¡Bienvenido de nuevo!',
        text: `Has iniciado sesión correctamente. ¡Bienvenido, ${existingUser?.name || 'Usuario'}!`,
        timer: 2000,
        showConfirmButton: false
      });

      // ✅ Redirección a la página de usuarios después del login exitoso con GitHub
      navigate('/users/list');
    } catch (error: any) {
      console.error('Error al iniciar sesión con GitHub:', error);
      
      let errorMessage = 'Error al iniciar sesión con GitHub. Por favor, intente nuevamente.';
      
      if (error.message && error.message.includes('Usuario no registrado')) {
        errorMessage = 'No existe una cuenta con este correo de GitHub. Por favor, regístrese primero.';
      } else if (error.code === 'auth/popup-blocked') {
        errorMessage = 'El popup fue bloqueado por el navegador. Por favor, permita popups para este sitio.';
      } else if (error.code === 'auth/popup-closed-by-user') {
        errorMessage = 'La ventana de autenticación fue cerrada. Por favor, intente nuevamente.';
      } else if (error.code === 'auth/account-exists-with-different-credential') {
        errorMessage = 'Este correo ya está registrado con otro proveedor (email/password, Google o Microsoft). Por favor, inicie sesión con el método que usó originalmente para registrarse.';
      }
      
      setError(errorMessage);
      
      // Mostrar alerta más amigable para el caso de cuenta duplicada
      if (error.code === 'auth/account-exists-with-different-credential') {
        await Swal.fire({
          icon: 'warning',
          title: 'Cuenta ya existente',
          html: `
            <p>Este correo electrónico ya está registrado con otro método de autenticación.</p>
            <p><strong>Solución:</strong> Intente iniciar sesión usando el método con el que se registró originalmente:</p>
            <ul style="text-align: left; margin-top: 10px;">
              <li>📧 Email y contraseña</li>
              <li>🔴 Google</li>
              <li>⚫ GitHub</li>
              <li>🔵 Microsoft</li>
            </ul>
          `,
          confirmButtonText: 'Entendido'
        });
      }
    } finally {
      setLoading(false);
    }
  };

  // Manejo de login con Microsoft
  const handleMicrosoftLogin = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const provider = new OAuthProvider('microsoft.com');
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      console.log('Usuario autenticado con Microsoft:', user);

      // Buscar usuario existente en backend (NO crear uno nuevo)
      const existingUser = await findUserInBackend(user.email || '');

      // Actualizar Redux
      dispatch(setUser(existingUser));

      // Guardar en localStorage para el sistema JWT
      localStorage.setItem('user', JSON.stringify(existingUser));

      // Mostrar notificación de bienvenida
      await Swal.fire({
        icon: 'success',
        title: '¡Bienvenido de nuevo!',
        text: `Has iniciado sesión correctamente. ¡Bienvenido, ${existingUser?.name || 'Usuario'}!`,
        timer: 2000,
        showConfirmButton: false
      });

      // ✅ Redirección a la página de usuarios después del login exitoso con Microsoft
      navigate('/users/list');
    } catch (error: any) {
      console.error('Error al iniciar sesión con Microsoft:', error);
      
      let errorMessage = 'Error al iniciar sesión con Microsoft. Por favor, intente nuevamente.';
      
      // Error específico: Microsoft no está configurado en Firebase/Azure
      if (error.code === 'auth/unauthorized-domain' || error.message?.includes('unauthorized_client')) {
        errorMessage = 'Microsoft no está configurado correctamente en Firebase. Por favor, contacte al administrador.';
        
        // Mostrar alerta detallada con instrucciones para configurar
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
        return; // Salir sin setear el error en el estado
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
        return; // Salir sin setear el error en el estado
      }
      
      if (error.message && error.message.includes('Usuario no registrado')) {
        errorMessage = 'No existe una cuenta con este correo de Microsoft. Por favor, regístrese primero.';
      } else if (error.code === 'auth/popup-blocked') {
        errorMessage = 'El popup fue bloqueado por el navegador. Por favor, permita popups para este sitio.';
      } else if (error.code === 'auth/popup-closed-by-user') {
        errorMessage = 'La ventana de autenticación fue cerrada. Por favor, intente nuevamente.';
      } else if (error.code === 'auth/account-exists-with-different-credential') {
        errorMessage = 'Este correo ya está registrado con otro proveedor (email/password, Google o GitHub). Por favor, inicie sesión con el método que usó originalmente para registrarse.';
      }
      
      setError(errorMessage);
      
      // Mostrar alerta más amigable para el caso de cuenta duplicada
      if (error.code === 'auth/account-exists-with-different-credential') {
        await Swal.fire({
          icon: 'warning',
          title: 'Cuenta ya existente',
          html: `
            <p>Este correo electrónico ya está registrado con otro método de autenticación.</p>
            <p><strong>Solución:</strong> Intente iniciar sesión usando el método con el que se registró originalmente:</p>
            <ul style="text-align: left; margin-top: 10px;">
              <li>📧 Email y contraseña</li>
              <li>🔴 Google</li>
              <li>⚫ GitHub</li>
              <li>🔵 Microsoft</li>
            </ul>
          `,
          confirmButtonText: 'Entendido'
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
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

              {/* Botones de autenticación social */}
              <div className="mb-4">
                <Button
                  variant="outline-danger"
                  className="w-100 mb-3 d-flex align-items-center justify-content-center"
                  style={{ padding: '0.75rem' }}
                  onClick={handleGoogleLogin}
                  disabled={loading}
                >
                  <svg width="18" height="18" viewBox="0 0 18 18" className="me-2">
                    <path fill="#4285F4" d="M16.51 8H8.98v3h4.3c-.18 1-.74 1.48-1.6 2.04v2.01h2.6a7.8 7.8 0 0 0 2.38-5.88c0-.57-.05-.66-.15-1.18z"/>
                    <path fill="#34A853" d="M8.98 17c2.16 0 3.97-.72 5.3-1.94l-2.6-2a4.8 4.8 0 0 1-7.18-2.54H1.83v2.07A8 8 0 0 0 8.98 17z"/>
                    <path fill="#FBBC05" d="M4.5 10.52a4.8 4.8 0 0 1 0-3.04V5.41H1.83a8 8 0 0 0 0 7.18l2.67-2.07z"/>
                    <path fill="#EA4335" d="M8.98 4.18c1.17 0 2.23.4 3.06 1.2l2.3-2.3A8 8 0 0 0 1.83 5.4L4.5 7.49a4.77 4.77 0 0 1 4.48-3.3z"/>
                  </svg>
                  Continuar con Google
                </Button>

                <Button
                  variant="dark"
                  className="w-100 mb-3 d-flex align-items-center justify-content-center"
                  style={{ padding: '0.75rem' }}
                  onClick={handleGithubLogin}
                  disabled={loading}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="white" className="me-2">
                    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/>
                  </svg>
                  Continuar con GitHub
                </Button>

                <Button
                  variant="outline-primary"
                  className="w-100 mb-3 d-flex align-items-center justify-content-center"
                  style={{ padding: '0.75rem' }}
                  onClick={handleMicrosoftLogin}
                  disabled={loading}
                >
                  <svg width="18" height="18" viewBox="0 0 21 21" className="me-2">
                    <rect x="1" y="1" width="9" height="9" fill="#f35325"/>
                    <rect x="1" y="11" width="9" height="9" fill="#81bc06"/>
                    <rect x="11" y="1" width="9" height="9" fill="#05a6f0"/>
                    <rect x="11" y="11" width="9" height="9" fill="#ffba08"/>
                  </svg>
                  Continuar con Microsoft
                </Button>

                <div className="text-center my-3">
                  <span className="text-muted">O inicia sesión con email</span>
                </div>
                
                {/* 💡 Mensaje informativo sobre métodos de autenticación */}
                <Alert 
                  variant="info" 
                  className="py-2 px-3"
                  style={{ 
                    fontSize: '0.875rem',
                    backgroundColor: '#e0f2fe',
                    borderColor: '#bae6fd',
                    color: '#075985'
                  }}
                >
                  <div className="d-flex align-items-start">
                    <strong className="me-2">💡</strong>
                    <div style={{ fontSize: '0.85rem' }}>
                      <strong>Importante:</strong> Si te registraste con Google, GitHub o Microsoft, 
                      debes usar el mismo botón para iniciar sesión. El formulario de email/contraseña 
                      solo funciona para cuentas creadas con email.
                    </div>
                  </div>
                </Alert>
              </div>

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
                      <a 
                        href="/forgot-password" 
                        style={{ color: '#10b981', textDecoration: 'none' }}
                        onClick={(e) => {
                          e.preventDefault();
                          navigate('/forgot-password');
                        }}
                      >
                        ¿Olvidó su contraseña?
                      </a>
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
    </AuthLayout>
  );
};

export default SignIn;
