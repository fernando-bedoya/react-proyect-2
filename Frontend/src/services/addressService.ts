import axios from "axios";
import type { Address } from "../models/Address";

const VITE_API_URL = (import.meta as any).env?.VITE_API_URL || '';
const API_URL = VITE_API_URL + "/addresses";

function mapAddress(raw: any): Address {
    return {
        id: raw.id,
        street: raw.street,
        number: raw.number,
        latitude: raw.latitude !== undefined && raw.latitude !== null ? Number(raw.latitude) : 0,
        longitude: raw.longitude !== undefined && raw.longitude !== null ? Number(raw.longitude) : 0,
        userId: raw.user_id ?? raw.userId,
    } as Address;
}

class AddressService {
    async getAddresses(): Promise<Address[]> {
        try {
            const response = await axios.get(API_URL);
            const data = response.data;
            if (Array.isArray(data)) {
                return data.map(mapAddress);
            }
            return [];
        } catch (error) {
            console.error("Error al obtener direcciones:", error);
            throw error;
        }
    }

    async getAddressById(id: number): Promise<Address | null> {
        try {
            const response = await axios.get(`${API_URL}/${id}`);
            return mapAddress(response.data);
        } catch (error) {
            console.error("Address no encontrado:", error);
            return null;
        }
    }

    async getAddressByUserId(userId: number): Promise<Address | null> {
        try {
            const response = await axios.get(`${API_URL}/user/${userId}`);
            return mapAddress(response.data);
        } catch (error) {
            console.error("Address por usuario no encontrado:", error);
            return null;
        }
    }

    async createAddress(userId: number, payload: Omit<Address, 'id'>): Promise<Address | null> {
        try {
            const body = {
                street: payload.street,
                number: payload.number,
                latitude: payload.latitude,
                longitude: payload.longitude,
            };
            const response = await axios.post(`${API_URL}/user/${userId}`, body);
            return mapAddress(response.data);
        } catch (error) {
            console.error("Error al crear address:", error);
            throw error;
        }
    }

    async updateAddress(id: number, payload: Partial<Address>): Promise<Address | null> {
        try {
            const response = await axios.put(`${API_URL}/${id}`, payload);
            return mapAddress(response.data);
        } catch (error) {
            console.error("Error al actualizar address:", error);
            throw error;
        }
    }

    async deleteAddress(id: number): Promise<boolean> {
        try {
            await axios.delete(`${API_URL}/${id}`);
            return true;
        } catch (error) {
            console.error("Error al eliminar address:", error);
            return false;
        }
    }
}

const addressService = new AddressService();
export default addressService;
