import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import GenericAddressForm from '../../components/GenericsMaterial/GenericAddressForm';

const UpdateAddressPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  if (!id) return <div>ID de dirección no proporcionado</div>;

  return (
    <GenericAddressForm
      mode="edit"
      addressId={Number(id)}
      onSaved={() => navigate('/users')}
      onCancel={() => navigate('/users')}
    />
  );
};

export default UpdateAddressPage;
