import React from 'react';
import { Modal, Button } from 'react-bootstrap';
import { AlertTriangle, CheckCircle, Info, AlertCircle } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
// Material UI imports
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button as MuiButton,
  IconButton,
  CircularProgress,
  Box,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import InfoIcon from '@mui/icons-material/Info';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningIcon from '@mui/icons-material/Warning';
import ErrorIcon from '@mui/icons-material/Error';

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
  const { designLibrary } = useTheme();
  
  // Obtener icono según el tipo de alerta (Bootstrap)
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

  // Obtener icono Material UI según el tipo de alerta
  const getMuiAlertIcon = () => {
    const iconProps = { sx: { mr: 1 } };
    switch (alertType) {
      case 'info':
        return <InfoIcon color="info" {...iconProps} />;
      case 'success':
        return <CheckCircleIcon color="success" {...iconProps} />;
      case 'warning':
        return <WarningIcon color="warning" {...iconProps} />;
      case 'danger':
        return <ErrorIcon color="error" {...iconProps} />;
      default:
        return null;
    }
  };

  // Mapear tamaño de Bootstrap a Material UI
  const getMuiSize = () => {
    switch (size) {
      case 'sm': return 'sm';
      case 'lg': return 'md';
      case 'xl': return 'lg';
      default: return 'sm';
    }
  };

  // Mapear variante de botón a color Material UI
  const getMuiButtonColor = (variant?: string) => {
    const colorMap: Record<string, 'primary' | 'secondary' | 'success' | 'error' | 'warning' | 'info'> = {
      'primary': 'primary',
      'secondary': 'secondary',
      'success': 'success',
      'danger': 'error',
      'warning': 'warning',
      'info': 'info',
    };
    return colorMap[variant || 'primary'] || 'primary';
  };

  // Renderizado Material UI
  if (designLibrary === 'material') {
    return (
      <Dialog
        open={show}
        onClose={keyboard ? onHide : undefined}
        maxWidth={getMuiSize()}
        fullWidth
        fullScreen={!!fullscreen}
        className={className}
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#f5f5f5' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            {alertType && getMuiAlertIcon()}
            <span style={{ fontWeight: 600 }}>{title}</span>
          </Box>
          <IconButton
            aria-label="close"
            onClick={onHide}
            size="small"
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ p: 3 }} className={bodyClassName}>
          {children}
        </DialogContent>

        {showFooter && (
          <DialogActions sx={{ p: 2, backgroundColor: '#f5f5f5' }} className={footerClassName}>
            {customFooter ? (
              customFooter
            ) : (
              <>
                {secondaryButton && (
                  <MuiButton
                    variant={secondaryButton.variant?.includes('outline') ? 'outlined' : 'contained'}
                    color={getMuiButtonColor(secondaryButton.variant)}
                    onClick={secondaryButton.onClick}
                    disabled={secondaryButton.disabled || primaryButton?.loading}
                  >
                    {secondaryButton.label}
                  </MuiButton>
                )}
                
                {primaryButton && (
                  <MuiButton
                    variant="contained"
                    color={getMuiButtonColor(primaryButton.variant)}
                    onClick={primaryButton.onClick}
                    disabled={primaryButton.disabled || primaryButton.loading}
                    startIcon={primaryButton.loading ? <CircularProgress size={16} /> : undefined}
                  >
                    {primaryButton.loading ? 'Procesando...' : primaryButton.label}
                  </MuiButton>
                )}
              </>
            )}
          </DialogActions>
        )}
      </Dialog>
    );
  }

  // Renderizado Bootstrap con tema VERDE/EMERALD mejorado
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
      style={{
        fontFamily: '"Segoe UI", "SF Pro Display", sans-serif'
      }}
    >
      {/* Header */}
      <Modal.Header 
        closeButton 
        className={`border-0 ${headerClassName}`}
        style={{ 
          background: 'linear-gradient(135deg, #047857 0%, #059669 50%, #10b981 100%)',
          color: '#ffffff',
          padding: '20px 24px',
          borderRadius: '0',
          boxShadow: '0 4px 12px rgba(4, 120, 87, 0.3)'
        }}
      >
        <Modal.Title className="d-flex align-items-center gap-3" style={{ fontSize: '1.25rem', fontWeight: '800' }}>
          {alertType && (
            <span style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
              backdropFilter: 'blur(10px)'
            }}>
              {getAlertIcon()}
            </span>
          )}
          <span>{title}</span>
        </Modal.Title>
      </Modal.Header>

      {/* Body */}
      <Modal.Body 
        className={`${bodyClassName}`}
        style={{
          padding: '28px 24px',
          backgroundColor: '#f0fdf4',
          color: '#065f46',
          fontSize: '1rem',
          lineHeight: '1.6'
        }}
      >
        {children}
      </Modal.Body>

      {/* Footer */}
      {showFooter && (
        <Modal.Footer 
          className={`border-0 ${footerClassName}`}
          style={{
            background: 'linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)',
            padding: '20px 24px',
            borderRadius: '0'
          }}
        >
          {customFooter ? (
            customFooter
          ) : (
            <div className="d-flex gap-3 w-100 justify-content-end">
              {secondaryButton && (
                <Button
                  variant={secondaryButton.variant || 'outline-secondary'}
                  onClick={secondaryButton.onClick}
                  disabled={secondaryButton.disabled || primaryButton?.loading}
                  style={{
                    padding: '12px 28px',
                    fontSize: '1rem',
                    fontWeight: '700',
                    borderRadius: '12px',
                    border: '2.5px solid #6ee7b7',
                    color: '#059669',
                    backgroundColor: 'transparent',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#d1fae5';
                    e.currentTarget.style.borderColor = '#10b981';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 8px 20px rgba(16, 185, 129, 0.3)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.borderColor = '#6ee7b7';
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  {secondaryButton.label}
                </Button>
              )}
              
              {primaryButton && (
                <Button
                  variant={primaryButton.variant || 'success'}
                  onClick={primaryButton.onClick}
                  disabled={primaryButton.disabled || primaryButton.loading}
                  className="d-flex align-items-center gap-2"
                  style={{
                    padding: '12px 32px',
                    fontSize: '1rem',
                    fontWeight: '800',
                    borderRadius: '12px',
                    border: 'none',
                    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                    color: '#ffffff',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    boxShadow: '0 4px 12px rgba(16, 185, 129, 0.4)',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    if (!primaryButton.disabled && !primaryButton.loading) {
                      e.currentTarget.style.background = 'linear-gradient(135deg, #059669 0%, #047857 100%)';
                      e.currentTarget.style.transform = 'translateY(-2px) scale(1.02)';
                      e.currentTarget.style.boxShadow = '0 8px 24px rgba(5, 150, 105, 0.5)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'linear-gradient(135deg, #10b981 0%, #059669 100%)';
                    e.currentTarget.style.transform = 'translateY(0) scale(1)';
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(16, 185, 129, 0.4)';
                  }}
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