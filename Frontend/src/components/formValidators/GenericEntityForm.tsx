import React from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import Swal from 'sweetalert2';

type FieldType = 'text' | 'select' | 'textarea' | 'number' | 'checkbox';

export interface FieldDef {
  name: string;
  label: string;
  type?: FieldType;
  readOnly?: boolean;
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
            <div key={f.name} className="mb-4">
              <label className="block text-sm font-medium text-body dark:text-bodydark1 mb-2" htmlFor={f.name}>
                {f.label}
              </label>

              {f.readOnly ? (
                // read-only field as disabled input
                <Field
                  id={f.name}
                  name={f.name}
                  className="block w-full rounded-md border border-stroke bg-white py-2 px-3 text-sm text-body disabled:opacity-60"
                  placeholder={f.placeholder}
                  disabled
                />
              ) : f.type === 'textarea' ? (
                <Field
                  as="textarea"
                  id={f.name}
                  name={f.name}
                  className="block w-full rounded-md border border-stroke bg-white py-2 px-3 text-sm text-body"
                  placeholder={f.placeholder}
                />
              ) : f.type === 'select' ? (
                <Field
                  as="select"
                  id={f.name}
                  name={f.name}
                  className="block w-full rounded-md border border-stroke bg-white py-2 px-3 text-sm text-body"
                >
                  <option value="">-- Seleccione --</option>
                  {(f.options || []).map((o) => (
                    <option key={String(o.value)} value={o.value}>{o.label}</option>
                  ))}
                </Field>
              ) : f.type === 'checkbox' ? (
                <div className="flex items-center gap-2">
                  <Field className="h-4 w-4 text-primary border border-stroke rounded" type="checkbox" id={f.name} name={f.name} />
                  <label className="text-sm text-body" htmlFor={f.name}>{f.placeholder || f.label}</label>
                </div>
              ) : (
                <Field
                  id={f.name}
                  name={f.name}
                  className="block w-full rounded-md border border-stroke bg-white py-2 px-3 text-sm text-body"
                  placeholder={f.placeholder}
                />
              )}

              <ErrorMessage name={f.name} component="div" className="text-sm text-red-600 mt-1" />
            </div>
          ))}

          <div className="flex justify-end gap-2">
            <button
              type="submit"
              className="inline-flex items-center px-4 py-2 bg-primary text-white rounded-md hover:opacity-95 disabled:opacity-60"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2" aria-hidden="true" />
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
