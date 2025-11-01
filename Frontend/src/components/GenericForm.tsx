import React, { useState } from 'react';
import { Form, Button, Row, Col, Alert } from 'react-bootstrap';
import { Save, X, RefreshCw } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
// Material UI imports
import {
  TextField,
  Button as MuiButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  Checkbox,
  FormControlLabel,
  Radio,
  RadioGroup,
  Grid,
  Alert as MuiAlert,
  Box,
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import CloseIcon from '@mui/icons-material/Close';
import RefreshIcon from '@mui/icons-material/Refresh';

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
  const { designLibrary } = useTheme();
  
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
    
    // Estilos personalizados para inputs en tema Bootstrap (VERDE)
    const inputStyle = {
      border: '2px solid #6ee7b7',
      borderRadius: '8px',
      padding: '10px 14px',
      fontSize: '0.95rem',
      fontWeight: '500',
      color: '#047857',
      backgroundColor: '#ffffff',
      transition: 'all 0.3s ease'
    };

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
            style={inputStyle}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = '#10b981';
              e.currentTarget.style.boxShadow = '0 0 0 3px rgba(16, 185, 129, 0.2)';
            }}
            onBlur={(e) => {
              handleBlur(field.name);
              e.currentTarget.style.borderColor = '#6ee7b7';
              e.currentTarget.style.boxShadow = 'none';
            }}
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
            style={inputStyle}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = '#10b981';
              e.currentTarget.style.boxShadow = '0 0 0 3px rgba(16, 185, 129, 0.2)';
            }}
            onBlur={(e) => {
              handleBlur(field.name);
              e.currentTarget.style.borderColor = '#6ee7b7';
              e.currentTarget.style.boxShadow = 'none';
            }}
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
            style={{
              fontSize: '1rem',
              fontWeight: '600',
              color: '#047857'
            }}
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
                style={{
                  fontSize: '1rem',
                  fontWeight: '600',
                  color: '#047857'
                }}
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
            style={inputStyle}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = '#10b981';
              e.currentTarget.style.boxShadow = '0 0 0 3px rgba(16, 185, 129, 0.2)';
              e.currentTarget.style.backgroundColor = '#f0fdf4';
            }}
            onBlur={(e) => {
              handleBlur(field.name);
              e.currentTarget.style.borderColor = '#6ee7b7';
              e.currentTarget.style.boxShadow = 'none';
              e.currentTarget.style.backgroundColor = '#ffffff';
            }}
          />
        );
    }
  };

  // Renderizado Material UI
  if (designLibrary === 'material') {
    const renderMuiField = (field: FieldConfig) => {
      const hasError = touched[field.name] && !!errors[field.name];

      switch (field.type) {
        case 'select':
          return (
            <FormControl fullWidth error={hasError}>
              <InputLabel>{field.label}{field.required && ' *'}</InputLabel>
              <Select
                name={field.name}
                value={formData[field.name] || ''}
                onChange={(e) => handleChange(e as any)}
                onBlur={() => handleBlur(field.name)}
                disabled={field.disabled || loading}
                label={field.label + (field.required ? ' *' : '')}
              >
                <MenuItem value="">Seleccionar...</MenuItem>
                {field.options?.map(option => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
              {hasError && <FormHelperText>{errors[field.name]}</FormHelperText>}
              {!hasError && field.helpText && <FormHelperText>{field.helpText}</FormHelperText>}
            </FormControl>
          );

        case 'textarea':
          return (
            <TextField
              fullWidth
              multiline
              rows={field.rows || 3}
              name={field.name}
              label={field.label}
              value={formData[field.name] || ''}
              onChange={handleChange}
              onBlur={() => handleBlur(field.name)}
              placeholder={field.placeholder}
              error={hasError}
              helperText={hasError ? errors[field.name] : field.helpText}
              disabled={field.disabled || loading}
              required={field.required}
            />
          );

        case 'checkbox':
          return (
            <FormControlLabel
              control={
                <Checkbox
                  name={field.name}
                  checked={!!formData[field.name]}
                  onChange={handleChange}
                  disabled={field.disabled || loading}
                />
              }
              label={field.label + (field.required ? ' *' : '')}
            />
          );

        case 'radio':
          return (
            <FormControl component="fieldset" error={hasError}>
              <RadioGroup
                name={field.name}
                value={formData[field.name] || ''}
                onChange={handleChange}
              >
                {field.options?.map(option => (
                  <FormControlLabel
                    key={option.value}
                    value={option.value}
                    control={<Radio />}
                    label={option.label}
                    disabled={field.disabled || loading}
                  />
                ))}
              </RadioGroup>
              {hasError && <FormHelperText>{errors[field.name]}</FormHelperText>}
            </FormControl>
          );

        default:
          return (
            <TextField
              fullWidth
              type={field.type}
              name={field.name}
              label={field.label}
              value={formData[field.name] || ''}
              onChange={handleChange}
              onBlur={() => handleBlur(field.name)}
              placeholder={field.placeholder}
              error={hasError}
              helperText={hasError ? errors[field.name] : field.helpText}
              disabled={field.disabled || loading}
              required={field.required}
              inputProps={{
                min: field.min,
                max: field.max,
                step: field.step,
              }}
            />
          );
      }
    };

    return (
      <Box 
        component="form" 
        onSubmit={handleSubmit} 
        className={className} 
        sx={{ 
          p: 4,
          background: 'linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)',
          borderRadius: '16px',
          border: '3px solid #1976d2',
          boxShadow: '0 8px 24px rgba(25, 118, 210, 0.3)',
          fontFamily: '"Roboto", sans-serif'
        }}
      >
        <Grid container spacing={3}>
          {fields.map(field => (
            <Grid item xs={12} md={field.cols || 12} key={field.name}>
              <div style={{ 
                backgroundColor: '#ffffff', 
                padding: '8px', 
                borderRadius: '8px',
                border: '2px solid #90caf9'
              }}>
                {renderMuiField(field)}
              </div>
            </Grid>
          ))}
        </Grid>

        {Object.keys(errors).length > 0 && Object.keys(touched).length > 0 && (
          <MuiAlert 
            severity="error" 
            sx={{ 
              mt: 3,
              backgroundColor: '#1976d2',
              color: '#ffffff',
              fontWeight: 600,
              '& .MuiAlert-icon': { color: '#ffffff' }
            }}
          >
            Por favor, corrige los errores antes de continuar.
          </MuiAlert>
        )}

        <Box sx={{ display: 'flex', gap: 2, mt: 4, justifyContent: variant === 'inline' ? 'flex-end' : 'flex-start' }}>
          <MuiButton
            type="submit"
            variant="contained"
            disabled={loading}
            startIcon={loading ? undefined : <SaveIcon />}
            sx={{
              backgroundColor: '#1976d2',
              fontWeight: 700,
              fontSize: '1rem',
              px: 4,
              py: 1.5,
              borderRadius: '10px',
              textTransform: 'uppercase',
              letterSpacing: '1px',
              boxShadow: '0 4px 12px rgba(25, 118, 210, 0.4)',
              '&:hover': {
                backgroundColor: '#1565c0',
                transform: 'translateY(-2px)',
                boxShadow: '0 6px 16px rgba(25, 118, 210, 0.5)',
              },
              transition: 'all 0.3s ease'
            }}
          >
            {loading ? 'Guardando...' : submitLabel}
          </MuiButton>

          {showReset && (
            <MuiButton
              type="button"
              variant="outlined"
              onClick={handleReset}
              disabled={loading}
              startIcon={<RefreshIcon />}
              sx={{
                borderColor: '#1976d2',
                color: '#1976d2',
                fontWeight: 700,
                fontSize: '1rem',
                px: 4,
                py: 1.5,
                borderRadius: '10px',
                borderWidth: '2px',
                textTransform: 'uppercase',
                '&:hover': {
                  backgroundColor: '#e3f2fd',
                  borderWidth: '2px',
                  borderColor: '#1565c0'
                }
              }}
            >
              {resetLabel}
            </MuiButton>
          )}

          {onCancel && (
            <MuiButton
              type="button"
              variant="outlined"
              onClick={onCancel}
              disabled={loading}
              startIcon={<CloseIcon />}
              sx={{
                borderColor: '#0d47a1',
                color: '#0d47a1',
                fontWeight: 700,
                fontSize: '1rem',
                px: 4,
                py: 1.5,
                borderRadius: '10px',
                borderWidth: '2px',
                textTransform: 'uppercase',
                '&:hover': {
                  backgroundColor: '#e3f2fd',
                  borderWidth: '2px',
                  borderColor: '#0d47a1'
                }
              }}
            >
              {cancelLabel}
            </MuiButton>
          )}
        </Box>
      </Box>
    );
  }

  // Renderizado Tailwind (AMARILLO/ÁMBAR)
  if (designLibrary === 'tailwind') {
    return (
      <div className="w-full">
        <form 
          onSubmit={handleSubmit} 
          className={`p-6 rounded-2xl border-4 border-amber-500 shadow-2xl ${className}`}
          style={{
            background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
            fontFamily: '"Inter", "Poppins", sans-serif'
          }}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {fields.map(field => {
              const hasError = touched[field.name] && errors[field.name];
              const colSpan = field.cols === 12 || field.type === 'textarea' ? 'md:col-span-2' : '';

              return (
                <div key={field.name} className={`${colSpan}`}>
                  {field.type !== 'checkbox' && (
                    <label 
                      htmlFor={field.name}
                      className="block text-amber-900 font-bold text-sm uppercase tracking-wide mb-2"
                      style={{ fontFamily: '"Poppins", sans-serif' }}
                    >
                      {field.label}
                      {field.required && <span className="text-red-600 ml-1">*</span>}
                    </label>
                  )}

                  {/* SELECT */}
                  {field.type === 'select' && (
                    <select
                      id={field.name}
                      name={field.name}
                      value={formData[field.name] || ''}
                      onChange={handleChange}
                      onBlur={() => handleBlur(field.name)}
                      disabled={field.disabled || loading}
                      className={`w-full px-4 py-3 rounded-lg border-3 border-amber-400 bg-white text-amber-900 font-semibold 
                        focus:border-amber-600 focus:ring-4 focus:ring-amber-300 focus:outline-none
                        disabled:bg-gray-100 disabled:cursor-not-allowed transition-all duration-300
                        ${hasError ? 'border-red-500 focus:border-red-500 focus:ring-red-300' : ''}`}
                    >
                      <option value="">Seleccionar...</option>
                      {field.options?.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  )}

                  {/* TEXTAREA */}
                  {field.type === 'textarea' && (
                    <textarea
                      id={field.name}
                      name={field.name}
                      value={formData[field.name] || ''}
                      onChange={handleChange}
                      onBlur={() => handleBlur(field.name)}
                      placeholder={field.placeholder}
                      disabled={field.disabled || loading}
                      rows={field.rows || 3}
                      className={`w-full px-4 py-3 rounded-lg border-3 border-amber-400 bg-white text-amber-900 font-semibold 
                        focus:border-amber-600 focus:ring-4 focus:ring-amber-300 focus:outline-none resize-y
                        disabled:bg-gray-100 disabled:cursor-not-allowed transition-all duration-300
                        ${hasError ? 'border-red-500 focus:border-red-500 focus:ring-red-300' : ''}`}
                    />
                  )}

                  {/* CHECKBOX */}
                  {field.type === 'checkbox' && (
                    <div className="flex items-center mt-2">
                      <input
                        type="checkbox"
                        id={field.name}
                        name={field.name}
                        checked={!!formData[field.name]}
                        onChange={handleChange}
                        disabled={field.disabled || loading}
                        className="w-5 h-5 text-amber-600 border-3 border-amber-400 rounded focus:ring-4 focus:ring-amber-300 transition-all"
                      />
                      <label 
                        htmlFor={field.name}
                        className="ml-3 text-amber-900 font-bold uppercase tracking-wide"
                      >
                        {field.label}
                        {field.required && <span className="text-red-600 ml-1">*</span>}
                      </label>
                    </div>
                  )}

                  {/* RADIO */}
                  {field.type === 'radio' && (
                    <div className="space-y-2">
                      {field.options?.map(option => (
                        <div key={option.value} className="flex items-center">
                          <input
                            type="radio"
                            id={`${field.name}-${option.value}`}
                            name={field.name}
                            value={option.value}
                            checked={formData[field.name] === option.value}
                            onChange={handleChange}
                            disabled={field.disabled || loading}
                            className="w-5 h-5 text-amber-600 border-3 border-amber-400 focus:ring-4 focus:ring-amber-300 transition-all"
                          />
                          <label 
                            htmlFor={`${field.name}-${option.value}`}
                            className="ml-3 text-amber-900 font-bold"
                          >
                            {option.label}
                          </label>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* TEXT INPUTS (default) */}
                  {!['select', 'textarea', 'checkbox', 'radio'].includes(field.type) && (
                    <input
                      type={field.type}
                      id={field.name}
                      name={field.name}
                      value={formData[field.name] || ''}
                      onChange={handleChange}
                      onBlur={() => handleBlur(field.name)}
                      placeholder={field.placeholder}
                      disabled={field.disabled || loading}
                      min={field.min}
                      max={field.max}
                      step={field.step}
                      className={`w-full px-4 py-3 rounded-lg border-3 border-amber-400 bg-white text-amber-900 font-semibold 
                        focus:border-amber-600 focus:ring-4 focus:ring-amber-300 focus:outline-none placeholder-amber-400
                        disabled:bg-gray-100 disabled:cursor-not-allowed transition-all duration-300
                        ${hasError ? 'border-red-500 focus:border-red-500 focus:ring-red-300' : ''}`}
                    />
                  )}

                  {/* ERROR MESSAGE */}
                  {hasError && (
                    <div className="mt-2 text-red-600 text-sm font-bold bg-red-50 px-3 py-2 rounded-lg border-2 border-red-300">
                      {errors[field.name]}
                    </div>
                  )}

                  {/* HELP TEXT */}
                  {field.helpText && !hasError && (
                    <div className="mt-2 text-amber-700 text-xs font-semibold italic">
                      {field.helpText}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* ALERT ERROR GENERAL */}
          {Object.keys(errors).length > 0 && (
            <div className="mt-6 p-4 bg-red-50 border-3 border-red-400 rounded-xl">
              <div className="flex items-center">
                <svg className="w-6 h-6 text-red-600 mr-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <p className="text-red-800 font-bold uppercase tracking-wide">
                  Por favor corrige los errores antes de continuar
                </p>
              </div>
            </div>
          )}

          {/* BOTONES */}
          <div className="flex flex-wrap gap-4 mt-6 justify-end">
            {showReset && (
              <button
                type="button"
                onClick={handleReset}
                disabled={loading}
                className="px-6 py-3 bg-gradient-to-r from-gray-500 to-gray-600 text-white font-bold uppercase tracking-wider 
                  rounded-xl border-3 border-gray-700 shadow-lg hover:shadow-2xl hover:scale-105 
                  disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
              >
                <RefreshCw className="inline-block w-5 h-5 mr-2" />
                {resetLabel}
              </button>
            )}

            <button
              type="submit"
              disabled={loading || Object.keys(errors).length > 0}
              className="px-6 py-3 bg-gradient-to-r from-amber-500 to-yellow-600 text-white font-black uppercase tracking-wider 
                rounded-xl border-3 border-amber-700 shadow-lg hover:shadow-2xl hover:scale-105 
                disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
            >
              <Save className="inline-block w-5 h-5 mr-2" />
              {loading ? 'Guardando...' : submitLabel}
            </button>

            {onCancel && (
              <button
                type="button"
                onClick={onCancel}
                disabled={loading}
                className="px-6 py-3 bg-transparent border-3 border-amber-600 text-amber-900 font-black uppercase tracking-wider 
                  rounded-xl shadow-lg hover:bg-amber-100 hover:shadow-2xl hover:scale-105 
                  disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
              >
                <X className="inline-block w-5 h-5 mr-2" />
                {cancelLabel}
              </button>
            )}
          </div>
        </form>
      </div>
    );
  }

  // Renderizado Bootstrap (VERDE/EMERALD)
  return (
    <Form 
      onSubmit={handleSubmit} 
      className={`p-4 ${className}`}
      style={{
        background: 'linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)',
        borderRadius: '14px',
        border: '3px solid #10b981',
        boxShadow: '0 8px 24px rgba(16, 185, 129, 0.3)',
        fontFamily: '"Segoe UI", sans-serif'
      }}
    >
      <Row className="g-3">
        {fields.map(field => {
          // Si es checkbox, no mostrar el label arriba
          const isCheckbox = field.type === 'checkbox';
          const colSize = field.cols || 12;

          return (
            <Col key={field.name} xs={12} md={colSize}>
              <Form.Group 
                className="mb-3"
                style={{
                  backgroundColor: '#ffffff',
                  padding: '12px',
                  borderRadius: '10px',
                  border: '2px solid #6ee7b7'
                }}
              >
                {!isCheckbox && (
                  <Form.Label 
                    className="fw-bold"
                    style={{
                      color: '#047857',
                      fontSize: '1rem',
                      letterSpacing: '0.5px',
                      fontFamily: '"Arial", sans-serif'
                    }}
                  >
                    {field.label}
                    {field.required && <span className="ms-1" style={{ color: '#10b981' }}>*</span>}
                  </Form.Label>
                )}
                
                <div style={{ position: 'relative' }}>
                  {renderField(field)}
                </div>
                
                {touched[field.name] && errors[field.name] && (
                  <Form.Control.Feedback 
                    type="invalid" 
                    className="d-block"
                    style={{
                      backgroundColor: '#10b981',
                      color: '#ffffff',
                      padding: '6px 10px',
                      borderRadius: '6px',
                      marginTop: '8px',
                      fontWeight: '600'
                    }}
                  >
                    {errors[field.name]}
                  </Form.Control.Feedback>
                )}
                
                {field.helpText && !errors[field.name] && (
                  <Form.Text 
                    style={{
                      color: '#059669',
                      fontWeight: '500',
                      fontSize: '0.85rem'
                    }}
                  >
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
        <Alert 
          variant="success" 
          className="mb-3"
          style={{
            backgroundColor: '#10b981',
            color: '#ffffff',
            border: '2px solid #059669',
            fontWeight: '700',
            borderRadius: '10px'
          }}
        >
          <small>Por favor, corrige los errores antes de continuar.</small>
        </Alert>
      )}

      {/* Botones de acción */}
      <div className={`d-flex gap-3 ${variant === 'inline' ? 'justify-content-end' : 'justify-content-start'} mt-4`}>
        <Button
          type="submit"
          disabled={loading}
          className="d-flex align-items-center gap-2 px-5"
          style={{
            backgroundColor: '#10b981',
            border: 'none',
            fontWeight: '700',
            fontSize: '1rem',
            padding: '12px 24px',
            borderRadius: '10px',
            textTransform: 'uppercase',
            letterSpacing: '1px',
            boxShadow: '0 4px 12px rgba(16, 185, 129, 0.4)',
            transition: 'all 0.3s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#059669';
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 6px 16px rgba(16, 185, 129, 0.5)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#10b981';
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(16, 185, 129, 0.4)';
          }}
        >
          {loading ? (
            <>
              <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
              Guardando...
            </>
          ) : (
            <>
              <Save size={20} />
              {submitLabel}
            </>
          )}
        </Button>

        {showReset && (
          <Button
            type="button"
            onClick={handleReset}
            disabled={loading}
            className="d-flex align-items-center gap-2 px-5"
            style={{
              backgroundColor: 'transparent',
              border: '2px solid #10b981',
              color: '#10b981',
              fontWeight: '700',
              fontSize: '1rem',
              padding: '12px 24px',
              borderRadius: '10px',
              textTransform: 'uppercase',
              letterSpacing: '1px',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#d1fae5';
              e.currentTarget.style.borderColor = '#059669';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.borderColor = '#10b981';
            }}
          >
            <RefreshCw size={20} />
            {resetLabel}
          </Button>
        )}

        {onCancel && (
          <Button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="d-flex align-items-center gap-2 px-5"
            style={{
              backgroundColor: 'transparent',
              border: '2px solid #047857',
              color: '#047857',
              fontWeight: '700',
              fontSize: '1rem',
              padding: '12px 24px',
              borderRadius: '10px',
              textTransform: 'uppercase',
              letterSpacing: '1px',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#d1fae5';
              e.currentTarget.style.borderColor = '#065f46';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.borderColor = '#047857';
            }}
          >
            <X size={20} />
            {cancelLabel}
          </Button>
        )}
      </div>
    </Form>
  );
};

export default GenericForm;