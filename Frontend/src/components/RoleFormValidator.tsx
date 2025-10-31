import React from "react";
import { Role } from "../models/Role";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";

interface RoleFormProps {
  mode: number; // 1 crear, 2 actualizar
  handleCreate?: (values: Role) => void;
  handleUpdate?: (values: Role) => void;
  role?: Role | null;
}

const RoleFormValidator: React.FC<RoleFormProps> = ({ mode, handleCreate, handleUpdate, role }) => {
  const handleSubmit = (values: Role) => {
    if (mode === 1 && handleCreate) {
      handleCreate(values);
    } else if (mode === 2 && handleUpdate) {
      handleUpdate(values);
    } else {
      console.error('No function provided for the current mode');
    }
  };

  return (
    <Formik
      initialValues={role ? role : { id: undefined, name: "", description: "" }}
      validationSchema={Yup.object({
        name: Yup.string().required("El nombre del rol es obligatorio"),
        description: Yup.string(),
      })}
      onSubmit={(values) => handleSubmit(values)}
    >
      {({ handleSubmit }) => (
        <Form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label htmlFor="name" className="form-label">Nombre</label>
            <Field name="name" className="form-control" />
            <ErrorMessage name="name" component="div" className="text-danger small" />
          </div>

          <div className="mb-3">
            <label htmlFor="description" className="form-label">Descripción</label>
            <Field as="textarea" name="description" className="form-control" rows={3} />
            <ErrorMessage name="description" component="div" className="text-danger small" />
          </div>

          <div className="d-flex justify-content-end gap-2">
            <button type="submit" className="btn btn-primary">
              {mode === 1 ? 'Crear' : 'Actualizar'}
            </button>
          </div>
        </Form>
      )}
    </Formik>
  );
};

export default RoleFormValidator;
