/**
 * SecurityService - Servicio reutilizable para autenticación con Firebase
 * 
 * Este servicio maneja todo el flujo de autenticación usando Firebase Authentication:
 * 
 * FLUJO DE AUTENTICACIÓN:
 * 1. Usuario ingresa al login con email/password
 * 2. Se llama al método signInWithEmailAndPassword de Firebase
 * 3. Firebase valida las credenciales y responde con un token JWT
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

import { getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "firebase/auth";
import axios from "axios";
import { User } from "../models/User";
import { store } from "../store/store";
import { setUser } from "../store/userSlice";
import app from "../firebase"; // Asegurarse de que Firebase esté inicializado

// Verificar que la app de Firebase esté inicializada antes de usar cualquier servicio
if (!app) {
    throw new Error("Firebase app no está inicializada. Verifica la configuración en firebase.ts.");
}

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
    private auth = getAuth();
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

        // Escuchar cambios en el estado de autenticación
        onAuthStateChanged(this.auth, (user) => {
            if (user) {
                user.getIdToken().then((token) => {
                    localStorage.setItem(this.TOKEN_KEY, token);
                    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
                });
            } else {
                localStorage.removeItem(this.TOKEN_KEY);
                localStorage.removeItem(this.USER_KEY);
            }
        });
    }

    /**
     * Método principal de autenticación
     * 
     * FLUJO:
     * 1. Envía credenciales al método signInWithEmailAndPassword de Firebase
     * 2. Firebase valida credenciales y retorna un token JWT
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
            // PASO 1 y 2: Enviar credenciales a Firebase
            const userCredential = await signInWithEmailAndPassword(this.auth, credentials.email, credentials.password);
            const user = userCredential.user;
            const token = await user.getIdToken();

            // Guardar token y usuario en localStorage
            localStorage.setItem(this.TOKEN_KEY, token);
            localStorage.setItem(this.USER_KEY, JSON.stringify(user));
            
            // Actualizar el estado del usuario en Redux
            store.dispatch(setUser(user));
            
            console.log('✅ LOGIN EXITOSO');
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
            console.log('   Usuario:', user.email);
            console.log('   Token recibido:', token.substring(0, 50) + '...');
            
            // Emitir evento personalizado para otros componentes
            this.dispatchEvent(new CustomEvent("userChange", { detail: user }));
            
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
            console.log('🎉 AUTENTICACIÓN COMPLETADA');
            console.log('   Todas las peticiones futuras incluirán automáticamente:');
            console.log('   Header: Authorization: Bearer ' + token.substring(0, 30) + '...');
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
            
            return { user, access_token: token } as LoginResponse;
            
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
    async logout(): Promise<void> {
        console.log('🚪 CERRANDO SESIÓN');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        
        try {
            // Cerrar sesión en Firebase
            await signOut(this.auth);
            
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
        } catch (error) {
            console.error('❌ ERROR AL CERRAR SESIÓN');
            console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
            console.error('   Error:', error.message);
            console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
            
            throw error;
        }
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

// Configurar interceptor de Axios para incluir el token en cada solicitud
axios.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("access_token");
        if (token) {
            config.headers["Authorization"] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Exportar instancia singleton del servicio
// De esta forma se comparte la misma instancia en toda la aplicación
export default new SecurityService();
