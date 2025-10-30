import React from 'react';
import { Modal, Button } from 'react-bootstrap';
import { AlertTriangle, CheckCircle, Info, AlertCircle } from 'lucide-react';

interface GenericModalProps {
  show: boolean;
  onHide: () => void;
  title: string;
  children: React.ReactNode;
  size?: 'sm' | 'lg' | 'xl';
  centered?: boolean;
  backdrop?: boolean | 'static';
  keyboard?: boolean;
  fullscreen?: true | 'sm-down' | 'md-down' | 'lg-down' | 'xl-down' | 'xxl-down';
  scrollable?: boolean;
  
  // Footer buttons
  showFooter?: boolean;
  primaryButton?: {
    label: string;
    onClick: () => void;
    variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info';
    disabled?: boolean;
    loading?: boolean;
  };
  secondaryButton?: {
    label: string;
    onClick: () => void;
    variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info' | 'outline-primary' | 'outline-secondary';
    disabled?: boolean;
  };
  
  // Alert type
  alertType?: 'info' | 'success' | 'warning' | 'danger';
  
  // Custom footer
  customFooter?: React.ReactNode;
  
  // Style
  className?: string;
  headerClassName?: string;
  bodyClassName?: string;
  footerClassName?: string;
}

const GenericModal: React.FC<GenericModalProps> = ({
  show,
  onHide,
  title,
  children,
  size,
  centered = true,
  backdrop = true,
  keyboard = true,
  fullscreen,
  scrollable = true,
  showFooter = true,
  primaryButton,
  secondaryButton,
  alertType,
  customFooter,
  className = '',
  headerClassName = '',
  bodyClassName = '',
  footerClassName = '',
}) => {
  
  // Obtener icono según el tipo de alerta
  const getAlertIcon = () => {
    switch (alertType) {
      case 'info':
        return <Info size={24} className="text-info" />;
      case 'success':
        return <CheckCircle size={24} className="text-success" />;
      case 'warning':
        return <AlertTriangle size={24} className="text-warning" />;
      case 'danger':
        return <AlertCircle size={24} className="text-danger" />;
      default:
        return null;
    }
  };

  return (
    <Modal
      show={show}
      onHide={onHide}
      size={size}
      centered={centered}
      backdrop={backdrop}
      keyboard={keyboard}
      fullscreen={fullscreen}
      scrollable={scrollable}
      className={className}
    >
      {/* Header */}
      <Modal.Header 
        closeButton 
        className={`border-bottom ${headerClassName}`}
        style={{ backgroundColor: '#f8f9fa' }}
      >
        <Modal.Title className="d-flex align-items-center gap-2">
          {alertType && getAlertIcon()}
          <span className="fw-bold">{title}</span>
        </Modal.Title>
      </Modal.Header>

      {/* Body */}
      <Modal.Body className={`p-4 ${bodyClassName}`}>
        {children}
      </Modal.Body>

      {/* Footer */}
      {showFooter && (
        <Modal.Footer className={`border-top bg-light ${footerClassName}`}>
          {customFooter ? (
            customFooter
          ) : (
            <div className="d-flex gap-2 w-100 justify-content-end">
              {secondaryButton && (
                <Button
                  variant={secondaryButton.variant || 'outline-secondary'}
                  onClick={secondaryButton.onClick}
                  disabled={secondaryButton.disabled || primaryButton?.loading}
                  className="px-4"
                >
                  {secondaryButton.label}
                </Button>
              )}
              
              {primaryButton && (
                <Button
                  variant={primaryButton.variant || 'success'}
                  onClick={primaryButton.onClick}
                  disabled={primaryButton.disabled || primaryButton.loading}
                  className="px-4 d-flex align-items-center gap-2"
                >
                  {primaryButton.loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                      Procesando...
                    </>
                  ) : (
                    primaryButton.label
                  )}
                </Button>
              )}
            </div>
          )}
        </Modal.Footer>
      )}
    </Modal>
  );
};

export default GenericModal;