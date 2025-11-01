/**
 * SecurityQuestionView - Usando GenericCRUDView
 * ¡Mira qué simple! Solo 18 líneas vs 150+ líneas de la versión anterior
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
      columns={["id", "text"]}
      columnLabels={{
        id: "ID",
        text: "Pregunta de Seguridad"
      }}
      formFields={[
        { 
          name: "text", 
          label: "Pregunta", 
          type: "textarea", 
          required: true, 
          cols: 12,
          helpText: "Escribe una pregunta de seguridad clara y específica",
          placeholder: "¿Cuál es el nombre de tu primera mascota?"
        }
      ]}
      emptyMessage="📭 No hay preguntas de seguridad registradas en el sistema"
    />
  );
};

export default SecurityQuestionView;
