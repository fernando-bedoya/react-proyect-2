/**
 * EJEMPLOS DE USO DE GenericCRUDView
 * 
 * Este componente te permite crear CRUDs completos con POCAS LÍNEAS DE CÓDIGO
 */

import React from 'react';
import GenericCRUDView from '../../components/GenericCRUDView';

// ========================================
// EJEMPLO 1: CRUD SÚPER SIMPLE (Usuarios)
// ========================================
export const UsersViewSimple = () => {
  return (
    <GenericCRUDView
      entityName="usuarios"
      entityNameSingular="usuario"
      emoji="👥"
      endpoint="users"
      columns={["id", "name", "email"]}
      formFields={[
        { name: "name", label: "Nombre", type: "text", required: true, cols: 12 },
        { name: "email", label: "Email", type: "email", required: true, cols: 12 }
      ]}
    />
  );
};

// ========================================
// EJEMPLO 2: CRUD con Labels Personalizados
// ========================================
export const DevicesView = () => {
  return (
    <GenericCRUDView
      entityName="dispositivos"
      entityNameSingular="dispositivo"
      emoji="📱"
      endpoint="devices"
      columns={["id", "user_id", "name", "type"]}
      columnLabels={{
        id: "ID",
        user_id: "Usuario",
        name: "Nombre del Dispositivo",
        type: "Tipo"
      }}
      formFields={[
        { name: "user_id", label: "Usuario", type: "number", required: true, cols: 6 },
        { name: "name", label: "Nombre", type: "text", required: true, cols: 6 },
        { name: "type", label: "Tipo", type: "text", required: true, cols: 12 }
      ]}
    />
  );
};

// ========================================
// EJEMPLO 3: CRUD con Datos Relacionados
// ========================================
export const AnswersView = () => {
  return (
    <GenericCRUDView
      entityName="respuestas"
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
          label: "Usuario", 
          type: "select", 
          required: true, 
          cols: 6,
          options: [] // Se llenará dinámicamente
        },
        { 
          name: "security_question_id", 
          label: "Pregunta", 
          type: "select", 
          required: true, 
          cols: 6,
          options: [] // Se llenará dinámicamente
        },
        { 
          name: "answer", 
          label: "Respuesta", 
          type: "text", 
          required: true, 
          cols: 12 
        }
      ]}
      relatedEndpoints={[
        { name: "users", endpoint: "users", labelField: "name" },
        { name: "questions", endpoint: "security-questions", labelField: "text" }
      ]}
      dataTransformer={(answers, relatedData) => {
        return answers.map(ans => ({
          ...ans,
          user_name: relatedData?.users?.find((u: any) => u.id === ans.user_id)?.name || 'Desconocido',
          question_text: relatedData?.questions?.find((q: any) => q.id === ans.security_question_id)?.text || 'N/A'
        }));
      }}
    />
  );
};

// ========================================
// EJEMPLO 4: CRUD con Callbacks y Validación
// ========================================
export const SecurityQuestionsView = () => {
  return (
    <GenericCRUDView
      entityName="preguntas de seguridad"
      entityNameSingular="pregunta"
      emoji="🔒"
      endpoint="security-questions"
      columns={["id", "text"]}
      columnLabels={{
        id: "ID",
        text: "Pregunta"
      }}
      formFields={[
        { 
          name: "text", 
          label: "Pregunta", 
          type: "textarea", 
          required: true, 
          cols: 12,
          helpText: "Escribe una pregunta de seguridad clara"
        }
      ]}
      onBeforeCreate={(data) => {
        console.log('Antes de crear:', data);
        return data;
      }}
      onAfterCreate={(data) => {
        console.log('Después de crear:', data);
      }}
      onBeforeDelete={async (id) => {
        console.log('Verificando si se puede eliminar:', id);
        // Aquí podrías hacer validaciones
        return true; // Retorna false para cancelar
      }}
    />
  );
};

