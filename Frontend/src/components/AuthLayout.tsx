import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';

/**
 * 🎨 AuthLayout - Componente de diseño reutilizable para páginas de autenticación
 * 
 * Este componente proporciona un layout consistente y responsive para todas las páginas
 * de autenticación (SignIn, SignUp, ForgotPassword, etc.).
 * 
 * PROBLEMA RESUELTO:
 * - Cuando se recarga la página, Tailwind CSS (@tailwind base) resetea los estilos de Bootstrap,
 *   causando que el contenido quede pegado a la izquierda sin padding.
 * - Este componente usa estilos inline que tienen mayor especificidad y no son afectados
 *   por el reset de Tailwind, garantizando que el layout siempre sea responsive.
 * 
 * CARACTERÍSTICAS:
 * - ✅ Layout centrado vertical y horizontalmente
 * - ✅ Padding garantizado en todos los dispositivos (no afectado por resets de CSS)
 * - ✅ Responsive en móviles, tablets y desktop
 * - ✅ Fondo con gradiente personalizable
 * - ✅ Reutilizable en todas las páginas de autenticación
 * 
 * USO:
 * ```tsx
 * <AuthLayout>
 *   <Card>
 *     Tu contenido de autenticación aquí
 *   </Card>
 * </AuthLayout>
 * ```
 * 
 * @param children - Contenido a renderizar dentro del layout (típicamente un Card de Bootstrap)
 * @param backgroundColor - Color de fondo personalizado (opcional, por defecto gradiente verde)
 */

interface AuthLayoutProps {
  children: React.ReactNode;
  backgroundColor?: string;
}

const AuthLayout: React.FC<AuthLayoutProps> = ({ 
  children, 
  backgroundColor = 'linear-gradient(135deg, #10b981 0%, #059669 100%)' 
}) => {
  return (
    <Container 
      fluid 
      className="min-vh-100 d-flex align-items-center justify-content-center" 
      style={{ 
        background: backgroundColor,
        padding: '2rem 1rem', // ✅ Padding inline garantiza espacio incluso con reset de Tailwind
        minHeight: '100vh', // ✅ Altura mínima de viewport completo
        boxSizing: 'border-box' // ✅ Asegura que padding no cause overflow
      }}
    >
      <Row 
        className="w-100 justify-content-center" 
        style={{ 
          margin: '0', // ✅ Elimina margin negativo por defecto de Bootstrap Row
          maxWidth: '100%', // ✅ Previene que el Row exceda el ancho del contenedor
          boxSizing: 'border-box'
        }}
      >
        <Col 
          xs={12}  // 📱 Móviles: 100% del ancho
          sm={10}  // 📱 Tablets pequeñas: 83% del ancho
          md={8}   // 💻 Tablets: 66% del ancho
          lg={6}   // 🖥️ Desktop: 50% del ancho
          xl={5}   // 🖥️ Desktop grande: 42% del ancho
          style={{
            padding: '0 15px', // ✅ Padding horizontal inline para espaciado lateral consistente
            boxSizing: 'border-box'
          }}
        >
          {children}
        </Col>
      </Row>
    </Container>
  );
};

export default AuthLayout;
