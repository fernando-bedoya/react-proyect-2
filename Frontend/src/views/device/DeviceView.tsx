/**
 * DeviceView - Usando GenericCRUDView
 * Reducido de 150+ líneas a solo 28 líneas
 */

import React from 'react';
import GenericCRUDView from '../../components/GenericCRUDView';

const DeviceView: React.FC = () => {
  return (
    <GenericCRUDView
      entityName="dispositivos"
      entityNameSingular="dispositivo"
      emoji="📱"
      endpoint="devices"
      columns={["id", "user_name", "name", "type"]}
      columnLabels={{
        id: "ID",
        user_name: "Usuario",
        name: "Nombre del Dispositivo",
        type: "Tipo de Dispositivo"
      }}
      formFields={[
        { name: "user_id", label: "ID de Usuario", type: "number", required: true, cols: 6 },
        { name: "name", label: "Nombre", type: "text", required: true, cols: 6, placeholder: "iPhone 13 Pro" },
        { name: "type", label: "Tipo", type: "text", required: true, cols: 12, placeholder: "Smartphone" }
      ]}
      relatedEndpoints={[
        { name: "users", endpoint: "users", labelField: "name" }
      ]}
      dataTransformer={(devices, relatedData) => {
        return devices.map((dev: any) => ({
          ...dev,
          user_name: relatedData?.users?.find((u: any) => u.id === dev.user_id)?.name || 'Usuario desconocido'
        }));
      }}
      emptyMessage="📭 No hay dispositivos registrados"
    />
  );
};

export default DeviceView;