// ========================================
// EJEMPLO 5: CRUD Avanzado con Acciones Personalizadas
// ========================================
export const DigitalSignaturesView = () => {
  const handleDownload = (signature: any) => {
    console.log('Descargar firma:', signature);
    alert(`Descargando: ${signature.filename}`);
  };

  const handleVerify = (signature: any) => {
    console.log('Verificar firma:', signature);
    alert(`Verificando firma ID: ${signature.id}`);
  };

  return (
    <GenericCRUDView
      entityName="firmas digitales"
      entityNameSingular="firma"
      emoji="📝"
      endpoint="digital-signatures"
      columns={["id", "user_name", "filename", "created_at"]}
      columnLabels={{
        id: "ID",
        user_name: "Usuario",
        filename: "Archivo",
        created_at: "Fecha"
      }}
      formFields={[
        { name: "user_id", label: "Usuario", type: "number", required: true, cols: 6 },
        { name: "filename", label: "Nombre del Archivo", type: "text", required: true, cols: 6 },
        { name: "file_path", label: "Ruta", type: "text", required: true, cols: 12 }
      ]}
      relatedEndpoints={[
        { name: "users", endpoint: "users" }
      ]}
      dataTransformer={(signatures, relatedData) => {
        return signatures.map(sig => ({
          ...sig,
          user_name: relatedData?.users?.find((u: any) => u.id === sig.user_id)?.name || 'Desconocido',
          created_at: new Date(sig.created_at).toLocaleDateString('es-ES')
        }));
      }}
      customActions={[
        {
          name: "download",
          label: "Descargar",
          icon: "view",
          variant: "outline-info",
          handler: handleDownload
        },
        {
          name: "verify",
          label: "Verificar",
          icon: "more",
          variant: "outline-warning",
          handler: handleVerify
        }
      ]}
    />
  );
};

// ========================================
// EJEMPLO 6: CRUD Solo Lectura (Sin Crear/Editar/Eliminar)
// ========================================
export const LogsView = () => {
  return (
    <GenericCRUDView
      entityName="logs"
      entityNameSingular="log"
      emoji="📊"
      endpoint="logs"
      columns={["id", "action", "user", "timestamp"]}
      formFields={[]} // No se necesita porque no hay formulario
      showCreate={false}
      showEdit={false}
      showDelete={false}
    />
  );
};

// ========================================
// EJEMPLO 7: CRUD con Campos de Diferentes Tipos
// ========================================
export const ProductsView = () => {
  return (
    <GenericCRUDView
      entityName="productos"
      entityNameSingular="producto"
      emoji="🛍️"
      endpoint="products"
      columns={["id", "name", "price", "stock", "active"]}
      columnLabels={{
        id: "ID",
        name: "Nombre",
        price: "Precio",
        stock: "Stock",
        active: "Activo"
      }}
      formFields={[
        { name: "name", label: "Nombre", type: "text", required: true, cols: 6 },
        { name: "price", label: "Precio", type: "number", required: true, cols: 6 },
        { name: "stock", label: "Stock", type: "number", required: true, cols: 6 },
        { 
          name: "category", 
          label: "Categoría", 
          type: "select", 
          required: true, 
          cols: 6,
          options: [
            { value: "electronics", label: "Electrónica" },
            { value: "clothing", label: "Ropa" },
            { value: "food", label: "Alimentos" }
          ]
        },
        { name: "description", label: "Descripción", type: "textarea", cols: 12 },
        { name: "active", label: "Activo", type: "checkbox", cols: 12 }
      ]}
    />
  );
};

// ========================================
// CÓMO USAR ESTOS EJEMPLOS:
// ========================================
/**
 * 1. Importa el ejemplo que necesites:
 *    import { UsersViewSimple } from './examples/CRUDExamples';
 * 
 * 2. Úsalo en tus rutas:
 *    <Route path="/users" element={<UsersViewSimple />} />
 * 
 * 3. ¡Listo! Ya tienes un CRUD completo con:
 *    ✅ Lista con tabla
 *    ✅ Crear/Editar en modal
 *    ✅ Eliminar con confirmación
 *    ✅ Loading states
 *    ✅ Error handling
 *    ✅ Tema verde hermoso
 *    ✅ Responsive
 *    ✅ 3 temas (Bootstrap/Tailwind/Material)
 */
