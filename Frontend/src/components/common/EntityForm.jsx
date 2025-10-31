// EntityForm.jsx - Componente genérico para formularios dinámicos con Bootstrap
// Este componente genera formularios de forma dinámica basándose en una configuración de campos
// Sirve para crear, editar y validar entidades (usuarios, roles, permisos, etc.) sin duplicar código

import React, { useState, useEffect } from 'react';
import { Form, Button, Row, Col, Alert } from 'react-bootstrap';

/**
 * Componente genérico para crear formularios dinámicos
 * @param {Array} fields - Configuración de los campos del formulario
 * @param {Function} onSubmit - Callback que se ejecuta al enviar el formulario
 * @param {Object} initialValues - Valores iniciales del formulario (para edición)
 * @param {String} submitButtonText - Texto del botón de envío (opcional)
 * @param {Boolean} showCancelButton - Mostrar botón cancelar (opcional)
 * @param {Function} onCancel - Callback para cancelar (opcional)
 * @param {Boolean} isLoading - Estado de carga (opcional)
 */
const EntityForm = ({
  fields = [],
  onSubmit,
  initialValues = {},
  submitButtonText = 'Guardar',
  showCancelButton = false,
  onCancel,
  isLoading = false,
}) => {
  const [formData, setFormData] = useState({});
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [generalError, setGeneralError] = useState('');

  // Inicializar el formulario con valores iniciales o valores por defecto
  useEffect(() => {
    const initialData = {};
    fields.forEach((field) => {
      initialData[field.name] = initialValues[field.name] || field.defaultValue || '';
    });
    setFormData(initialData);
  }, [fields, initialValues]);

  /**
   * Valida un campo específico basándose en sus reglas de validación
   */
  const validateField = (field, value) => {
    const fieldErrors = [];

    // Validación requerida
    if (field.required && (!value || value.toString().trim() === '')) {
      fieldErrors.push(`${field.label} es requerido`);
    }

    // Validación de longitud mínima
    if (field.minLength && value && value.length < field.minLength) {
      fieldErrors.push(`${field.label} debe tener al menos ${field.minLength} caracteres`);
    }

    // Validación de longitud máxima
    if (field.maxLength && value && value.length > field.maxLength) {
      fieldErrors.push(`${field.label} no puede exceder ${field.maxLength} caracteres`);
    }

    // Validación de email
    if (field.type === 'email' && value) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) {
        fieldErrors.push('Email no válido');
      }
    }

    // Validación de número
    if (field.type === 'number' && value) {
      if (isNaN(value)) {
        fieldErrors.push(`${field.label} debe ser un número`);
      }
      if (field.min !== undefined && Number(value) < field.min) {
        fieldErrors.push(`${field.label} debe ser mayor o igual a ${field.min}`);
      }
      if (field.max !== undefined && Number(value) > field.max) {
        fieldErrors.push(`${field.label} debe ser menor o igual a ${field.max}`);
      }
    }

    // Validación personalizada
    if (field.validate && typeof field.validate === 'function') {
      const customError = field.validate(value, formData);
      if (customError) {
        fieldErrors.push(customError);
      }
    }

    // Validación de patrón (regex)
    if (field.pattern && value) {
      const regex = new RegExp(field.pattern);
      if (!regex.test(value)) {
        fieldErrors.push(field.patternMessage || `${field.label} no tiene el formato correcto`);
      }
    }

    return fieldErrors.length > 0 ? fieldErrors.join(', ') : null;
  };

  /**
   * Valida todos los campos del formulario
   */
  const validateForm = () => {
    const newErrors = {};
    let isValid = true;

    fields.forEach((field) => {
      const error = validateField(field, formData[field.name]);
      if (error) {
        newErrors[field.name] = error;
        isValid = false;
      }
    });

    setErrors(newErrors);
    return isValid;
  };

  /**
   * Maneja el cambio de valor en un campo
   */
  const handleChange = (e, field) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === 'checkbox' ? checked : value;

    setFormData((prev) => ({
      ...prev,
      [name]: newValue,
    }));

    // Validar el campo si ya fue tocado
    if (touched[name]) {
      const error = validateField(field, newValue);
      setErrors((prev) => ({
        ...prev,
        [name]: error,
      }));
    }

    // Limpiar error general
    if (generalError) {
      setGeneralError('');
    }
  };

  /**
   * Maneja cuando un campo pierde el foco
   */
  const handleBlur = (field) => {
    setTouched((prev) => ({
      ...prev,
      [field.name]: true,
    }));

    const error = validateField(field, formData[field.name]);
    setErrors((prev) => ({
      ...prev,
      [field.name]: error,
    }));
  };

  /**
   * Maneja el envío del formulario
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setGeneralError('');

    // Marcar todos los campos como tocados
    const allTouched = {};
    fields.forEach((field) => {
      allTouched[field.name] = true;
    });
    setTouched(allTouched);

    // Validar el formulario
    if (!validateForm()) {
      return;
    }

    try {
      await onSubmit(formData);
    } catch (error) {
      setGeneralError(error.message || 'Error al guardar los datos');
    }
  };

  /**
   * Renderiza un campo según su tipo
   */
  const renderField = (field) => {
    const hasError = touched[field.name] && errors[field.name];

    switch (field.type) {
      case 'select':
        return (
          <Form.Select
            name={field.name}
            value={formData[field.name] || ''}
            onChange={(e) => handleChange(e, field)}
            onBlur={() => handleBlur(field)}
            isInvalid={hasError}
            disabled={field.disabled || isLoading}
            required={field.required}
          >
            <option value="">Seleccione una opción</option>
            {field.options &&
              field.options.map((option) => (
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
            rows={field.rows || 3}
            value={formData[field.name] || ''}
            onChange={(e) => handleChange(e, field)}
            onBlur={() => handleBlur(field)}
            isInvalid={hasError}
            disabled={field.disabled || isLoading}
            placeholder={field.placeholder}
            required={field.required}
          />
        );

      case 'checkbox':
        return (
          <Form.Check
            type="checkbox"
            name={field.name}
            label={field.checkboxLabel || ''}
            checked={formData[field.name] || false}
            onChange={(e) => handleChange(e, field)}
            disabled={field.disabled || isLoading}
          />
        );

      case 'radio':
        return (
          <div>
            {field.options &&
              field.options.map((option) => (
                <Form.Check
                  key={option.value}
                  type="radio"
                  name={field.name}
                  label={option.label}
                  value={option.value}
                  checked={formData[field.name] === option.value}
                  onChange={(e) => handleChange(e, field)}
                  disabled={field.disabled || isLoading}
                />
              ))}
          </div>
        );

      default:
        return (
          <Form.Control
            type={field.type || 'text'}
            name={field.name}
            value={formData[field.name] || ''}
            onChange={(e) => handleChange(e, field)}
            onBlur={() => handleBlur(field)}
            isInvalid={hasError}
            disabled={field.disabled || isLoading}
            placeholder={field.placeholder}
            required={field.required}
            min={field.min}
            max={field.max}
            step={field.step}
          />
        );
    }
  };

  return (
    <Form onSubmit={handleSubmit} noValidate>
      {generalError && (
        <Alert variant="danger" dismissible onClose={() => setGeneralError('')}>
          {generalError}
        </Alert>
      )}

      <Row>
        {fields.map((field) => (
          <Col
            key={field.name}
            xs={12}
            md={field.colSize || 12}
            className="mb-3"
          >
            <Form.Group controlId={field.name}>
              {field.type !== 'checkbox' && (
                <Form.Label>
                  {field.label}
                  {field.required && <span className="text-danger"> *</span>}
                </Form.Label>
              )}

              {renderField(field)}

              {touched[field.name] && errors[field.name] && (
                <Form.Control.Feedback type="invalid" className="d-block">
                  {errors[field.name]}
                </Form.Control.Feedback>
              )}

              {field.helpText && (
                <Form.Text className="text-muted">
                  {field.helpText}
                </Form.Text>
              )}
            </Form.Group>
          </Col>
        ))}
      </Row>

      <div className="d-flex gap-2 justify-content-end mt-4">
        {showCancelButton && (
          <Button
            variant="secondary"
            onClick={onCancel}
            disabled={isLoading}
          >
            Cancelar
          </Button>
        )}
        <Button
          variant="primary"
          type="submit"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <span className="spinner-border spinner-border-sm me-2" />
              Guardando...
            </>
          ) : (
            submitButtonText
          )}
        </Button>
      </div>
    </Form>
  );
};

export default EntityForm;
