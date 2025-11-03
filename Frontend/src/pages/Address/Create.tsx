import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import GenericAddressForm from '../../components/GenericsMaterial/GenericAddressForm';
import userService from '../../services/userService';
import toast from 'react-hot-toast';

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
			<h2 className="text-3xl font-bold mb-6">{userLabel ? `${userLabel} - Address` : userId ? `Usuario ${userId} - Address` : 'Address'}</h2>
			<GenericAddressForm mode="create" userId={userId ?? undefined} onSaved={() => navigate(-1)} onCancel={() => navigate(-1)} />
		</div>
	);
};

export default CreateAddressPage;
