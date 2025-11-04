/**
 * DigitalSignatureView - Usando GenericCRUDView con CRUD completo
 * Reducido de 312 líneas a solo 50 líneas con funcionalidad completa
 */

import React from 'react';
import GenericCRUDView from '../../components/GenericCRUDView';

const DigitalSignatureView: React.FC = () => {
  return (
    <GenericCRUDView
      entityName="firmas digitales"
      entityNameSingular="firma digital"
      emoji="📝"
      endpoint="digital-signatures"
      columns={["id", "user_name", "filename", "created_at_formatted"]}
      columnLabels={{
        id: "ID",
        user_name: "Usuario",
        filename: "Archivo",
        created_at_formatted: "Fecha de Creación"
      }}
      formFields={[
        { 
          name: "user_id", 
          label: "ID de Usuario", 
          type: "number", 
          required: true, 
          cols: 6,
          helpText: "ID del usuario propietario de la firma"
        },
        { 
          name: "filename", 
          label: "Nombre del Archivo", 
          type: "text", 
          required: true, 
          cols: 6,
          placeholder: "documento_firmado.pdf"
        },
        { 
          name: "file_path", 
          label: "Ruta del Archivo", 
          type: "text", 
          required: true, 
          cols: 12,
          placeholder: "/uploads/signatures/..."
        }
      ]}
      relatedEndpoints={[
        { name: "users", endpoint: "users", labelField: "name" }
      ]}
      dataTransformer={(signatures, relatedData) => {
        return signatures.map((sig: any) => ({
          ...sig,
          user_name: relatedData?.users?.find((u: any) => u.id === sig.user_id)?.name || 'Usuario desconocido',
          created_at_formatted: sig.created_at 
            ? new Date(sig.created_at).toLocaleDateString('es-ES', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })
            : 'N/A',
          filename_display: sig.filename || 'Sin nombre'
        }));
      }}
      emptyMessage="📭 No hay firmas digitales registradas"
    />
  );
};

export default DigitalSignatureView;
