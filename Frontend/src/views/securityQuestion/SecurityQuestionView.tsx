/**
 * SecurityQuestionView - Gestión de Preguntas de Seguridad
 * 
 * BACKEND (ya implementado):
 * - GET    /api/security-questions/     -> Todas las preguntas
 * - POST   /api/security-questions/     -> Crear pregunta { name, description? }
 * - PUT    /api/security-questions/:id  -> Actualizar pregunta
 * - DELETE /api/security-questions/:id  -> Eliminar pregunta
 * 
 * MODELO:
 * - id: number
 * - name: string (texto de la pregunta) - REQUERIDO
 * - description: string (descripción opcional)
 * - created_at, updated_at
 */

import React from 'react';
import GenericCRUDView from '../../components/GenericCRUDView';

const SecurityQuestionView: React.FC = () => {
  return (
    <GenericCRUDView
      entityName="preguntas de seguridad"
      entityNameSingular="pregunta"
      emoji="🔒"
      endpoint="security-questions"
      columns={["id", "name", "description"]}
      columnLabels={{
        id: "ID",
        name: "Pregunta",
        description: "Descripción"
      }}
      formFields={[
        { 
          name: "name", 
          label: "Pregunta de Seguridad", 
          type: "textarea", 
          required: true, 
          cols: 12,
          helpText: "Escribe una pregunta clara que el usuario pueda recordar fácilmente",
          placeholder: "¿Cuál es el nombre de tu primera mascota?"
        },
        {
          name: "description",
          label: "Descripción (opcional)",
          type: "text",
          required: false,
          cols: 12,
          helpText: "Descripción opcional para categorizar la pregunta",
          placeholder: "Pregunta sobre mascotas"
        }
      ]}
      emptyMessage="📭 No hay preguntas de seguridad registradas en el sistema"
    />
  );
};

export default SecurityQuestionView;
