/**
 * SecurityService - Servicio reutilizable para autenticación JWT
 * 
 * Este servicio maneja todo el flujo de autenticación con tokens JWT:
 * 
 * FLUJO DE AUTENTICACIÓN:
 * 1. Usuario ingresa al login con email/password
 * 2. Se llama al endpoint /login del backend
 * 3. El backend responde con un token JWT
 * 4. El frontend guarda el token en localStorage (key: 'access_token')
 * 5. Se actualiza la sesión del usuario en Redux
 * 6. Todas las peticiones subsecuentes envían el token automáticamente via interceptor de Axios (api.js)
 * 
 * RESPONSABILIDADES:
 * - Autenticar usuarios mediante email/password
 * - Almacenar el token JWT en localStorage
 * - Actualizar el estado del usuario en Redux
 * - Proporcionar métodos para verificar autenticación
 * - Limpiar tokens y sesión al cerrar sesión
 * 
 * INTEGRACIÓN CON AXIOS:
 * El archivo api.js ya tiene configurado un interceptor que automáticamente:
 * - Lee el token de localStorage ('access_token')
 * - Lo agrega a cada petición HTTP como header: Authorization: Bearer {token}
 * - Maneja errores 401 (token inválido) redirigiendo al login
 */

import axios from "axios";
import { User } from "../models/User";
import { store } from "../store/store";
import { setUser } from "../store/userSlice";

/**
 * Interfaz para la respuesta del backend al hacer login
 */
interface LoginResponse {
    user: User;           // Datos del usuario autenticado
    access_token: string; // Token JWT para autenticación
    refresh_token?: string; // Token opcional para renovar el access_token
    expires_in?: number;  // Tiempo de expiración del token en segundos
}

class SecurityService extends EventTarget {
    // Claves para localStorage
    private readonly TOKEN_KEY = 'access_token';        // Key donde se guarda el JWT
    private readonly REFRESH_TOKEN_KEY = 'refresh_token'; // Key para el refresh token
    private readonly USER_KEY = 'user';                 // Key donde se guardan datos del usuario
    
    // URL base de la API (se obtiene de variables de entorno)
    private readonly API_URL: string;
    
    // Usuario actual en memoria
    private user: User;
    
    constructor() {
        super();

        // Obtener URL de la API desde variables de entorno
        this.API_URL = (import.meta as any).env?.VITE_API_URL || "";
        
        // Intentar recuperar usuario del localStorage al iniciar
        const storedUser = localStorage.getItem(this.USER_KEY);
        if (storedUser) {
            try {
                this.user = JSON.parse(storedUser);
            } catch (error) {
                console.error('Error al parsear usuario del localStorage:', error);
                this.user = {};
            }
        } else {
            this.user = {};
        }

        // Log inicial para debugging
        console.log('🔐 SecurityService inicializado');
        console.log('   API URL:', this.API_URL);
        console.log('   Usuario en caché:', this.user.email || 'No autenticado');
    }

    /**
     * Método principal de autenticación
     * 
     * FLUJO:
     * 1. Envía credenciales al endpoint /login del backend
     * 2. Backend valida credenciales y retorna: { user: {...}, access_token: "..." }
     * 3. Guarda el token en localStorage con key 'access_token'
     * 4. Guarda los datos del usuario en localStorage con key 'user'
     * 5. Actualiza el estado del usuario en Redux
     * 6. Retorna los datos completos de la respuesta
     * 
     * NOTA: El interceptor de Axios (api.js) automáticamente agregará este token
     * a todas las peticiones futuras como header: Authorization: Bearer {token}
     * 
     * @param credentials - Objeto con email y password del usuario
     * @returns Promise con los datos de la respuesta del backend
     * @throws Error si las credenciales son inválidas o hay error de red
     */
    async login(credentials: User): Promise<LoginResponse> {
        console.log('🔐 INICIANDO LOGIN');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('   Email:', credentials.email);
        console.log('   URL:', `${this.API_URL}/login`);
        
        try {
            // PASO 1 y 2: Enviar credenciales al backend
            const response = await axios.post<LoginResponse>(
                `${this.API_URL}/login`, 
                credentials,
                {
                    headers: {
                        'Content-Type': 'application/json',
                    },
                }
            );

            const data = response.data;
            
            // Validar que la respuesta tenga el formato esperado
            if (!data.access_token) {
                throw new Error('El backend no retornó un token válido');
            }

            console.log('✅ LOGIN EXITOSO');
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
            console.log('   Usuario:', data.user?.email || 'N/A');
            console.log('   Token recibido:', data.access_token.substring(0, 50) + '...');
            console.log('   Expira en:', data.expires_in ? `${data.expires_in} segundos` : 'N/A');
            
            // PASO 3: Guardar token en localStorage
            localStorage.setItem(this.TOKEN_KEY, data.access_token);
            console.log('   ✓ Token guardado en localStorage (key: access_token)');
            
            // Guardar refresh token si existe
            if (data.refresh_token) {
                localStorage.setItem(this.REFRESH_TOKEN_KEY, data.refresh_token);
                console.log('   ✓ Refresh token guardado');
            }
            
            // PASO 4: Guardar datos del usuario en localStorage
            if (data.user) {
                localStorage.setItem(this.USER_KEY, JSON.stringify(data.user));
                this.user = data.user;
                console.log('   ✓ Usuario guardado en localStorage (key: user)');
            }
            
            // PASO 5: Actualizar Redux store con los datos del usuario
            store.dispatch(setUser(data.user));
            console.log('   ✓ Usuario actualizado en Redux store');
            
            // Emitir evento personalizado para otros componentes
            this.dispatchEvent(new CustomEvent("userChange", { detail: data.user }));
            
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
            console.log('🎉 AUTENTICACIÓN COMPLETADA');
            console.log('   Todas las peticiones futuras incluirán automáticamente:');
            console.log('   Header: Authorization: Bearer ' + data.access_token.substring(0, 30) + '...');
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
            
            return data;
            
        } catch (error: any) {
            console.error('❌ ERROR EN LOGIN');
            console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
            console.error('   URL intentada:', `${this.API_URL}/login`);
            console.error('   Email:', credentials.email);
            console.error('   Error:', error.message);
            if (error.response) {
                console.error('   Status:', error.response.status);
                console.error('   Respuesta:', error.response.data);
            }
            console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
            
            throw error;
        }
    }

