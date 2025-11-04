import React from 'react';
import { useSearchParams } from 'react-router-dom';
import GenericCRUDView from '../../components/GenericCRUDView';
import type { Address } from '../../models/Address';

const AddressView: React.FC = () => {
  const [searchParams] = useSearchParams();
  const userId = searchParams.get('userId');

  // Configuración de columnas para la tabla
  const columns = [
    'id',
    'street',
    'number',
    'latitude',
    'longitude',
    'userId'
  ];

  // Configuración de campos del formulario
  const formFields = [
    { 
      name: 'street', 
      label: 'Calle', 
      type: 'text' as const, 
      required: true 
    },
    { 
      name: 'number', 
      label: 'Número', 
      type: 'text' as const, 
      required: true 
    },
    { 
      name: 'latitude', 
      label: 'Latitud', 
      type: 'number' as const, 
      required: true 
    },
    { 
      name: 'longitude', 
      label: 'Longitud', 
      type: 'number' as const, 
      required: true 
    },
    { 
      name: 'userId', 
      label: 'ID Usuario', 
      type: 'number' as const, 
      required: true,
      hidden: !!userId // Ocultar si viene userId en query params
    }
  ];

  // Acciones personalizadas para ver en mapa
  const customActions = [
    {
      name: 'viewMap',
      label: 'Ver en Mapa',
      icon: '🗺️',
      variant: 'info',
      handler: (item: Address) => {
        window.open(
          `https://www.google.com/maps?q=${item.latitude},${item.longitude}`,
          '_blank'
        );
      }
    }
  ];

  // Hook para establecer userId si viene en query params
  const onBeforeCreate = (data: any) => {
    if (userId) {
      return { ...data, userId: Number(userId) };
    }
    return data;
  };

  return (
    <GenericCRUDView
      entityName="direcciones"
      entityNameSingular="dirección"
      emoji="📍"
      endpoint="addresses"
      columns={columns}
      formFields={formFields}
      customActions={customActions}
      onBeforeCreate={onBeforeCreate}
      emptyMessage={userId ? 'Este usuario no tiene dirección registrada' : 'No hay direcciones registradas'}
    />
  );
};

export default AddressView;
