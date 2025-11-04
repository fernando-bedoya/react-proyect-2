import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import ThemeSelector from '../../components/ThemeSelector';
import GenericTable from '../../components/GenericTable';
import addressService from '../../services/addressService';
import type { Address } from '../../models/Address';

const AddressListPage: React.FC = () => {
	const navigate = useNavigate();
	const [searchParams] = useSearchParams();
	const [items, setItems] = useState<Address[]>([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const userId = useMemo(() => {
		const q = searchParams.get('userId');
		return q ? Number(q) : undefined;
	}, [searchParams]);

	useEffect(() => {
		const run = async () => {
			setLoading(true);
			setError(null);
			try {
				if (userId) {
					const one = await addressService.getAddressByUserId(userId);
					setItems(one ? [one] : []);
				} else {
					const all = await addressService.getAddresses();
					setItems(all);
				}
			} catch (e: any) {
				setError(e?.message || 'Error al cargar direcciones');
				setItems([]);
			} finally {
				setLoading(false);
			}
		};
		run();
	}, [userId]);

	const columns = ['id', 'street', 'number', 'latitude', 'longitude', 'userId', 'options_render'];

	const data = items.map((a) => ({
		...a,
			options_render: (
				<div className="flex gap-2">
					<button
						className="px-3 py-1 rounded shadow border border-blue-700 hover:bg-blue-700"
						style={{ backgroundColor: '#2563eb', color: '#ffffff' }}
						onClick={() => navigate(`/addresses/update/${a.id}`)}
					>
						Editar
					</button>
					{userId && (
						<button
							className="px-3 py-1 rounded border hover:bg-gray-50"
							onClick={() => navigate(`/addresses/create?userId=${userId}`)}
						>
							Nueva
						</button>
					)}
				</div>
			),
	}));

	return (
		<div className="p-6">
			<div className="mb-4 flex items-center justify-between">
				<div>
					<h2 className="text-xl font-semibold">Direcciones {userId ? `(Usuario ${userId})` : ''}</h2>
					<p className="text-sm text-gray-600">{userId ? 'Dirección asociada al usuario' : 'Todas las direcciones'}</p>
				</div>
				<ThemeSelector />
			</div>

			{error && (
				<div className="mb-3 rounded border border-red-300 bg-red-50 p-3 text-red-800">{error}</div>
			)}

			<div className="rounded border bg-white">
				{loading ? (
					<div className="p-6 text-center text-gray-600">Cargando...</div>
				) : (
					<GenericTable
						data={data}
						columns={columns}
						actions={[]}
						onAction={() => {}}
						striped
						hover
						responsive
						emptyMessage={userId ? 'Este usuario no tiene dirección registrada' : 'No hay direcciones registradas'}
					/>
				)}
			</div>
		</div>
	);
};

export default AddressListPage;
