import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Form, Alert, Badge, ListGroup } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser,
  GoogleAuthProvider,
  GithubAuthProvider,
  OAuthProvider,
  signInWithPopup,
  fetchSignInMethodsForEmail
} from 'firebase/auth';
import { 
  collection, 
  addDoc, 
  getDocs, 
  deleteDoc, 
  doc,
  updateDoc,
  Timestamp 
} from 'firebase/firestore';
import { auth, db } from '../../firebase';
import { UserPlus, LogIn, LogOut, Plus, Trash2, Github } from 'lucide-react';

interface Task {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  createdAt: Date;
}

const FirebaseDemo: React.FC = () => {
  // Auth state
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authMessage, setAuthMessage] = useState<{ type: 'success' | 'danger'; text: string } | null>(null);

  // Firestore state
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDescription, setNewTaskDescription] = useState('');
  const [firestoreMessage, setFirestoreMessage] = useState<{ type: 'success' | 'danger'; text: string } | null>(null);

  // Monitor auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        loadTasks();
      } else {
        setTasks([]);
      }
    });

    return () => unsubscribe();
  }, []);

  // Authentication functions
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      setAuthMessage({ type: 'success', text: '✅ Cuenta creada exitosamente' });
      setEmail('');
      setPassword('');
    } catch (error: any) {
      console.error('Error en signup:', error);
      let errorMsg = error.message;
      if (error.code === 'auth/operation-not-allowed') {
        errorMsg = '❌ Authentication no está habilitado. Ve a Firebase Console → Authentication → Sign-in method → Email/Password → Enable';
      } else if (error.code === 'auth/weak-password') {
        errorMsg = '❌ La contraseña debe tener al menos 6 caracteres';
      } else if (error.code === 'auth/email-already-in-use') {
        errorMsg = '❌ Este email ya está registrado';
      } else if (error.code === 'auth/invalid-email') {
        errorMsg = '❌ Email inválido';
      }
      setAuthMessage({ type: 'danger', text: errorMsg });
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      setAuthMessage({ type: 'success', text: '✅ Inicio de sesión exitoso' });
      setEmail('');
      setPassword('');
    } catch (error: any) {
      console.error('Error en signin:', error);
      let errorMsg = error.message;
      if (error.code === 'auth/user-not-found') {
        errorMsg = '❌ Usuario no encontrado. Crea una cuenta primero';
      } else if (error.code === 'auth/wrong-password') {
        errorMsg = '❌ Contraseña incorrecta';
      } else if (error.code === 'auth/operation-not-allowed') {
        errorMsg = '❌ Authentication no está habilitado. Ve a Firebase Console → Authentication → Sign-in method → Email/Password → Enable';
      }
      setAuthMessage({ type: 'danger', text: errorMsg });
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      setAuthMessage({ type: 'success', text: '✅ Sesión cerrada' });
    } catch (error: any) {
      setAuthMessage({ type: 'danger', text: `❌ Error: ${error.message}` });
    }
  };

  // Social login functions
  const handleGoogleLogin = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      setAuthMessage({ type: 'success', text: '✅ Inicio de sesión con Google exitoso' });
    } catch (error: any) {
      console.error('Error en Google login:', error);
      let errorMsg = error.message;
      if (error.code === 'auth/operation-not-allowed') {
        errorMsg = '❌ Google Sign-In no está habilitado. Ve a Firebase Console → Authentication → Sign-in method → Google → Enable';
      } else if (error.code === 'auth/popup-blocked') {
        errorMsg = '❌ El popup fue bloqueado. Permite popups para este sitio';
      } else if (error.code === 'auth/popup-closed-by-user') {
        errorMsg = '⚠️ Login cancelado';
      }
      setAuthMessage({ type: 'danger', text: errorMsg });
    }
  };

  const handleGithubLogin = async () => {
    try {
      const provider = new GithubAuthProvider();
      await signInWithPopup(auth, provider);
      setAuthMessage({ type: 'success', text: '✅ Inicio de sesión con GitHub exitoso' });
    } catch (error: any) {
      console.error('Error en GitHub login:', error);
      let errorMsg = error.message;

      if (error.code === 'auth/account-exists-with-different-credential') {
        errorMsg = 'Ya existe una cuenta con este email usando otro método. Por favor, inicia sesión con ese método y vincula tu cuenta.';
        const existingProvider = await fetchSignInMethodsForEmail(auth, error.customData.email);
        console.log('Método existente:', existingProvider);
      }

      setAuthMessage({ type: 'danger', text: errorMsg });
    }
  };

  const handleMicrosoftLogin = async () => {
    try {
      const provider = new OAuthProvider('microsoft.com');
      await signInWithPopup(auth, provider);
      setAuthMessage({ type: 'success', text: '✅ Inicio de sesión con Microsoft exitoso' });
    } catch (error: any) {
      console.error('Error en Microsoft login:', error);
      let errorMsg = error.message;
      if (error.code === 'auth/operation-not-allowed') {
        errorMsg = '❌ Microsoft Sign-In no está habilitado. Ve a Firebase Console → Authentication → Sign-in method → Microsoft → Enable';
      } else if (error.code === 'auth/popup-blocked') {
        errorMsg = '❌ El popup fue bloqueado. Permite popups para este sitio';
      } else if (error.code === 'auth/popup-closed-by-user') {
        errorMsg = '⚠️ Login cancelado';
      }
      setAuthMessage({ type: 'danger', text: errorMsg });
    }
  };

  // Firestore functions
  const loadTasks = async () => {
    try {
      const tasksCollection = collection(db, 'tasks');
      const tasksSnapshot = await getDocs(tasksCollection);
      const tasksList = tasksSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date()
      })) as Task[];
      setTasks(tasksList);
    } catch (error: any) {
      console.error('Error al cargar tareas:', error);
      let errorMsg = error.message;
      if (error.code === 'permission-denied') {
        errorMsg = '❌ Firestore no está habilitado o no tienes permisos. Ve a Firebase Console → Firestore Database → Create Database (modo test)';
      }
      setFirestoreMessage({ type: 'danger', text: errorMsg });
    }
  };

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setFirestoreMessage({ type: 'danger', text: '❌ Debes iniciar sesión primero' });
      return;
    }

    try {
      await addDoc(collection(db, 'tasks'), {
        title: newTaskTitle,
        description: newTaskDescription,
        completed: false,
        createdAt: Timestamp.now(),
        userId: user.uid
      });
      setFirestoreMessage({ type: 'success', text: '✅ Tarea agregada' });
      setNewTaskTitle('');
      setNewTaskDescription('');
      loadTasks();
    } catch (error: any) {
      console.error('Error al agregar tarea:', error);
      let errorMsg = error.message;
      if (error.code === 'permission-denied') {
        errorMsg = '❌ Firestore no está habilitado o no tienes permisos. Ve a Firebase Console → Firestore Database → Create Database (modo test)';
      }
      setFirestoreMessage({ type: 'danger', text: errorMsg });
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      await deleteDoc(doc(db, 'tasks', taskId));
      setFirestoreMessage({ type: 'success', text: '✅ Tarea eliminada' });
      loadTasks();
    } catch (error: any) {
      setFirestoreMessage({ type: 'danger', text: `❌ Error: ${error.message}` });
    }
  };

  const handleToggleComplete = async (task: Task) => {
    try {
      await updateDoc(doc(db, 'tasks', task.id), {
        completed: !task.completed
      });
      loadTasks();
    } catch (error: any) {
      setFirestoreMessage({ type: 'danger', text: `❌ Error: ${error.message}` });
    }
  };

  return (
    <Container fluid className="py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="h2 fw-bold mb-2" style={{ 
            color: '#065f46',
            fontFamily: '"Segoe UI", sans-serif',
            letterSpacing: '-0.5px'
          }}>
            🔥 Firebase Demo
          </h2>
          <p className="mb-0" style={{ color: '#047857', fontSize: '1rem' }}>
            Autenticación y Base de Datos en Tiempo Real
            <Badge 
              bg="success" 
              className="ms-2"
              style={{
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                padding: '6px 12px',
                fontSize: '0.85rem',
                fontWeight: '700',
                borderRadius: '20px',
                boxShadow: '0 2px 8px rgba(16, 185, 129, 0.3)'
              }}
            >
              {user ? '✓ Conectado' : '○ Desconectado'}
            </Badge>
          </p>
        </div>
        <Link to="/firebase/checker">
          <Button 
            variant="outline-success"
            style={{
              borderWidth: '2px',
              borderColor: '#10b981',
              color: '#059669',
              fontWeight: '700',
              padding: '10px 20px',
              borderRadius: '10px'
            }}
          >
            🔧 Verificar Configuración
          </Button>
        </Link>
      </div>
      
      <Row>
        {/* Authentication Section */}
        <Col lg={6} className="mb-4">
          <Card className="shadow-sm" style={{ borderRadius: '16px', overflow: 'hidden' }}>
            <Card.Header 
              className="text-white"
              style={{
                background: 'linear-gradient(135deg, #047857 0%, #10b981 100%)',
                padding: '16px 20px'
              }}
            >
              <h4 className="mb-0 fw-bold">🔐 Authentication</h4>
            </Card.Header>
            <Card.Body>
              {authMessage && (
                <Alert variant={authMessage.type} dismissible onClose={() => setAuthMessage(null)}>
                  {authMessage.text}
                </Alert>
              )}

              {user ? (
                <div>
                  <Alert variant="success">
                    <strong>Usuario autenticado:</strong>
                    <br />
                    Email: {user.email}
                    <br />
                    UID: {user.uid}
                  </Alert>
                  <Button variant="danger" onClick={handleSignOut} className="w-100">
                    <span className="d-inline-flex align-items-center">
                      <LogOut className="me-2" size={18} />
                      Cerrar Sesión
                    </span>
                  </Button>
                </div>
              ) : (
                <div>
                  <Form onSubmit={handleSignIn} className="mb-3">
                    <Form.Group className="mb-3">
                      <Form.Label>Email</Form.Label>
                      <Form.Control
                        type="email"
                        placeholder="tu@email.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </Form.Group>
                    <Form.Group className="mb-3">
                      <Form.Label>Password</Form.Label>
                      <Form.Control
                        type="password"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                      />
                    </Form.Group>
                    <Button type="submit" variant="success" className="w-100 mb-2">
                      <span className="d-inline-flex align-items-center">
                        <LogIn className="me-2" size={18} />
                        Iniciar Sesión
                      </span>
                    </Button>
                  </Form>
                  
                  <Button onClick={handleSignUp} variant="outline-success" className="w-100 mb-3">
                    <span className="d-inline-flex align-items-center">
                      <UserPlus className="me-2" size={18} />
                      Crear Cuenta
                    </span>
                  </Button>

                  <hr className="my-3" />
                  <p className="text-center text-muted mb-3">O continúa con</p>

                  {/* Social Login Buttons */}
                  <div className="d-grid gap-2">
                    <Button 
                      onClick={handleGoogleLogin} 
                      variant="outline-danger" 
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
                      className="d-flex align-items-center justify-content-center"
                    >
                      <span className="d-inline-flex align-items-center">
                        <Github className="me-2" size={18} />
                        Continuar con GitHub
                      </span>
                    </Button>

                    <Button 
                      onClick={handleMicrosoftLogin} 
                      variant="outline-primary" 
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
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>

        {/* Firestore Section */}
        <Col lg={6} className="mb-4">
          <Card className="shadow-sm" style={{ borderRadius: '16px', overflow: 'hidden' }}>
            <Card.Header 
              className="text-white"
              style={{
                background: 'linear-gradient(135deg, #047857 0%, #10b981 100%)',
                padding: '16px 20px'
              }}
            >
              <h4 className="mb-0 fw-bold">📄 Firestore Database</h4>
            </Card.Header>
            <Card.Body>
              {firestoreMessage && (
                <Alert variant={firestoreMessage.type} dismissible onClose={() => setFirestoreMessage(null)}>
                  {firestoreMessage.text}
                </Alert>
              )}

              {user ? (
                <>
                  <Form onSubmit={handleAddTask} className="mb-4">
                    <Form.Group className="mb-2">
                      <Form.Control
                        type="text"
                        placeholder="Título de la tarea"
                        value={newTaskTitle}
                        onChange={(e) => setNewTaskTitle(e.target.value)}
                        required
                      />
                    </Form.Group>
                    <Form.Group className="mb-2">
                      <Form.Control
                        as="textarea"
                        rows={2}
                        placeholder="Descripción"
                        value={newTaskDescription}
                        onChange={(e) => setNewTaskDescription(e.target.value)}
                      />
                    </Form.Group>
                    <Button type="submit" variant="success" className="w-100">
                      <span className="d-inline-flex align-items-center">
                        <Plus className="me-2" size={18} />
                        Agregar Tarea
                      </span>
                    </Button>
                  </Form>

                  <h5 className="mb-3">
                    Tareas <Badge bg="secondary">{tasks.length}</Badge>
                  </h5>
                  
                  {tasks.length === 0 ? (
                    <Alert variant="info">No hay tareas. ¡Agrega una!</Alert>
                  ) : (
                    <ListGroup>
                      {tasks.map((task) => (
                        <ListGroup.Item key={task.id} className="d-flex justify-content-between align-items-start">
                          <div className="flex-grow-1">
                            <Form.Check
                              type="checkbox"
                              checked={task.completed}
                              onChange={() => handleToggleComplete(task)}
                              label={
                                <span className={task.completed ? 'text-decoration-line-through text-muted' : ''}>
                                  <strong>{task.title}</strong>
                                  {task.description && <><br /><small>{task.description}</small></>}
                                </span>
                              }
                            />
                          </div>
                          <Button
                            variant="outline-danger"
                            size="sm"
                            onClick={() => handleDeleteTask(task.id)}
                          >
                            <span className="d-inline-flex align-items-center">
                              <Trash2 size={16} />
                            </span>
                          </Button>
                        </ListGroup.Item>
                      ))}
                    </ListGroup>
                  )}
                </>
              ) : (
                <Alert variant="warning">
                  ⚠️ Debes iniciar sesión para usar Firestore
                </Alert>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Instructions Card */}
      <Row>
        <Col>
          <Card className="shadow-sm border-info">
            <Card.Header className="bg-info text-white">
              <h5 className="mb-0">📋 Instrucciones de Configuración</h5>
            </Card.Header>
            <Card.Body>
              <Alert variant="info" className="mb-3">
                <strong>🔍 ¿No funciona?</strong> Haz clic en el botón "Verificar Configuración" arriba para diagnosticar problemas.
              </Alert>

              <h6 className="text-success mb-3">📍 Pasos para habilitar Firebase:</h6>
              
              <div className="mb-3">
                <strong>1️⃣ Habilitar Authentication (Email/Password):</strong>
                <ul className="mt-2">
                  <li>Ve a <a href="https://console.firebase.google.com/project/react-proyect-fernando/authentication/providers" target="_blank" rel="noopener noreferrer">Firebase Console - Authentication</a></li>
                  <li>Click en la pestaña <strong>"Sign-in method"</strong></li>
                  <li>Click en <strong>"Email/Password"</strong></li>
                  <li>Activa el toggle <strong>"Enable"</strong></li>
                  <li>Click en <strong>"Save"</strong></li>
                </ul>
              </div>

              <div className="mb-3">
                <strong>2️⃣ Habilitar Login Social (Opcional pero recomendado):</strong>
                <ul className="mt-2">
                  <li>
                    <strong>Google:</strong>
                    <ul>
                      <li>En la misma página, click en <strong>"Google"</strong></li>
                      <li>Activa el toggle <strong>"Enable"</strong></li>
                      <li>Selecciona un email de soporte</li>
                      <li>Click en <strong>"Save"</strong></li>
                    </ul>
                  </li>
                  <li>
                    <strong>GitHub:</strong>
                    <ul>
                      <li>Click en <strong>"GitHub"</strong></li>
                      <li>Activa el toggle <strong>"Enable"</strong></li>
                      <li>Necesitarás crear una OAuth App en GitHub:</li>
                      <li>Ve a <a href="https://github.com/settings/applications/new" target="_blank" rel="noopener noreferrer">GitHub OAuth Apps</a></li>
                      <li>Application name: <code>Firebase Auth</code></li>
                      <li>Homepage URL: <code>http://localhost:5173</code></li>
                      <li>Authorization callback URL: (cópialo de Firebase Console)</li>
                      <li>Copia el Client ID y Client Secret a Firebase</li>
                      <li>Click en <strong>"Save"</strong></li>
                    </ul>
                  </li>
                  <li>
                    <strong>Microsoft:</strong>
                    <ul>
                      <li>Click en <strong>"Microsoft"</strong></li>
                      <li>Activa el toggle <strong>"Enable"</strong></li>
                      <li>Sigue las instrucciones de Firebase para configurar Azure AD</li>
                    </ul>
                  </li>
                </ul>
              </div>

              <div className="mb-3">
                <strong>3️⃣ Crear Firestore Database:</strong>
                <ul className="mt-2">
                  <li>Ve a <a href="https://console.firebase.google.com/project/react-proyect-fernando/firestore" target="_blank" rel="noopener noreferrer">Firebase Console - Firestore</a></li>
                  <li>Click en <strong>"Create database"</strong></li>
                  <li>Selecciona <strong>"Start in test mode"</strong> (para desarrollo)</li>
                  <li>Elige la ubicación más cercana (ej: <code>southamerica-east1</code>)</li>
                  <li>Click en <strong>"Enable"</strong></li>
                </ul>
              </div>

              <div className="mb-3">
                <strong>4️⃣ Probar la aplicación:</strong>
                <ul className="mt-2">
                  <li>Regresa a esta página</li>
                  <li>Prueba los botones de <strong>Google, GitHub o Microsoft</strong> (más fácil)</li>
                  <li>O crea una cuenta con <strong>email y contraseña</strong> (mínimo 6 caracteres)</li>
                  <li>Si todo está bien, verás "✅ Inicio de sesión exitoso"</li>
                  <li>Luego podrás agregar tareas a Firestore</li>
                </ul>
              </div>
              
              <Alert variant="warning" className="mt-3">
                <strong>⚠️ Importante:</strong> El modo "test" permite acceso público a Firestore. Solo úsalo en desarrollo.
                Para producción, configura reglas de seguridad adecuadas.
              </Alert>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default FirebaseDemo;
