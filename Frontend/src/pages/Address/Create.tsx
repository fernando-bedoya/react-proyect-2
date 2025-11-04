import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import GenericAddressForm from '../../components/GenericsMaterial/GenericAddressForm';
import ThemeSelector from '../../components/ThemeSelector';
import userService from '../../services/userService';
import { useSelector } from 'react-redux';
import { RootState } from '../../store/store';

const CreateAddressPage: React.FC = () => {
	const [searchParams] = useSearchParams();
	const navigate = useNavigate();
	const userIdParam = searchParams.get('userId');
	const userIdFromQuery = userIdParam ? Number(userIdParam) : null;
	const currentUser = useSelector((state: RootState) => state.user.user);
	const [resolvedUserId, setResolvedUserId] = useState<number | null>(userIdFromQuery);
	const [userLabel, setUserLabel] = useState<string | null>(null);

	// Resolver el userId a usar: prioridad query param > Redux (id) > buscar por email
	useEffect(() => {
		let mounted = true;
		(async () => {
			if (userIdFromQuery) { setResolvedUserId(userIdFromQuery); return; }
			// Si Redux tiene id directo, úsalo
			if (currentUser?.id) { setResolvedUserId(currentUser.id); return; }
			// Si no hay id pero sí email, buscamos en backend por email
			if (currentUser?.email) {
				try {
					const users = await userService.getUsers();
					const found = users.find(u => u.email === currentUser.email);
					if (!mounted) return;
					setResolvedUserId(found?.id ?? null);
				} catch (e) {
					if (!mounted) return;
					setResolvedUserId(null);
				}
				return;
			}
			// Sin datos suficientes
			setResolvedUserId(null);
		})();
		return () => { mounted = false; };
	}, [userIdFromQuery, currentUser]);

	// Cargar etiqueta del usuario cuando tengamos un id resuelto
	useEffect(() => {
		let mounted = true;
		(async () => {
			if (!resolvedUserId) { setUserLabel(null); return; }
			try {
				const u = await userService.getUserById(resolvedUserId);
				if (!mounted) return;
				if (u && u.name) setUserLabel(`${u.name} (id:${u.id})`);
				else setUserLabel(`Usuario ${resolvedUserId}`);
			} catch (err) {
				console.error('Error fetching user', err);
				if (mounted) setUserLabel(`Usuario ${resolvedUserId}`);
			}
		})();
		return () => { mounted = false; };
	}, [resolvedUserId]);

	return (
		<div className="p-6">
			<div className="flex justify-between items-center mb-6">
				<h2 className="text-3xl font-bold">{userLabel ? `${userLabel} - Address` : resolvedUserId ? `Usuario ${resolvedUserId} - Address` : 'Address'}</h2>
				<ThemeSelector />
			</div>
			{/* Selección automática del proveedor de mapa: si existe VITE_GOOGLE_MAPS_API_KEY usamos Google; de lo contrario, Leaflet.
			   Esto evita el overlay de error y mantiene el mapa visible sin tocar backend. */}
			{(() => {
				const hasGoogle = Boolean((import.meta as any).env?.VITE_GOOGLE_MAPS_API_KEY);
				return (
					<GenericAddressForm
						mode="create"
						userId={resolvedUserId ?? undefined}
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
