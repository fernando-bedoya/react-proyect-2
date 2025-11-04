import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import GenericAddressForm from '../../components/GenericsMaterial/GenericAddressForm';
import ThemeSelector from '../../components/ThemeSelector';
import userService from '../../services/userService';

const CreateAddressPage: React.FC = () => {
	const [searchParams] = useSearchParams();
	const navigate = useNavigate();
	const userIdParam = searchParams.get('userId');
	const userId = userIdParam ? Number(userIdParam) : null;
	const [userLabel, setUserLabel] = useState<string | null>(null);

	useEffect(() => {
		let mounted = true;
		(async () => {
			if (!userId) return;
			try {
				const u = await userService.getUserById(userId);
				if (!mounted) return;
				if (u && u.name) setUserLabel(`${u.name} (id:${u.id})`);
				else setUserLabel(`Usuario ${userId}`);
			} catch (err) {
				console.error('Error fetching user', err);
				if (mounted) setUserLabel(`Usuario ${userId}`);
			}
		})();

		return () => {
			mounted = false;
		};
	}, [userId]);

	return (
		<div className="p-6">
			<div className="flex justify-between items-center mb-6">
				<h2 className="text-3xl font-bold">{userLabel ? `${userLabel} - Address` : userId ? `Usuario ${userId} - Address` : 'Address'}</h2>
				<ThemeSelector />
			</div>
			{/* Selección automática del proveedor de mapa: si existe VITE_GOOGLE_MAPS_API_KEY usamos Google; de lo contrario, Leaflet.
			   Esto evita el overlay de error y mantiene el mapa visible sin tocar backend. */}
			{(() => {
				const hasGoogle = Boolean((import.meta as any).env?.VITE_GOOGLE_MAPS_API_KEY);
				return (
					<GenericAddressForm
						mode="create"
						userId={userId ?? undefined}
						onSaved={() => navigate(-1)}
						onCancel={() => navigate(-1)}
						mapProvider={hasGoogle ? 'google' : 'leaflet'}
					/>
				);
			})()}
		</div>
	);
};

export default CreateAddressPage;
