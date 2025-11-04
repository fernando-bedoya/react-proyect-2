/**
 * AnswerView - Usando GenericCRUDView con datos relacionados
 * Reducido de 180+ líneas a solo 42 líneas
 */

import React from 'react';
import GenericCRUDView from '../../components/GenericCRUDView';

const AnswerView: React.FC = () => {
  return (
    <GenericCRUDView
      entityName="respuestas de seguridad"
      entityNameSingular="respuesta"
      emoji="💬"
      endpoint="answers"
      columns={["id", "user_name", "question_text", "answer"]}
      columnLabels={{
        id: "ID",
        user_name: "Usuario",
        question_text: "Pregunta",
        answer: "Respuesta"
      }}
      formFields={[
        { 
          name: "user_id", 
          label: "ID de Usuario", 
          type: "number", 
          required: true, 
          cols: 6,
          helpText: "ID del usuario al que pertenece la respuesta"
        },
        { 
          name: "security_question_id", 
          label: "ID de Pregunta", 
          type: "number", 
          required: true, 
          cols: 6,
          helpText: "ID de la pregunta de seguridad"
        },
        { 
          name: "answer", 
          label: "Respuesta", 
          type: "text", 
          required: true, 
          cols: 12,
          placeholder: "Respuesta a la pregunta de seguridad"
        }
      ]}
      relatedEndpoints={[
        { name: "users", endpoint: "users", labelField: "name" },
        { name: "questions", endpoint: "security-questions", labelField: "text" }
      ]}
      dataTransformer={(answers, relatedData) => {
        return answers.map((ans: any) => ({
          ...ans,
          user_name: relatedData?.users?.find((u: any) => u.id === ans.user_id)?.name || 'Usuario desconocido',
          question_text: relatedData?.questions?.find((q: any) => q.id === ans.security_question_id)?.text || 'Pregunta no encontrada'
        }));
      }}
      emptyMessage="📭 No hay respuestas de seguridad registradas"
    />
  );
};

export default AnswerView;
