import React, { useState } from 'react';
import { Form, Button, Row, Col, Alert } from 'react-bootstrap';
import { Save, X, RefreshCw } from 'lucide-react';

export interface FieldConfig {
  name: string;
  label: string;
  type: 'text' | 'email' | 'number' | 'password' | 'tel' | 'url' | 'date' | 'time' | 'datetime-local' | 'select' | 'textarea' | 'checkbox' | 'radio';
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  options?: Array<{ value: string | number; label: string }>;
  validation?: (value: any) => string | null;
  helpText?: string;
  rows?: number; // Para textarea
  min?: number;
  max?: number;
  step?: number;
  defaultValue?: any;
  cols?: number; // Número de columnas en el grid (1-12)
}

interface GenericFormProps {
  fields: FieldConfig[];
  onSubmit: (data: Record<string, any>) => void;
  onCancel?: () => void;
  initialData?: Record<string, any>;
  submitLabel?: string;
  cancelLabel?: string;
  resetLabel?: string;
  showReset?: boolean;
  loading?: boolean;
  className?: string;
  variant?: 'default' | 'inline';
}

const GenericForm: React.FC<GenericFormProps> = ({
  fields,
  onSubmit,
  onCancel,
  initialData = {},
  submitLabel = 'Guardar',
  cancelLabel = 'Cancelar',
  resetLabel = 'Limpiar',
  showReset = false,
  loading = false,
  className = '',
  variant = 'default',
}) => {
  const [formData, setFormData] = useState<Record<string, any>>(() => {
    const initial: Record<string, any> = {};
    fields.forEach(field => {
      initial[field.name] = initialData[field.name] || field.defaultValue || '';
    });
    return initial;
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  // Manejar cambios en los campos
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    let newValue: any = value;
    
    if (type === 'checkbox') {
      newValue = (e.target as HTMLInputElement).checked;
    } else if (type === 'number') {
      newValue = value === '' ? '' : Number(value);
    }

    setFormData(prev => ({
      ...prev,
      [name]: newValue
    }));

    // Limpiar error cuando el usuario empieza a escribir
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  // Manejar blur (cuando el campo pierde el foco)
  const handleBlur = (fieldName: string) => {
    setTouched(prev => ({ ...prev, [fieldName]: true }));
    validateField(fieldName);
  };

  // Validar un campo específico
  const validateField = (fieldName: string) => {
    const field = fields.find(f => f.name === fieldName);
    if (!field) return;

    const value = formData[fieldName];

    // Validación de requerido
    if (field.required && !value && value !== 0) {
      setErrors(prev => ({
        ...prev,
        [fieldName]: `${field.label} es requerido`
      }));
      return false;
    }

    // Validación personalizada
    if (field.validation) {
      const error = field.validation(value);
      if (error) {
        setErrors(prev => ({ ...prev, [fieldName]: error }));
        return false;
      }
    }

    return true;
  };

  // Validar todo el formulario
  const validateForm = () => {
    let isValid = true;
    const newErrors: Record<string, string> = {};

    fields.forEach(field => {
      const value = formData[field.name];

      if (field.required && !value && value !== 0) {
        newErrors[field.name] = `${field.label} es requerido`;
        isValid = false;
      }

      if (field.validation) {
        const error = field.validation(value);
        if (error) {
          newErrors[field.name] = error;
          isValid = false;
        }
      }
    });

    setErrors(newErrors);
    return isValid;
  };

  // Manejar submit
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Marcar todos los campos como touched
    const allTouched: Record<string, boolean> = {};
    fields.forEach(field => {
      allTouched[field.name] = true;
    });
    setTouched(allTouched);

    if (validateForm()) {
      onSubmit(formData);
    }
  };

  // Resetear formulario
  const handleReset = () => {
    const initial: Record<string, any> = {};
    fields.forEach(field => {
      initial[field.name] = initialData[field.name] || field.defaultValue || '';
    });
    setFormData(initial);
    setErrors({});
    setTouched({});
  };

  // Renderizar un campo según su tipo
  const renderField = (field: FieldConfig) => {
    const hasError = touched[field.name] && errors[field.name];

    switch (field.type) {
      case 'select':
        return (
          <Form.Select
            name={field.name}
            value={formData[field.name] || ''}
            onChange={handleChange}
            onBlur={() => handleBlur(field.name)}
            isInvalid={!!hasError}
            disabled={field.disabled || loading}
            className="shadow-sm"
          >
            <option value="">Seleccionar...</option>
            {field.options?.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Form.Select>
        );

      case 'textarea':
        return (
          <Form.Control
            as="textarea"
            name={field.name}
            value={formData[field.name] || ''}
            onChange={handleChange}
            onBlur={() => handleBlur(field.name)}
            placeholder={field.placeholder}
            isInvalid={!!hasError}
            disabled={field.disabled || loading}
            rows={field.rows || 3}
            className="shadow-sm"
          />
        );

      case 'checkbox':
        return (
          <Form.Check
            type="checkbox"
            name={field.name}
            label={field.label}
            checked={!!formData[field.name]}
            onChange={handleChange}
            disabled={field.disabled || loading}
            isInvalid={!!hasError}
          />
        );

      case 'radio':
        return (
          <div>
            {field.options?.map(option => (
              <Form.Check
                key={option.value}
                type="radio"
                name={field.name}
                label={option.label}
                value={option.value}
                checked={formData[field.name] === option.value}
                onChange={handleChange}
                disabled={field.disabled || loading}
                className="mb-2"
              />
            ))}
          </div>
        );

      default:
        return (
          <Form.Control
            type={field.type}
            name={field.name}
            value={formData[field.name] || ''}
            onChange={handleChange}
            onBlur={() => handleBlur(field.name)}
            placeholder={field.placeholder}
            isInvalid={!!hasError}
            disabled={field.disabled || loading}
            min={field.min}
            max={field.max}
            step={field.step}
            className="shadow-sm"
          />
        );
    }
  };

  return (
    <Form onSubmit={handleSubmit} className={`p-2 ${className}`}>
      <Row className="g-3">
        {fields.map(field => {
          // Si es checkbox, no mostrar el label arriba
          const isCheckbox = field.type === 'checkbox';
          const colSize = field.cols || 12;

          return (
            <Col key={field.name} xs={12} md={colSize}>
              <Form.Group className="mb-3">
                {!isCheckbox && (
                  <Form.Label className="fw-semibold">
                    {field.label}
                    {field.required && <span className="text-danger ms-1">*</span>}
                  </Form.Label>
                )}
                
                {renderField(field)}
                
                {touched[field.name] && errors[field.name] && (
                  <Form.Control.Feedback type="invalid" className="d-block">
                    {errors[field.name]}
                  </Form.Control.Feedback>
                )}
                
                {field.helpText && !errors[field.name] && (
                  <Form.Text className="text-muted">
                    {field.helpText}
                  </Form.Text>
                )}
              </Form.Group>
            </Col>
          );
        })}
      </Row>

      {/* Mensaje de error general */}
      {Object.keys(errors).length > 0 && Object.keys(touched).length > 0 && (
        <Alert variant="danger" className="mb-3">
          <small>Por favor, corrige los errores antes de continuar.</small>
        </Alert>
      )}

      {/* Botones de acción */}
      <div className={`d-flex gap-2 ${variant === 'inline' ? 'justify-content-end' : 'justify-content-start'} mt-4`}>
        <Button
          type="submit"
          variant="success"
          disabled={loading}
          className="d-flex align-items-center gap-2 px-4"
        >
          {loading ? (
            <>
              <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
              Guardando...
            </>
          ) : (
            <>
              <Save size={18} />
              {submitLabel}
            </>
          )}
        </Button>

        {showReset && (
          <Button
            type="button"
            variant="outline-secondary"
            onClick={handleReset}
            disabled={loading}
            className="d-flex align-items-center gap-2 px-4"
          >
            <RefreshCw size={18} />
            {resetLabel}
          </Button>
        )}

        {onCancel && (
          <Button
            type="button"
            variant="outline-danger"
            onClick={onCancel}
            disabled={loading}
            className="d-flex align-items-center gap-2 px-4"
          >
            <X size={18} />
            {cancelLabel}
          </Button>
        )}
      </div>
    </Form>
  );
};

export default GenericForm;