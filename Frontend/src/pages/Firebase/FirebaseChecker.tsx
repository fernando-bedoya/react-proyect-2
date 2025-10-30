import React, { useState } from 'react';
import { Container, Card, Button, Alert, ListGroup } from 'react-bootstrap';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { addDoc, collection } from 'firebase/firestore';
import { auth, db } from '../../firebase';
import { CheckCircle, XCircle, AlertCircle } from 'lucide-react';

const FirebaseChecker: React.FC = () => {
  const [checking, setChecking] = useState(false);
  const [results, setResults] = useState<any>({
    firebaseInit: null,
    authEnabled: null,
    firestoreEnabled: null,
  });

  const checkFirebaseSetup = async () => {
    setChecking(true);
    const newResults: any = {
      firebaseInit: null,
      authEnabled: null,
      firestoreEnabled: null,
    };

    // 1. Verificar inicialización de Firebase
    try {
      if (auth && db) {
        newResults.firebaseInit = {
          status: 'success',
          message: '✅ Firebase inicializado correctamente',
          details: `Proyecto: ${auth.app.options.projectId}`
        };
      } else {
        throw new Error('Auth o DB no están definidos');
      }
    } catch (error: any) {
      newResults.firebaseInit = {
        status: 'error',
        message: '❌ Error al inicializar Firebase',
        details: error.message
      };
    }

    // 2. Verificar Authentication
    try {
      const testEmail = `test_${Date.now()}@firebasetest.com`;
      const testPassword = 'TestPassword123!';
      
      await createUserWithEmailAndPassword(auth, testEmail, testPassword);
      
      newResults.authEnabled = {
        status: 'success',
        message: '✅ Authentication está habilitado y funcionando',
        details: 'Email/Password habilitado correctamente'
      };

      // Eliminar usuario de prueba
      const currentUser = auth.currentUser;
      if (currentUser) {
        await currentUser.delete();
      }
    } catch (error: any) {
      if (error.code === 'auth/operation-not-allowed') {
        newResults.authEnabled = {
          status: 'error',
          message: '❌ Authentication NO está habilitado',
          details: 'Necesitas habilitar Email/Password en Firebase Console',
          fix: '1. Ve a https://console.firebase.google.com/\n2. Selecciona tu proyecto\n3. Build → Authentication\n4. Sign-in method → Email/Password → Enable'
        };
      } else if (error.code === 'auth/weak-password') {
        newResults.authEnabled = {
          status: 'success',
          message: '✅ Authentication está habilitado',
          details: 'El servicio responde correctamente'
        };
      } else {
        newResults.authEnabled = {
          status: 'warning',
          message: '⚠️ Authentication responde pero hay un problema',
          details: error.message
        };
      }
    }

    // 3. Verificar Firestore
    try {
      const testDoc = await addDoc(collection(db, 'test_collection'), {
        test: true,
        timestamp: new Date()
      });
      
      newResults.firestoreEnabled = {
        status: 'success',
        message: '✅ Firestore está habilitado y funcionando',
        details: `Documento de prueba creado: ${testDoc.id}`
      };
    } catch (error: any) {
      if (error.code === 'permission-denied') {
        newResults.firestoreEnabled = {
          status: 'error',
          message: '❌ Firestore NO está habilitado',
          details: 'Necesitas crear la base de datos en Firebase Console',
          fix: '1. Ve a https://console.firebase.google.com/\n2. Selecciona tu proyecto\n3. Build → Firestore Database\n4. Create Database\n5. Selecciona "Start in test mode"\n6. Elige la región más cercana'
        };
      } else {
        newResults.firestoreEnabled = {
          status: 'warning',
          message: '⚠️ Firestore responde pero hay un problema',
          details: error.message
        };
      }
    }

    setResults(newResults);
    setChecking(false);
  };

  const getIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="text-success" size={24} />;
      case 'error':
        return <XCircle className="text-danger" size={24} />;
      case 'warning':
        return <AlertCircle className="text-warning" size={24} />;
      default:
        return null;
    }
  };

  return (
    <Container fluid className="p-4">
      <Card className="shadow-sm">
        <Card.Header className="bg-info text-white">
          <h4 className="mb-0">🔧 Verificador de Configuración de Firebase</h4>
        </Card.Header>
        <Card.Body>
          <Alert variant="info">
            Esta herramienta verifica que Firebase esté configurado correctamente.
            Haz clic en el botón para ejecutar las pruebas.
          </Alert>

          <Button 
            variant="primary" 
            onClick={checkFirebaseSetup} 
            disabled={checking}
            className="mb-4"
          >
            {checking ? 'Verificando...' : '🔍 Verificar Configuración'}
          </Button>

          {Object.keys(results).some(key => results[key] !== null) && (
            <ListGroup>
              {results.firebaseInit && (
                <ListGroup.Item>
                  <div className="d-flex align-items-start">
                    <div className="me-3">{getIcon(results.firebaseInit.status)}</div>
                    <div className="flex-grow-1">
                      <h6>{results.firebaseInit.message}</h6>
                      <small className="text-muted">{results.firebaseInit.details}</small>
                      {results.firebaseInit.fix && (
                        <Alert variant="warning" className="mt-2 mb-0">
                          <strong>Cómo solucionarlo:</strong>
                          <pre className="mt-2 mb-0" style={{ whiteSpace: 'pre-wrap' }}>
                            {results.firebaseInit.fix}
                          </pre>
                        </Alert>
                      )}
                    </div>
                  </div>
                </ListGroup.Item>
              )}

              {results.authEnabled && (
                <ListGroup.Item>
                  <div className="d-flex align-items-start">
                    <div className="me-3">{getIcon(results.authEnabled.status)}</div>
                    <div className="flex-grow-1">
                      <h6>{results.authEnabled.message}</h6>
                      <small className="text-muted">{results.authEnabled.details}</small>
                      {results.authEnabled.fix && (
                        <Alert variant="danger" className="mt-2 mb-0">
                          <strong>Cómo solucionarlo:</strong>
                          <pre className="mt-2 mb-0" style={{ whiteSpace: 'pre-wrap' }}>
                            {results.authEnabled.fix}
                          </pre>
                        </Alert>
                      )}
                    </div>
                  </div>
                </ListGroup.Item>
              )}

              {results.firestoreEnabled && (
                <ListGroup.Item>
                  <div className="d-flex align-items-start">
                    <div className="me-3">{getIcon(results.firestoreEnabled.status)}</div>
                    <div className="flex-grow-1">
                      <h6>{results.firestoreEnabled.message}</h6>
                      <small className="text-muted">{results.firestoreEnabled.details}</small>
                      {results.firestoreEnabled.fix && (
                        <Alert variant="danger" className="mt-2 mb-0">
                          <strong>Cómo solucionarlo:</strong>
                          <pre className="mt-2 mb-0" style={{ whiteSpace: 'pre-wrap' }}>
                            {results.firestoreEnabled.fix}
                          </pre>
                        </Alert>
                      )}
                    </div>
                  </div>
                </ListGroup.Item>
              )}
            </ListGroup>
          )}

          <Alert variant="success" className="mt-4">
            <strong>✅ Si todos los checks son verdes:</strong>
            <ul className="mb-0 mt-2">
              <li>Puedes usar Firebase Authentication</li>
              <li>Puedes usar Firestore Database</li>
              <li>Ve a <a href="/firebase">Firebase Demo</a> para probarlo</li>
            </ul>
          </Alert>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default FirebaseChecker;
