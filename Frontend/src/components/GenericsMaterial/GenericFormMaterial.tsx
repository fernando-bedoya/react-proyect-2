import React from 'react';
import { Formik, FormikHelpers } from 'formik';
import * as yup from 'yup';
import {
  Box,
  Paper,
  TextField,
  Button,
  MenuItem,
  Typography,
  Switch,
  FormControlLabel,
  Checkbox,
  Autocomplete,
  CircularProgress,
  Alert,
  FormHelperText,
  Avatar,
  Fade,
  Zoom,
  Collapse,
  IconButton,
  Tooltip,
  Chip,
  alpha,
} from '@mui/material';
import { amber, grey } from '@mui/material/colors';
import SaveIcon from '@mui/icons-material/Save';
import CloseIcon from '@mui/icons-material/Close';
import CategoryIcon from '@mui/icons-material/Category';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';

// --- Types ------------------------------------------------------------------
type FieldType =
  | 'text'
  | 'email'
  | 'password'
  | 'number'
  | 'select'
  | 'multiselect'
  | 'checkbox'
  | 'switch'
  | 'autocomplete'
  | 'textarea';

export type FieldOption = { label: string; value: any };

export type FieldSchema = {
  name: string;
  label?: string;
  type?: FieldType;
  options?: FieldOption[];
  required?: boolean;
  placeholder?: string;
  multiline?: boolean;
  rows?: number;
  cols?: number;
  defaultValue?: any;
  helperText?: string;
  icon?: React.ReactNode;
};

export interface GenericFormProps<T> {
  mode?: 'create' | 'edit';
  initialValues: Partial<T>;
  fields: FieldSchema[];
  onSubmit: (values: any, helpers?: FormikHelpers<any>) => Promise<void> | void;
  onCancel?: () => void;
  submitLabel?: string;
  loading?: boolean;
  title?: string;
  subtitle?: string;
}

// --- Design Tokens ---------------------------------------------------------
const DESIGN_TOKENS = {
  colors: {
    primary: {
      main: amber[600],
      light: amber[400],
      dark: amber[800],
      ultraLight: alpha(amber[500], 0.08),
    },
    background: {
      paper: alpha(amber[50], 0.4),
      elevated: '#FAFBFC',
      input: alpha(amber[50], 0.3),
    },
    text: {
      primary: '#0F172A',
      secondary: '#475569',
      disabled: '#94A3B8',
    },
    border: {
      light: alpha('#E2E8F0', 0.8),
      medium: alpha('#CBD5E1', 0.6),
    },
    status: {
      error: '#DC2626',
      errorBg: alpha('#FEE2E2', 0.95),
      success: '#059669',
      successBg: alpha('#D1FAE5', 0.95),
    },
  },
  spacing: {
    xs: 1,
    sm: 2,
    md: 3,
    lg: 4,
    xl: 6,
  },
  borderRadius: {
    sm: 1.5,
    md: 2,
    lg: 3,
    xl: 4,
  },
  shadows: {
    soft: '0 2px 8px rgba(15, 23, 42, 0.04), 0 1px 3px rgba(15, 23, 42, 0.02)',
    medium: '0 4px 16px rgba(15, 23, 42, 0.06), 0 2px 6px rgba(15, 23, 42, 0.03)',
    strong: '0 8px 32px rgba(15, 23, 42, 0.08), 0 4px 12px rgba(15, 23, 42, 0.04)',
    glow: `0 0 24px ${alpha(amber[500], 0.15)}, 0 8px 32px ${alpha(amber[500], 0.08)}`,
    button: '0 4px 12px rgba(251, 191, 36, 0.15), 0 2px 6px rgba(251, 191, 36, 0.08)',
  },
  transitions: {
    fast: '150ms cubic-bezier(0.4, 0, 0.2, 1)',
    medium: '250ms cubic-bezier(0.4, 0, 0.2, 1)',
    slow: '350ms cubic-bezier(0.4, 0, 0.2, 1)',
    bounce: '400ms cubic-bezier(0.34, 1.56, 0.64, 1)',
  },
};

