# 🏗️ Arquitectura de Archivos - Separación de Responsabilidades

## 📋 Estructura aplicada

Este proyecto sigue el principio de **separación de responsabilidades** para mantener el código organizado y mantenible.

---

## 📁 Estructura de directorios

```
src/
├── models/           ← Modelos de dominio (interfaces de negocio)
│   ├── Session.ts
│   ├── Profile.ts
│   ├── User.ts
│   └── ...
├── types/            ← Tipos de API y transformaciones
│   └── api.ts
├── services/         ← Lógica de negocio y llamadas HTTP
│   ├── securityService.ts
│   └── ...
└── components/       ← Componentes React
    └── ...
```

---

## 🎯 Responsabilidades

### `/models/*.ts` — Modelos de Dominio

**Qué contiene:**
- Interfaces del dominio (camelCase)
- Lógica de negocio pura (helpers, validaciones)
- Sin dependencias de la API

**Ejemplo:**
```typescript
// models/Session.ts
export interface Session {
  id: string;
  userId: number;
  token: string;
  expiration: Date;
  state: string;
}
```

**Cuándo usar:**
- Definir tipos para uso en componentes React
- Lógica de negocio independiente de la API
- Helpers que operan sobre el modelo de dominio

---

### `/types/api.ts` — Tipos de API y Mappers

**Qué contiene:**
- Interfaces de respuesta del backend (snake_case)
- Mappers bidireccionales (API ↔ Dominio)
- Transformaciones de datos

**Ejemplo:**
```typescript
// types/api.ts
export interface SessionApi {
  id: string;
  user_id: number;        // ← snake_case
  created_at: string;     // ← string ISO
}

export function mapSessionApiToSession(api: SessionApi): Session {
  return {
    id: api.id,
    userId: api.user_id,  // ← snake_case → camelCase
    createdAt: new Date(api.created_at),  // ← string → Date
  };
}
```

**Cuándo usar:**
- Definir tipos para respuestas HTTP
- Transformar entre formatos API y dominio
- Mantener compatibilidad con el backend

---

### `/services/*.ts` — Servicios y Lógica HTTP

**Qué contiene:**
- Llamadas HTTP (axios, fetch)
- Lógica de negocio que requiere I/O
- Uso de mappers para transformar datos

**Ejemplo:**
```typescript
// services/securityService.ts
import { Session } from '../models/Session';
import { SessionApi, mapSessionApiToSession } from '../types/api';

async getUserSessions(userId: number): Promise<Session[]> {
  const response = await axios.get<SessionApi[]>(`/api/sessions/user/${userId}`);
  // Transformar respuestas de API a modelos de dominio
  return response.data.map(mapSessionApiToSession);
}
```

**Cuándo usar:**
- Hacer peticiones HTTP
- Orquestar llamadas a múltiples endpoints
- Aplicar mappers antes de devolver datos

---

## ✅ Ventajas de esta arquitectura

| Ventaja | Descripción |
|---------|-------------|
| **Separación clara** | Cada archivo tiene una responsabilidad única |
| **Mantenibilidad** | Cambios en la API no afectan modelos de dominio |
| **Testabilidad** | Modelos de dominio se pueden testear sin mock de HTTP |
| **Escalabilidad** | Fácil añadir nuevos modelos/endpoints |
| **Consistencia** | Patrón uniforme en todo el proyecto |

---

## 🔄 Flujo de datos

```
Backend (snake_case)
    ↓
 API Response (SessionApi)
    ↓
 Mapper (mapSessionApiToSession)
    ↓
 Modelo de Dominio (Session)
    ↓
 Componente React
```

---

## 📚 Ejemplos de uso

### 1. Obtener datos desde la API

```typescript
// En un componente o hook
import { useState, useEffect } from 'react';
import { Session } from '../models/Session';
import securityService from '../services/securityService';

const [sessions, setSessions] = useState<Session[]>([]);

useEffect(() => {
  securityService.getUserSessions(userId).then(setSessions);
}, [userId]);

// sessions ya está en formato de dominio (camelCase + Date)
sessions.forEach(s => {
  console.log(s.userId);      // ← camelCase
  console.log(s.createdAt);   // ← Date object
});
```

### 2. Enviar datos al backend

```typescript
import { Session } from '../models/Session';
import { mapSessionToSessionApi } from '../types/api';

const newSession: Partial<Session> = {
  token: 'abc123',
  expiration: new Date(),
  state: 'active',
};

// Transformar a formato API antes de enviar
const apiData = mapSessionToSessionApi(newSession);
await axios.post('/api/sessions/user/1', apiData);
```

---

## 🚫 Anti-patrones (evitar)

### ❌ Mal: Mezclar tipos de API en modelos de dominio

```typescript
// ❌ NO hacer esto en models/Session.ts
export interface SessionApi { ... }  // ← esto va en types/api.ts
export interface Session { ... }
```

### ❌ Mal: Mappers en archivos de servicio

```typescript
// ❌ NO hacer esto en services/securityService.ts
function mapSessionApiToSession(api: SessionApi) { ... }  // ← esto va en types/api.ts
```

### ❌ Mal: Lógica HTTP en modelos de dominio

```typescript
// ❌ NO hacer esto en models/Session.ts
async function fetchSessions() {
  return axios.get(...);  // ← esto va en services/
}
```

---

## ✅ Buenas prácticas

### ✅ Bien: Importar solo lo necesario

```typescript
// En un componente
import { Session } from '../models/Session';  // ← modelo de dominio
import { getProfilePhotoUrl } from '../models/Profile';  // ← helper de negocio

// En un servicio
import { Session } from '../models/Session';
import { SessionApi, mapSessionApiToSession } from '../types/api';  // ← tipos y mappers
```

### ✅ Bien: Helpers de negocio en modelos

```typescript
// models/Profile.ts
export function getProfilePhotoUrl(path?: string): string | null {
  // Lógica de negocio pura (no hace HTTP)
}
```

### ✅ Bien: Un archivo para todos los tipos de API

```typescript
// types/api.ts
export interface SessionApi { ... }
export interface ProfileApi { ... }
export interface UserApi { ... }

export function mapSessionApiToSession(...) { ... }
export function mapProfileApiToProfile(...) { ... }
// ... todos los mappers en un solo lugar
```

---

## 📖 Migración de código existente

Si tienes código antiguo con tipos de API en modelos de dominio:

1. **Mover tipos de API** de `models/X.ts` a `types/api.ts`
2. **Mover mappers** de `models/X.ts` a `types/api.ts`
3. **Actualizar imports** en servicios:
   ```typescript
   // Antes
   import { Session, SessionApi, mapSessionApiToSession } from '../models/Session';
   
   // Después
   import { Session } from '../models/Session';
   import { SessionApi, mapSessionApiToSession } from '../types/api';
   ```

---

## 🎯 Checklist para nuevos modelos

Al crear un nuevo modelo (ejemplo: `Device`):

- [ ] Crear `models/Device.ts` con interfaz de dominio
- [ ] Añadir `DeviceApi` en `types/api.ts`
- [ ] Añadir mappers en `types/api.ts`:
  - `mapDeviceApiToDevice`
  - `mapDeviceToDeviceApi`
- [ ] Crear métodos en servicio correspondiente
- [ ] Importar desde ubicaciones correctas

---

## 📞 ¿Dudas?

- Ver ejemplos en: `models/Session.ts`, `models/Profile.ts`
- Ver mappers en: `types/api.ts`
- Ver uso en: `services/securityService.ts`

**🎉 Arquitectura limpia y mantenible implementada!**
