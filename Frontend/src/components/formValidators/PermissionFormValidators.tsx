import React from "react";
import { Permission } from "../../models/Permission";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";

interface PermissionFormProps {
	mode: number; // 1 crear, 2 actualizar
	handleCreate?: (values: Omit<Permission, 'id' | 'created_at' | 'updated_at'>) => void;
	handleUpdate?: (values: Permission) => void;
	permission?: Permission | null;
}

const deriveEntityFromUrl = (url?: string) => {
	if (!url) return "";
	try {
		// eliminar query params y hash
		const clean = url.split('?')[0].split('#')[0];
		const parts = clean.split('/').filter(Boolean);
		// tomar el primer segmento que normalmente representa la colección
		return parts.length > 0 ? parts[0] : "";
	} catch (e) {
		return "";
	}
};

const PermissionFormValidators: React.FC<PermissionFormProps> = ({ mode, handleCreate, handleUpdate, permission }) => {
	const initial: Permission = permission ? permission : { id: undefined, url: '', method: 'GET', entity: '' };

	const handleSubmit = (values: Permission) => {
		// ensure entity is present (derive from url if empty)
		const final = { ...values, entity: values.entity && values.entity.trim() !== '' ? values.entity : deriveEntityFromUrl(values.url) } as Permission;

		if (mode === 1 && handleCreate) {
			const payload: Omit<Permission, 'id' | 'created_at' | 'updated_at'> = {
				url: final.url,
				method: final.method,
				entity: final.entity,
			};
			handleCreate(payload);
		} else if (mode === 2 && handleUpdate) {
			handleUpdate(final);
		} else {
			console.error('No function provided for the current mode');
		}
	};

	return (
		<Formik
			initialValues={initial}
			validationSchema={Yup.object({
				url: Yup.string().required('La URL es obligatoria'),
				method: Yup.string().required('El método es obligatorio'),
				entity: Yup.string().required('La entidad es obligatoria'),
			})}
			onSubmit={(values) => handleSubmit(values)}
			enableReinitialize
		>
			{({ handleSubmit }) => (
				<Form onSubmit={handleSubmit}>
					<div className="mb-3">
						<label htmlFor="url" className="form-label">URL</label>
						<Field name="url" className="form-control" />
						<ErrorMessage name="url" component="div" className="text-danger small" />
					</div>

					<div className="mb-3">
						<label htmlFor="method" className="form-label">Método</label>
						<Field as="select" name="method" className="form-select">
							<option value="GET">GET</option>
							<option value="POST">POST</option>
							<option value="PUT">PUT</option>
							<option value="DELETE">DELETE</option>
							<option value="PATCH">PATCH</option>
						</Field>
						<ErrorMessage name="method" component="div" className="text-danger small" />
					</div>

					<div className="mb-3">
						<label htmlFor="entity" className="form-label">Entidad</label>
						<Field name="entity" className="form-control" />
						<div className="form-text">Si se deja vacío será derivado desde la URL (ej. /users → users)</div>
						<ErrorMessage name="entity" component="div" className="text-danger small" />
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

export default PermissionFormValidators;
