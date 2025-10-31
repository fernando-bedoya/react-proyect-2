import React from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import Swal from 'sweetalert2';

type FieldType = 'text' | 'select' | 'textarea' | 'number' | 'checkbox';

export interface FieldDef {
  name: string;
  label: string;
  type?: FieldType;
  required?: boolean;
  options?: Array<{ value: string | number; label: string }>; // for select
  placeholder?: string;
}

interface GenericEntityFormProps {
  mode: 1 | 2; // 1 create, 2 update
  fields: FieldDef[];
  initialValues?: { [key: string]: any } | null;
  onCreate?: (values: { [key: string]: any }) => Promise<any> | any;
  onUpdate?: (values: { [key: string]: any }) => Promise<any> | any;
  submitLabel?: string;
}

const buildValidationSchema = (fields: FieldDef[]) => {
  const shape: { [k: string]: any } = {};
  fields.forEach((f) => {
    if (f.required) {
      if (f.type === 'number') shape[f.name] = Yup.number().required(`${f.label} es obligatorio`);
      else if (f.type === 'checkbox') shape[f.name] = Yup.boolean().oneOf([true], `${f.label} es obligatorio`);
      else shape[f.name] = Yup.string().required(`${f.label} es obligatorio`);
    } else {
      if (f.type === 'number') shape[f.name] = Yup.number().nullable();
      else if (f.type === 'checkbox') shape[f.name] = Yup.boolean();
      else shape[f.name] = Yup.string().nullable();
    }
  });
  return Yup.object().shape(shape);
};

const GenericEntityForm: React.FC<GenericEntityFormProps> = ({ mode, fields, initialValues = null, onCreate, onUpdate, submitLabel }) => {
  const initial = initialValues ?? fields.reduce((acc, f) => ({ ...acc, [f.name]: f.type === 'checkbox' ? false : '' }), {} as any);
  const validationSchema = buildValidationSchema(fields);

  const submit = async (values: any, helpers: any) => {
    try {
      if (mode === 1) {
        if (!onCreate) throw new Error('onCreate handler not provided');
        const res = await onCreate(values);
        return res;
      } else {
        if (!onUpdate) throw new Error('onUpdate handler not provided');
        const res = await onUpdate(values);
        return res;
      }
    } catch (err: any) {
      console.error('Submit error', err);
      const message = err?.message || 'Error al procesar la petición';
      Swal.fire('Error', message, 'error');
      // propagate error to form
      helpers.setSubmitting(false);
      return null;
    }
  };

  return (
    <Formik initialValues={initial} enableReinitialize validationSchema={validationSchema} onSubmit={(v, h) => submit(v, h)}>
      {({ isSubmitting }) => (
        <Form>
          {fields.map((f) => (
            <div key={f.name} className="mb-3">
              <label className="form-label" htmlFor={f.name}>{f.label}</label>
              {f.type === 'textarea' ? (
                <Field as="textarea" id={f.name} name={f.name} className="form-control" placeholder={f.placeholder} />
              ) : f.type === 'select' ? (
                <Field as="select" id={f.name} name={f.name} className="form-select">
                  <option value="">-- Seleccione --</option>
                  {(f.options || []).map((o) => (
                    <option key={String(o.value)} value={o.value}>{o.label}</option>
                  ))}
                </Field>
              ) : f.type === 'checkbox' ? (
                <div className="form-check">
                  <Field className="form-check-input" type="checkbox" id={f.name} name={f.name} />
                  <label className="form-check-label" htmlFor={f.name}>{f.placeholder || f.label}</label>
                </div>
              ) : (
                <Field id={f.name} name={f.name} className="form-control" placeholder={f.placeholder} />
              )}
              <ErrorMessage name={f.name} component="div" className="text-danger small" />
            </div>
          ))}

          <div className="d-flex justify-content-end gap-2">
            <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true" />
                  {mode === 1 ? 'Creando...' : 'Actualizando...'}
                </>
              ) : (
                submitLabel ?? (mode === 1 ? 'Crear' : 'Actualizar')
              )}
            </button>
          </div>
        </Form>
      )}
    </Formik>
  );
};

export default GenericEntityForm;