// --- Component -------------------------------------------------------------
export default function GenericFormMaterial<T = any>(props: GenericFormProps<T>) {
  const {
    mode = 'create',
    initialValues,
    fields,
    onSubmit,
    onCancel,
    submitLabel,
    loading = false,
    title,
    subtitle,
  } = props;

  const [focusedField, setFocusedField] = React.useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = React.useState(false);

  // Build validation schema
  const shape: Record<string, any> = {};
  fields.forEach((f) => {
    const t = f.type ?? 'text';
    if (f.required) {
      if (t === 'email') shape[f.name] = yup.string().email('Email inválido').required('Campo requerido');
      else if (t === 'number') shape[f.name] = yup.number().typeError('Debe ser un número').required('Campo requerido');
      else if (t === 'multiselect') shape[f.name] = yup.array().min(1, 'Selecciona al menos una opción');
      else shape[f.name] = yup.string().required('Campo requerido');
    }
  });
  const validationSchema = yup.object().shape(shape);

  // Styles
  const paperSx = {
    p: { xs: 3, sm: 4, md: 5 },
    width: '100%',
    maxWidth: 900,
    mx: 'auto',
    borderRadius: DESIGN_TOKENS.borderRadius.lg,
    // Fondo amarillo clarito solicitado
    background: 'linear-gradient(135deg, #FFF9DB 0%, rgba(255,249,196,0.9) 100%)',
    boxShadow: DESIGN_TOKENS.shadows.strong,
    // Borde ámbar un poco más marcado para contraste con el fondo claro
    border: `3px solid ${amber[600]}`,
    position: 'relative',
    overflow: 'hidden',
    '&::before': {
      content: '""',
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      height: 4,
      background: `linear-gradient(90deg, ${DESIGN_TOKENS.colors.primary.light}, ${DESIGN_TOKENS.colors.primary.main}, ${DESIGN_TOKENS.colors.primary.dark})`,
      opacity: 0.9,
    },
  };

  const inputBaseSx = {
    '& .MuiInputLabel-root': {
      color: DESIGN_TOKENS.colors.text.secondary,
      fontWeight: 600,
      fontSize: '0.875rem',
      letterSpacing: '-0.01em',
      transform: 'translate(14px, 12px) scale(1)',
      '&.Mui-focused': {
        color: DESIGN_TOKENS.colors.primary.dark,
      },
      '&.MuiInputLabel-shrink': {
        transform: 'translate(14px, -9px) scale(0.75)',
      },
    },
    '& .MuiOutlinedInput-root': {
      borderRadius: DESIGN_TOKENS.borderRadius.md,
      backgroundColor: DESIGN_TOKENS.colors.background.input,
      transition: `all ${DESIGN_TOKENS.transitions.medium}`,
      '& .MuiInputBase-input': {
        fontWeight: 500,
        fontSize: '0.9375rem',
        padding: '11px 14px',
        color: DESIGN_TOKENS.colors.text.primary,
      },
      '& .MuiOutlinedInput-notchedOutline': {
        borderColor: DESIGN_TOKENS.colors.border.light,
        borderWidth: 1.5,
        transition: `all ${DESIGN_TOKENS.transitions.fast}`,
      },
      '&:hover': {
        backgroundColor: DESIGN_TOKENS.colors.background.paper,
        '& .MuiOutlinedInput-notchedOutline': {
          borderColor: DESIGN_TOKENS.colors.border.medium,
        },
      },
      '&.Mui-focused': {
        backgroundColor: DESIGN_TOKENS.colors.background.paper,
        boxShadow: `0 0 0 3px ${DESIGN_TOKENS.colors.primary.ultraLight}`,
        '& .MuiOutlinedInput-notchedOutline': {
          borderColor: DESIGN_TOKENS.colors.primary.main,
          borderWidth: 2,
        },
      },
      '&.Mui-error': {
        '& .MuiOutlinedInput-notchedOutline': {
          borderColor: DESIGN_TOKENS.colors.status.error,
        },
      },
    },
  };

  return (
    <Fade in timeout={400}>
      <Paper elevation={0} sx={paperSx}>
        {/* Header with animation */}
        <Zoom in timeout={500}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: 2.5,
              mb: 4,
              pb: 3,
              borderBottom: `1px solid ${DESIGN_TOKENS.colors.border.light}`,
            }}
          >
            <Avatar
              sx={{
                bgcolor: DESIGN_TOKENS.colors.primary.ultraLight,
                color: DESIGN_TOKENS.colors.primary.dark,
                width: 56,
                height: 56,
                boxShadow: DESIGN_TOKENS.shadows.soft,
                border: `2px solid ${alpha(DESIGN_TOKENS.colors.primary.main, 0.1)}`,
              }}
            >
              <CategoryIcon sx={{ fontSize: 28 }} />
            </Avatar>
            <Box sx={{ flex: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                <Typography
                  variant="h5"
                  sx={{
                    fontWeight: 700,
                    color: DESIGN_TOKENS.colors.text.primary,
                    letterSpacing: '-0.02em',
                    lineHeight: 1.3,
                  }}
                >
                  {title ?? (mode === 'create' ? 'Crear nuevo elemento' : 'Editar elemento')}
                </Typography>
                <Chip
                  size="small"
                  label={mode === 'create' ? 'Nuevo' : 'Edición'}
                  sx={{
                    height: 22,
                    fontWeight: 600,
                    fontSize: '0.7rem',
                    bgcolor: DESIGN_TOKENS.colors.primary.ultraLight,
                    color: DESIGN_TOKENS.colors.primary.dark,
                    border: `1px solid ${alpha(DESIGN_TOKENS.colors.primary.main, 0.15)}`,
                  }}
                />
              </Box>
              <Typography
                variant="body2"
                sx={{
                  color: DESIGN_TOKENS.colors.text.secondary,
                  lineHeight: 1.5,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.5,
                }}
              >
                <InfoOutlinedIcon sx={{ fontSize: 16, opacity: 0.7 }} />
                {subtitle ?? 'Completa los campos requeridos para continuar'}
              </Typography>
            </Box>
          </Box>
        </Zoom>

        <Formik
          initialValues={initialValues}
          enableReinitialize
          validationSchema={validationSchema}
          onSubmit={async (values, helpers) => {
            try {
              await onSubmit(values, helpers);
              setSubmitSuccess(true);
              setTimeout(() => setSubmitSuccess(false), 3000);
            } catch (error) {
              console.error('Submit error:', error);
            }
          }}
        >
          {(formik) => {
            const hasErrors = Object.keys(formik.errors).length > 0 && Object.keys(formik.touched).length > 0;
            const touchedCount = Object.keys(formik.touched).length;
            const errorCount = Object.keys(formik.errors).length;
            const fieldCount = fields.length;
            const progress = Math.round((touchedCount / fieldCount) * 100);

            return (
              <form onSubmit={formik.handleSubmit}>
                {/* Progress indicator */}
                {touchedCount > 0 && (
                  <Fade in>
                    <Box sx={{ mb: 3 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="caption" sx={{ color: DESIGN_TOKENS.colors.text.secondary, fontWeight: 600 }}>
                          Progreso del formulario
                        </Typography>
                        <Typography variant="caption" sx={{ color: DESIGN_TOKENS.colors.primary.dark, fontWeight: 700 }}>
                          {progress}%
                        </Typography>
                      </Box>
                      <Box
                        sx={{
                          height: 4,
                          bgcolor: DESIGN_TOKENS.colors.border.light,
                          borderRadius: 10,
                          overflow: 'hidden',
                        }}
                      >
                        <Box
                          sx={{
                            height: '100%',
                            width: `${progress}%`,
                            bgcolor: DESIGN_TOKENS.colors.primary.main,
                            transition: `width ${DESIGN_TOKENS.transitions.medium}`,
                            boxShadow: DESIGN_TOKENS.shadows.glow,
                          }}
                        />
                      </Box>
                    </Box>
                  </Fade>
                )}

                {/* Error Alert */}
                <Collapse in={hasErrors}>
                  <Alert
                    severity="error"
                    icon={<ErrorOutlineIcon />}
                    sx={{
                      mb: 3,
                      borderRadius: DESIGN_TOKENS.borderRadius.md,
                      bgcolor: DESIGN_TOKENS.colors.status.errorBg,
                      border: `1px solid ${alpha(DESIGN_TOKENS.colors.status.error, 0.2)}`,
                      '& .MuiAlert-icon': {
                        color: DESIGN_TOKENS.colors.status.error,
                      },
                      '& .MuiAlert-message': {
                        fontWeight: 600,
                        color: DESIGN_TOKENS.colors.status.error,
                      },
                    }}
                  >
                    {errorCount} {errorCount === 1 ? 'campo requiere' : 'campos requieren'} tu atención
                  </Alert>
                </Collapse>

                {/* Success Alert */}
                <Collapse in={submitSuccess}>
                  <Alert
                    severity="success"
                    icon={<CheckCircleOutlineIcon />}
                    sx={{
                      mb: 3,
                      borderRadius: DESIGN_TOKENS.borderRadius.md,
                      bgcolor: DESIGN_TOKENS.colors.status.successBg,
                      border: `1px solid ${alpha(DESIGN_TOKENS.colors.status.success, 0.2)}`,
                      '& .MuiAlert-icon': {
                        color: DESIGN_TOKENS.colors.status.success,
                      },
                    }}
                  >
                    ¡Formulario enviado exitosamente!
                  </Alert>
                </Collapse>

                {/* Fields Grid */}
                <Box
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' },
                    gap: 3,
                  }}
                >
                  {fields.map((field, index) => {
                    const name = field.name;
                    const type = field.type ?? 'text';
                    const value = (formik.values as any)[name];
                    const touched = (formik.touched as any)[name];
                    const error = (formik.errors as any)[name];
                    const isFocused = focusedField === name;

                    const fullWidthField = field.cols === 12 || type === 'textarea';
                    const wrapperSx = fullWidthField ? { gridColumn: '1 / -1' } : undefined;

                    const commonProps = {
                      fullWidth: true,
                      id: name,
                      name,
                      label: field.label ?? name,
                      placeholder: field.placeholder,
                      value: value ?? (type === 'multiselect' ? [] : ''),
                      onChange: formik.handleChange,
                      onBlur: (e: any) => {
                        formik.handleBlur(e);
                        setFocusedField(null);
                      },
                      onFocus: () => setFocusedField(name),
                      error: Boolean(touched && error),
                      sx: inputBaseSx,
                    };

                    // Textarea
                    if (type === 'textarea') {
                      return (
                        <Zoom in timeout={300 + index * 50} key={name}>
                          <Box sx={wrapperSx}>
                            <TextField
                              {...commonProps}
                              multiline
                              rows={field.rows ?? 4}
                              helperText={
                                touched && error ? error : field.helperText ? field.helperText : undefined
                              }
                              required={field.required}
                              disabled={loading}
                            />
                          </Box>
                        </Zoom>
                      );
                    }

                    // Select
                    if (type === 'select') {
                      return (
                        <Zoom in timeout={300 + index * 50} key={name}>
                          <Box sx={wrapperSx}>
                            <TextField
                              select
                              {...commonProps}
                              required={field.required}
                              disabled={loading}
                              helperText={
                                touched && error ? error : field.helperText ? field.helperText : undefined
                              }
                            >
                              <MenuItem value="" disabled>
                                <em>Seleccionar...</em>
                              </MenuItem>
                              {(field.options ?? []).map((o) => (
                                <MenuItem key={String(o.value)} value={o.value}>
                                  {o.label}
                                </MenuItem>
                              ))}
                            </TextField>
                          </Box>
                        </Zoom>
                      );
                    }

                    // Multiselect
                    if (type === 'multiselect') {
                      return (
                        <Zoom in timeout={300 + index * 50} key={name}>
                          <Box sx={wrapperSx}>
                            <Autocomplete
                              multiple
                              options={field.options ?? []}
                              getOptionLabel={(o) => String((o as FieldOption).label)}
                              value={(value ?? []) as any}
                              onChange={(_, v) => formik.setFieldValue(name, v)}
                              onBlur={() => {
                                formik.setFieldTouched(name, true);
                                setFocusedField(null);
                              }}
                              onFocus={() => setFocusedField(name)}
                              disabled={loading}
                              renderInput={(params) => (
                                <TextField
                                  {...params}
                                  label={field.label ?? name}
                                  placeholder={field.placeholder}
                                  error={Boolean(touched && error)}
                                  helperText={touched && error ? error : field.helperText}
                                  sx={inputBaseSx}
                                />
                              )}
                            />
                          </Box>
                        </Zoom>
                      );
                    }

                    // Autocomplete single
                    if (type === 'autocomplete') {
                      return (
                        <Zoom in timeout={300 + index * 50} key={name}>
                          <Box sx={wrapperSx}>
                            <Autocomplete
                              options={field.options ?? []}
                              getOptionLabel={(o) => String((o as FieldOption).label)}
                              value={value ?? null}
                              onChange={(_, v) => formik.setFieldValue(name, v)}
                              onBlur={() => {
                                formik.setFieldTouched(name, true);
                                setFocusedField(null);
                              }}
                              onFocus={() => setFocusedField(name)}
                              disabled={loading}
                              renderInput={(params) => (
                                <TextField
                                  {...params}
                                  label={field.label ?? name}
                                  placeholder={field.placeholder}
                                  sx={inputBaseSx}
                                />
                              )}
                            />
                          </Box>
                        </Zoom>
                      );
                    }

                    // Checkbox
                    if (type === 'checkbox') {
                      return (
                        <Zoom in timeout={300 + index * 50} key={name}>
                          <Box sx={wrapperSx}>
                            <Box
                              sx={{
                                p: 2,
                                borderRadius: DESIGN_TOKENS.borderRadius.md,
                                border: `1.5px solid ${
                                  touched && error
                                    ? DESIGN_TOKENS.colors.status.error
                                    : DESIGN_TOKENS.colors.border.light
                                }`,
                                bgcolor: isFocused
                                  ? DESIGN_TOKENS.colors.background.paper
                                  : DESIGN_TOKENS.colors.background.input,
                                transition: `all ${DESIGN_TOKENS.transitions.fast}`,
                                '&:hover': {
                                  bgcolor: DESIGN_TOKENS.colors.background.paper,
                                  borderColor: DESIGN_TOKENS.colors.border.medium,
                                },
                              }}
                            >
                              <FormControlLabel
                                control={
                                  <Checkbox
                                    name={name}
                                    checked={Boolean(value)}
                                    onChange={(e) => formik.setFieldValue(name, e.target.checked)}
                                    disabled={loading}
                                    sx={{
                                      color: DESIGN_TOKENS.colors.primary.main,
                                      '&.Mui-checked': {
                                        color: DESIGN_TOKENS.colors.primary.dark,
                                      },
                                    }}
                                  />
                                }
                                label={
                                  <Typography
                                    sx={{
                                      color: DESIGN_TOKENS.colors.text.primary,
                                      fontWeight: 600,
                                      fontSize: '0.9375rem',
                                    }}
                                  >
                                    {field.label}
                                  </Typography>
                                }
                              />
                              {field.helperText && (
                                <Typography
                                  variant="caption"
                                  sx={{
                                    display: 'block',
                                    mt: 0.5,
                                    ml: 4,
                                    color: DESIGN_TOKENS.colors.text.secondary,
                                  }}
                                >
                                  {field.helperText}
                                </Typography>
                              )}
                              {touched && error && (
                                <Typography
                                  variant="caption"
                                  sx={{
                                    display: 'block',
                                    mt: 1,
                                    ml: 4,
                                    color: DESIGN_TOKENS.colors.status.error,
                                    fontWeight: 600,
                                  }}
                                >
                                  {error}
                                </Typography>
                              )}
                            </Box>
                          </Box>
                        </Zoom>
                      );
                    }

                    // Switch
                    if (type === 'switch') {
                      return (
                        <Zoom in timeout={300 + index * 50} key={name}>
                          <Box sx={wrapperSx}>
                            <Box
                              sx={{
                                p: 2,
                                borderRadius: DESIGN_TOKENS.borderRadius.md,
                                border: `1.5px solid ${DESIGN_TOKENS.colors.border.light}`,
                                bgcolor: DESIGN_TOKENS.colors.background.input,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                transition: `all ${DESIGN_TOKENS.transitions.fast}`,
                                '&:hover': {
                                  bgcolor: DESIGN_TOKENS.colors.background.paper,
                                  borderColor: DESIGN_TOKENS.colors.border.medium,
                                },
                              }}
                            >
                              <Box>
                                <Typography
                                  sx={{
                                    color: DESIGN_TOKENS.colors.text.primary,
                                    fontWeight: 600,
                                    fontSize: '0.9375rem',
                                  }}
                                >
                                  {field.label}
                                </Typography>
                                {field.helperText && (
                                  <Typography
                                    variant="caption"
                                    sx={{
                                      display: 'block',
                                      mt: 0.5,
                                      color: DESIGN_TOKENS.colors.text.secondary,
                                    }}
                                  >
                                    {field.helperText}
                                  </Typography>
                                )}
                              </Box>
                              <Switch
                                name={name}
                                checked={Boolean(value)}
                                onChange={(e) => formik.setFieldValue(name, e.target.checked)}
                                disabled={loading}
                                sx={{
                                  '& .MuiSwitch-switchBase.Mui-checked': {
                                    color: DESIGN_TOKENS.colors.primary.main,
                                  },
                                  '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                                    backgroundColor: DESIGN_TOKENS.colors.primary.main,
                                  },
                                }}
                              />
                            </Box>
                          </Box>
                        </Zoom>
                      );
                    }

                    // Default: text/email/password/number
                    return (
                      <Zoom in timeout={300 + index * 50} key={name}>
                        <Box sx={wrapperSx}>
                          <TextField
                            {...commonProps}
                            type={
                              type === 'number' ? 'number' : type === 'password' ? 'password' : 'text'
                            }
                            multiline={field.multiline}
                            rows={field.rows}
                            required={field.required}
                            disabled={loading}
                            helperText={
                              touched && error ? error : field.helperText ? field.helperText : undefined
                            }
                          />
                        </Box>
                      </Zoom>
                    );
                  })}
                </Box>

                {/* Action Buttons */}
                <Box
                  sx={{
                    display: 'flex',
                    gap: 2,
                    justifyContent: 'flex-end',
                    mt: 4,
                    pt: 3,
                    borderTop: `1px solid ${DESIGN_TOKENS.colors.border.light}`,
                  }}
                >
                  {onCancel && (
                    <Button
                      type="button"
                      onClick={onCancel}
                      disabled={loading}
                      startIcon={<CloseIcon />}
                      sx={{
                        px: 4,
                        py: 1.25,
                        borderRadius: DESIGN_TOKENS.borderRadius.md,
                        textTransform: 'none',
                        fontWeight: 600,
                        fontSize: '0.9375rem',
                        color: DESIGN_TOKENS.colors.text.secondary,
                        border: `1.5px solid ${DESIGN_TOKENS.colors.border.light}`,
                        bgcolor: 'transparent',
                        transition: `all ${DESIGN_TOKENS.transitions.fast}`,
                        '&:hover': {
                          bgcolor: alpha(grey[500], 0.05),
                          borderColor: DESIGN_TOKENS.colors.border.medium,
                          transform: 'translateY(-1px)',
                        },
                      }}
                    >
                      Cancelar
                    </Button>
                  )}

                  <Button
                    type="submit"
                    variant="contained"
                    disabled={loading}
                    startIcon={loading ? undefined : <SaveIcon />}
                    sx={{
                      px: 5,
                      py: 1.25,
                      borderRadius: DESIGN_TOKENS.borderRadius.md,
                      textTransform: 'none',
                      fontWeight: 700,
                      fontSize: '0.9375rem',
                      background: `linear-gradient(135deg, ${DESIGN_TOKENS.colors.primary.light} 0%, ${DESIGN_TOKENS.colors.primary.main} 50%, ${DESIGN_TOKENS.colors.primary.dark} 100%)`,
                      backgroundSize: '200% 200%',
                      color: DESIGN_TOKENS.colors.text.primary,
                      boxShadow: DESIGN_TOKENS.shadows.button,
                      position: 'relative',
                      overflow: 'hidden',
                      transition: `all ${DESIGN_TOKENS.transitions.medium}`,
                      '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        background: `linear-gradient(135deg, transparent, ${alpha('#fff', 0.1)}, transparent)`,
                        transform: 'translateX(-100%)',
                        transition: `transform ${DESIGN_TOKENS.transitions.slow}`,
                      },
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: `0 8px 24px ${alpha(DESIGN_TOKENS.colors.primary.main, 0.25)}`,
                        backgroundPosition: '100% 0',
                        '&::before': {
                          transform: 'translateX(100%)',
                        },
                      },
                      '&:active': {
                        transform: 'translateY(0)',
                      },
                      '&.Mui-disabled': {
                        background: alpha(DESIGN_TOKENS.colors.border.light, 0.5),
                        color: DESIGN_TOKENS.colors.text.disabled,
                      },
                    }}
                  >
                    {loading ? (
                      <CircularProgress size={20} sx={{ color: DESIGN_TOKENS.colors.text.primary }} />
                    ) : (
                      submitLabel ?? (mode === 'create' ? 'Crear elemento' : 'Guardar cambios')
                    )}
                  </Button>
                </Box>
              </form>
            );
          }}
        </Formik>

        {/* Decorative Elements */}
        <Box
          sx={{
            position: 'absolute',
            top: -100,
            right: -100,
            width: 300,
            height: 300,
            borderRadius: '50%',
            background: `radial-gradient(circle, ${alpha(DESIGN_TOKENS.colors.primary.light, 0.08)} 0%, transparent 70%)`,
            pointerEvents: 'none',
            animation: 'pulse 8s ease-in-out infinite',
            '@keyframes pulse': {
              '0%, 100%': { transform: 'scale(1)', opacity: 0.3 },
              '50%': { transform: 'scale(1.1)', opacity: 0.5 },
            },
          }}
        />
      </Paper>
    </Fade>
  );
}