    /**
     * Obtiene el usuario actual desde la memoria
     * @returns Objeto User con los datos del usuario autenticado
     */
    getUser(): User {
        return this.user;
    }

    /**
     * Cierra la sesión del usuario
     * 
     * FLUJO:
     * 1. Limpia el token JWT del localStorage
     * 2. Limpia el refresh token del localStorage
     * 3. Limpia los datos del usuario del localStorage
     * 4. Limpia el usuario de la memoria
     * 5. Actualiza Redux store (pone user en null)
     * 6. Emite evento para notificar a otros componentes
     * 
     * NOTA: El interceptor de Axios dejará de enviar el token automáticamente
     * porque ya no existirá en localStorage
     */
    logout(): void {
        console.log('🚪 CERRANDO SESIÓN');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        
        // Limpiar tokens del localStorage
        localStorage.removeItem(this.TOKEN_KEY);
        localStorage.removeItem(this.REFRESH_TOKEN_KEY);
        localStorage.removeItem(this.USER_KEY);
        console.log('   ✓ Tokens eliminados del localStorage');
        
        // Limpiar usuario de la memoria
        this.user = {};
        console.log('   ✓ Usuario limpiado de la memoria');
        
        // Actualizar Redux store
        store.dispatch(setUser(null));
        console.log('   ✓ Redux store actualizado (user = null)');
        
        // Emitir evento
        this.dispatchEvent(new CustomEvent("userChange", { detail: null }));
        console.log('   ✓ Evento userChange emitido');
        
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('✅ SESIÓN CERRADA EXITOSAMENTE');
    }

    /**
     * Verifica si hay un usuario autenticado
     * Comprueba la existencia del token en localStorage
     * 
     * @returns true si existe un token, false en caso contrario
     */
    isAuthenticated(): boolean {
        const hasToken = localStorage.getItem(this.TOKEN_KEY) !== null;
        console.log('🔍 Verificando autenticación:', hasToken ? 'SÍ' : 'NO');
        return hasToken;
    }

    /**
     * Obtiene el token JWT actual
     * 
     * NOTA: Este token es el que Axios envía automáticamente en cada petición
     * via el interceptor configurado en api.js
     * 
     * @returns El token JWT o null si no existe
     */
    getToken(): string | null {
        return localStorage.getItem(this.TOKEN_KEY);
    }

    /**
     * Obtiene el refresh token
     * @returns El refresh token o null si no existe
     */
    getRefreshToken(): string | null {
        return localStorage.getItem(this.REFRESH_TOKEN_KEY);
    }

    /**
     * Actualiza el token de acceso
     * Útil cuando se renueva el token usando el refresh token
     * 
     * @param newToken - Nuevo token JWT
     */
    updateAccessToken(newToken: string): void {
        localStorage.setItem(this.TOKEN_KEY, newToken);
        console.log('🔄 Token actualizado en localStorage');
    }
}

// Exportar instancia singleton del servicio
// De esta forma se comparte la misma instancia en toda la aplicación
export default new SecurityService();
