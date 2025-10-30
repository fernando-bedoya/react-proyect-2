import { Container, Row, Col, Card, Button, ProgressBar, Badge, ListGroup } from 'react-bootstrap';
import { 
  Users, 
  ShoppingCart, 
  DollarSign, 
  Activity,
  ArrowUp,
  ArrowDown,
  MoreVertical
} from 'lucide-react';

const DashboardBootstrap = () => {
  // Datos de ejemplo
  const stats = [
    {
      title: 'Total de Ventas',
      value: '$45,231',
      change: '+12.5%',
      trend: 'up',
      icon: <DollarSign size={24} />,
      color: '#10b981', // Verde
      bgLight: '#d1fae5',
    },
    {
      title: 'Total Usuarios',
      value: '2,543',
      change: '+8.2%',
      trend: 'up',
      icon: <Users size={24} />,
      color: '#3b82f6', // Azul
      bgLight: '#dbeafe',
    },
    {
      title: 'Pedidos',
      value: '1,234',
      change: '-3.1%',
      trend: 'down',
      icon: <ShoppingCart size={24} />,
      color: '#f59e0b', // Naranja
      bgLight: '#fef3c7',
    },
    {
      title: 'Conversión',
      value: '3.24%',
      change: '+0.5%',
      trend: 'up',
      icon: <Activity size={24} />,
      color: '#8b5cf6', // Púrpura
      bgLight: '#ede9fe',
    },
  ];

  const recentOrders = [
    { id: '#ORD-001', customer: 'Juan Pérez', amount: '$250.00', status: 'Completado', color: 'success' },
    { id: '#ORD-002', customer: 'María García', amount: '$180.00', status: 'Pendiente', color: 'warning' },
    { id: '#ORD-003', customer: 'Carlos López', amount: '$320.00', status: 'Completado', color: 'success' },
    { id: '#ORD-004', customer: 'Ana Martínez', amount: '$150.00', status: 'En proceso', color: 'info' },
    { id: '#ORD-005', customer: 'Luis Rodríguez', amount: '$420.00', status: 'Cancelado', color: 'danger' },
  ];

  const topProducts = [
    { name: 'Producto A', sales: 234, progress: 85 },
    { name: 'Producto B', sales: 198, progress: 72 },
    { name: 'Producto C', sales: 156, progress: 58 },
    { name: 'Producto D', sales: 142, progress: 51 },
    { name: 'Producto E', sales: 98, progress: 35 },
  ];

  return (
    <Container fluid className="px-0">
      {/* Page Header */}
      <div className="mb-4">
        <h1 className="h2 fw-bold mb-2" style={{ color: '#1f2937' }}>
          Dashboard
        </h1>
        <p className="text-muted mb-0">
          Bienvenido de vuelta! Aquí está tu resumen de hoy.
        </p>
      </div>

      {/* Stats Cards */}
      <Row className="g-4 mb-4">
        {stats.map((stat, index) => (
          <Col key={index} xs={12} sm={6} lg={3}>
            <Card className="border-0 shadow-sm h-100">
              <Card.Body>
                <div className="d-flex justify-content-between align-items-start mb-3">
                  <div
                    className="rounded d-flex align-items-center justify-content-center"
                    style={{
                      width: '48px',
                      height: '48px',
                      backgroundColor: stat.bgLight,
                      color: stat.color,
                    }}
                  >
                    {stat.icon}
                  </div>
                  <div className="text-end">
                    <div className="d-flex align-items-center gap-1">
                      {stat.trend === 'up' ? (
                        <ArrowUp size={16} style={{ color: '#10b981' }} />
                      ) : (
                        <ArrowDown size={16} style={{ color: '#ef4444' }} />
                      )}
                      <span
                        className="fw-semibold"
                        style={{
                          fontSize: '0.875rem',
                          color: stat.trend === 'up' ? '#10b981' : '#ef4444',
                        }}
                      >
                        {stat.change}
                      </span>
                    </div>
                  </div>
                </div>
                <h3 className="mb-1 fw-bold" style={{ fontSize: '1.75rem', color: '#1f2937' }}>
                  {stat.value}
                </h3>
                <p className="text-muted mb-0" style={{ fontSize: '0.875rem' }}>
                  {stat.title}
                </p>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      <Row className="g-4">
        {/* Recent Orders */}
        <Col xs={12} lg={8}>
          <Card className="border-0 shadow-sm h-100">
            <Card.Header className="bg-white border-bottom d-flex justify-content-between align-items-center py-3">
              <h5 className="mb-0 fw-semibold">Pedidos Recientes</h5>
              <Button 
                variant="link" 
                className="text-decoration-none p-0"
                style={{ color: '#10b981' }}
              >
                Ver todos
              </Button>
            </Card.Header>
            <Card.Body className="p-0">
              <div className="table-responsive">
                <table className="table table-hover mb-0">
                  <thead style={{ backgroundColor: '#f9fafb' }}>
                    <tr>
                      <th className="border-0 py-3 px-4">ID Pedido</th>
                      <th className="border-0 py-3">Cliente</th>
                      <th className="border-0 py-3">Monto</th>
                      <th className="border-0 py-3">Estado</th>
                      <th className="border-0 py-3"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentOrders.map((order, index) => (
                      <tr key={index}>
                        <td className="px-4 py-3">
                          <span className="fw-semibold">{order.id}</span>
                        </td>
                        <td className="py-3">{order.customer}</td>
                        <td className="py-3 fw-semibold">{order.amount}</td>
                        <td className="py-3">
                          <Badge bg={order.color as any}>{order.status}</Badge>
                        </td>
                        <td className="py-3">
                          <Button variant="link" size="sm" className="p-0 text-muted">
                            <MoreVertical size={16} />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card.Body>
          </Card>
        </Col>

        {/* Top Products */}
        <Col xs={12} lg={4}>
          <Card className="border-0 shadow-sm h-100">
            <Card.Header className="bg-white border-bottom py-3">
              <h5 className="mb-0 fw-semibold">Productos Más Vendidos</h5>
            </Card.Header>
            <Card.Body>
              <div className="d-flex flex-column gap-4">
                {topProducts.map((product, index) => (
                  <div key={index}>
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <span className="fw-semibold" style={{ fontSize: '0.9rem' }}>
                        {product.name}
                      </span>
                      <span className="text-muted" style={{ fontSize: '0.875rem' }}>
                        {product.sales} ventas
                      </span>
                    </div>
                    <ProgressBar 
                      now={product.progress} 
                      style={{ height: '8px' }}
                      variant="success"
                    />
                  </div>
                ))}
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Additional Section */}
      <Row className="g-4 mt-2">
        <Col xs={12} md={6} lg={4}>
          <Card className="border-0 shadow-sm" style={{ backgroundColor: '#10b981' }}>
            <Card.Body className="text-white">
              <h5 className="fw-semibold mb-3">Upgrade a Pro</h5>
              <p className="mb-4" style={{ fontSize: '0.9rem', opacity: 0.9 }}>
                Desbloquea funciones premium y obtén acceso ilimitado a todas las herramientas.
              </p>
              <Button variant="light" className="fw-semibold">
                Actualizar Ahora
              </Button>
            </Card.Body>
          </Card>
        </Col>

        <Col xs={12} md={6} lg={4}>
          <Card className="border-0 shadow-sm h-100">
            <Card.Body>
              <h6 className="fw-semibold mb-3">Actividad Reciente</h6>
              <ListGroup variant="flush">
                <ListGroup.Item className="px-0 py-2 border-0">
                  <small className="text-muted">Hace 5 min</small>
                  <div className="fw-medium">Nuevo pedido recibido</div>
                </ListGroup.Item>
                <ListGroup.Item className="px-0 py-2 border-0">
                  <small className="text-muted">Hace 1 hora</small>
                  <div className="fw-medium">Usuario registrado</div>
                </ListGroup.Item>
                <ListGroup.Item className="px-0 py-2 border-0">
                  <small className="text-muted">Hace 3 horas</small>
                  <div className="fw-medium">Pago procesado</div>
                </ListGroup.Item>
              </ListGroup>
            </Card.Body>
          </Card>
        </Col>

        <Col xs={12} md={12} lg={4}>
          <Card className="border-0 shadow-sm h-100">
            <Card.Body>
              <h6 className="fw-semibold mb-3">Resumen Rápido</h6>
              <div className="d-flex flex-column gap-3">
                <div className="d-flex justify-content-between align-items-center pb-2 border-bottom">
                  <span className="text-muted">Ingresos del mes</span>
                  <span className="fw-semibold">$12,500</span>
                </div>
                <div className="d-flex justify-content-between align-items-center pb-2 border-bottom">
                  <span className="text-muted">Gastos</span>
                  <span className="fw-semibold">$8,200</span>
                </div>
                <div className="d-flex justify-content-between align-items-center">
                  <span className="text-muted">Ganancia neta</span>
                  <span className="fw-bold" style={{ color: '#10b981' }}>
                    $4,300
                  </span>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default DashboardBootstrap;
