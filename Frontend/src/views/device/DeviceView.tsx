/**
 * DeviceView - Usando GenericCRUDView con endpoint personalizado para crear
 * El backend espera POST /devices/user/<user_id> en lugar de POST /devices
 */

import React from 'react';
import GenericCRUDView from '../../components/GenericCRUDView';
import { create } from '../../services/baseService';

const DeviceView: React.FC = () => {
  // Handler personalizado para crear dispositivo con el endpoint correcto del backend
  const handleCreateDevice = async (formData: any) => {
    const userId = formData.user_id;
    if (!userId) {
      throw new Error('El ID de usuario es requerido');
    }
    
    console.log('🔵 Intentando crear dispositivo...');
    console.log('   User ID:', userId);
    console.log('   Endpoint:', `devices/user/${userId}`);
    console.log('   Form Data:', formData);
    
    try {
      // Usar el endpoint que el backend espera: POST /devices/user/<user_id>
      // El baseService ya tiene configurado el baseURL y los interceptores
      const response = await create(`devices/user/${userId}`, formData);

      console.log('✅ Dispositivo creado exitosamente:', response);
      return response;
    } catch (error: any) {
      console.error('❌ Error al crear dispositivo:', error);
      console.error('   Status:', error.response?.status);
      console.error('   Data:', error.response?.data);
      console.error('   URL intentada:', error.config?.url);
      throw error;
    }
  };

  return (
    <GenericCRUDView
      entityName="dispositivos"
      entityNameSingular="dispositivo"
      emoji="📱"
      endpoint="devices"
      columns={["id", "user_name", "name", "ip", "operating_system"]}
      columnLabels={{
        id: "ID",
        user_name: "Usuario",
        name: "Nombre del Dispositivo",
        ip: "Dirección IP",
        operating_system: "Sistema Operativo"
      }}
      formFields={[
        { name: "user_id", label: "ID de Usuario", type: "number", required: true, cols: 6 },
        { name: "name", label: "Nombre del Dispositivo", type: "text", required: true, cols: 6, placeholder: "iPhone 13 Pro" },
        { name: "ip", label: "Dirección IP", type: "text", required: true, cols: 6, placeholder: "192.168.1.100" },
        { name: "operating_system", label: "Sistema Operativo", type: "text", required: true, cols: 6, placeholder: "iOS 16" }
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
      // Usar handler personalizado para crear dispositivos con el endpoint del backend
      customCreateHandler={handleCreateDevice}
    />
  );
};

export default DeviceView;
