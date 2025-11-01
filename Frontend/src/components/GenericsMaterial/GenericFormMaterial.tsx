import { Formik, FormikHelpers } from "formik";
import * as yup from "yup";
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
} from "@mui/material";
import { amber } from "@mui/material/colors";

type FieldType =
  | "text"
  | "email"
  | "password"
  | "number"
  | "select"
  | "multiselect"
  | "checkbox"
  | "switch"
  | "autocomplete"
  | "textarea";

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
};

export interface GenericFormProps<T> {
  mode?: "create" | "edit";
  initialValues: Partial<T>;
  fields: FieldSchema[];
  onSubmit: (values: any, helpers?: FormikHelpers<any>) => Promise<void> | void;
  onCancel?: () => void;
  submitLabel?: string;
  loading?: boolean;
}

const amberMain = amber[600];

/**
 * Componente genérico de formulario usando Material UI y Formik.
 * - Soporta create/edit
 * - Campos configurables vía `fields`
 * - Paleta basada en tonos amarillos (amber)
 */
export default function GenericFormMaterial<T = any>(props: GenericFormProps<T>) {
  const {
    mode = "create",
    initialValues,
    fields,
    onSubmit,
    onCancel,
    submitLabel,
    loading = false,
  } = props;

  // Build a minimal validation schema from fields (required + email/number)
  const shape: Record<string, any> = {};
  fields.forEach((f) => {
    const t = f.type ?? "text";
    if (f.required) {
      if (t === "email") shape[f.name] = yup.string().email("Email inválido").required("Requerido");
      else if (t === "number") shape[f.name] = yup.number().typeError("Debe ser un número").required("Requerido");
      else if (t === "multiselect") shape[f.name] = yup.array().min(1, "Requerido");
      else shape[f.name] = yup.string().required("Requerido");
    }
  });

  const validationSchema = yup.object().shape(shape);

  return (
    <Paper elevation={1} sx={{ p: 2, width: "100%" }}>
      <Typography variant="h6" sx={{ color: amberMain, mb: 1 }}>
        {mode === "create" ? "Crear" : "Editar"}
      </Typography>

      <Formik
        initialValues={initialValues}
        enableReinitialize
        validationSchema={validationSchema}
        onSubmit={async (values, helpers) => {
          try {
            await onSubmit(values, helpers);
          } finally {
            // optionally keep helpers handling to caller
          }
        }}
      >
        {(formik) => (
          <form onSubmit={formik.handleSubmit}>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 16 }}>
              {fields.map((field) => {
                const name = field.name;
                const type = field.type ?? "text";
                const value = (formik.values as any)[name];

                const commonProps = {
                  fullWidth: true,
                  id: name,
                  name,
                  label: field.label ?? name,
                  placeholder: field.placeholder,
                  value: value ?? "",
                  onChange: formik.handleChange,
                  onBlur: formik.handleBlur,
                  error: Boolean((formik.touched as any)[name] && (formik.errors as any)[name]),
                  helperText: (formik.touched as any)[name] && (formik.errors as any)[name] ? (formik.errors as any)[name] : undefined,
                  sx: {
                    '& .MuiInputLabel-root': { color: amberMain },
                    '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: amberMain,
                    },
                  },
                } as any;

                if (type === "textarea") {
                  return (
                    <Box key={name} sx={{ width: { xs: '100%', sm: '100%' } }}>
                      <TextField {...commonProps} multiline rows={field.rows ?? 4} />
                    </Box>
                  );
                }

                if (type === "select") {
                  return (
                    <Box key={name} sx={{ width: { xs: '100%', sm: '100%' } }}>
                      <TextField select {...commonProps}>
                        {(field.options ?? []).map((o) => (
                          <MenuItem key={String(o.value)} value={o.value}>
                            {o.label}
                          </MenuItem>
                        ))}
                      </TextField>
                    </Box>
                  );
                }

                if (type === "multiselect") {
                  return (
                    <Box key={name} sx={{ width: { xs: '100%', sm: '100%' } }}>
                      <Autocomplete
                        multiple
                        options={field.options ?? []}
                        getOptionLabel={(o) => String((o as FieldOption).label)}
                        value={(value ?? []) as any}
                        onChange={(_, v) => formik.setFieldValue(name, v)}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            label={field.label ?? name}
                            placeholder={field.placeholder}
                            error={Boolean((formik.touched as any)[name] && (formik.errors as any)[name])}
                            helperText={(formik.touched as any)[name] && (formik.errors as any)[name] ? (formik.errors as any)[name] : undefined}
                              sx={{ '& .MuiInputLabel-root': { color: amberMain } }}
                          />
                        )}
                      />
                    </Box>
                  );
                }

                if (type === "autocomplete") {
                  return (
                    <Box key={name} sx={{ width: { xs: '100%', sm: '100%' } }}>
                      <Autocomplete
                        options={field.options ?? []}
                        getOptionLabel={(o) => String((o as FieldOption).label)}
                        value={value ?? null}
                        onChange={(_, v) => formik.setFieldValue(name, v)}
                        renderInput={(params) => (
                          <TextField {...params} label={field.label ?? name} placeholder={field.placeholder} sx={{ '& .MuiInputLabel-root': { color: amberMain } }} />
                        )}
                      />
                    </Box>
                  );
                }

                if (type === "checkbox") {
                  return (
                    <Box key={name} sx={{ width: { xs: '100%', sm: '100%' } }}>
                      <FormControlLabel
                        control={<Checkbox checked={Boolean(value)} onChange={(e) => formik.setFieldValue(name, e.target.checked)} />}
                        label={field.label ?? name}
                      />
                    </Box>
                  );
                }

                if (type === "switch") {
                  return (
                    <Box key={name} sx={{ width: { xs: '100%', sm: '100%' } }}>
                      <FormControlLabel
                        control={<Switch checked={Boolean(value)} onChange={(e) => formik.setFieldValue(name, e.target.checked)} color="warning" />}
                        label={field.label ?? name}
                      />
                    </Box>
                  );
                }

                // default: text/email/password/number
                return (
                  <Box key={name} sx={{ width: { xs: '100%', sm: '100%' } }}>
                    <TextField
                      {...commonProps}
                      type={type === "number" ? "number" : type === "password" ? "password" : "text"}
                      multiline={field.multiline}
                      rows={field.rows}
                    />
                  </Box>
                );
              })}
              <Box sx={{ gridColumn: '1 / -1', display: "flex", gap: 1, justifyContent: "flex-end", mt: 1 }}>
                {onCancel && (
                  <Button variant="outlined" color="inherit" onClick={onCancel} disabled={loading}>
                    Cancelar
                  </Button>
                )}

                <Button type="submit" variant="contained" sx={{ bgcolor: amberMain }} disabled={loading}>
                  {loading ? <CircularProgress size={20} color="inherit" /> : submitLabel ?? (mode === "create" ? "Crear" : "Guardar")}
                </Button>
              </Box>
            </Box>
          </form>
        )}
      </Formik>
    </Paper>
  );
}
