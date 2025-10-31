# 📚 Documentación de Cambios - Sistema de Autenticación y Selector de Temas

## ✅ Cambios Realizados

### 1. 🔐 Autenticación Social en SignUp.tsx

**Archivo modificado:** `Frontend/src/pages/Authentication/SignUp.tsx`

#### Funcionalidades implementadas:

- ✅ **Registro con Email/Password**
  - Firebase Authentication para crear usuarios
  - Validación con Formik y Yup
  - Campos: Nombre, Email, Contraseña, Confirmar Contraseña
  - Mostrar/ocultar contraseña con iconos

- ✅ **Autenticación Social con Firebase**
  - **Google**: Login con cuenta de Google
  - **GitHub**: Login con cuenta de GitHub
  - **Microsoft**: Login con cuenta de Microsoft
  - Todos con botones personalizados y logos oficiales

- ✅ **Integración con Backend**
  - Los usuarios registrados (tanto por email como por proveedores sociales) se guardan automáticamente en la base de datos Flask
  - Función `saveUserToBackend()` envía: `name` y `email`
  - Manejo de errores y notificaciones con SweetAlert2
  - Redirección automática a `/auth/signin` después del registro exitoso

#### Flujo de registro:
1. Usuario elige método de registro (email o proveedor social)
2. Se crea cuenta en Firebase Authentication
3. Se extrae información del usuario (nombre, email)
4. Se guarda en backend Flask mediante `userService.createUser()`
5. Notificación de éxito con SweetAlert2
6. Redirección a página de inicio de sesión

---

### 2. 🎨 Sistema de Selector de Temas

**Archivos creados/modificados:**
- `Frontend/src/context/ThemeContext.tsx` (modificado)
- `Frontend/src/components/ThemeSelector.tsx` (nuevo)
- Vistas CRUD actualizadas con el selector

#### Funcionalidades:

- ✅ **ThemeContext** mejorado
  - Soporte para 3 temas: `Bootstrap`, `Tailwind`, `Material UI`
  - Persistencia en `localStorage`
  - Hook personalizado `useTheme()`
  - Función `nextDesignLibrary()` para ciclar entre temas

- ✅ **ThemeSelector Component**
  - Dropdown flotante en esquina superior derecha
  - Selector visual con colores característicos de cada framework
  - Indicador del tema activo con ✓
  - Guardado automático de preferencias
  - Diseño responsivo y minimalista

- ✅ **Vistas CRUD actualizadas**
  - `DigitalSignatureView.jsx`
  - `DeviceView.jsx`
  - `SecurityQuestionView.jsx`
  - `AnswerView.jsx`
  - Todas incluyen `<ThemeSelector />` en la esquina superior derecha

---

## 📁 Estructura de Archivos

```
Frontend/
├── src/
│   ├── components/
│   │   └── ThemeSelector.tsx .................... Selector de temas (NUEVO)
│   ├── context/
│   │   └── ThemeContext.tsx ..................... Contexto global de temas (MODIFICADO)
│   ├── pages/
│   │   └── Authentication/
│   │       └── SignUp.tsx ....................... Registro con auth social (REESCRITO)
│   ├── views/
│   │   ├── digitalSignature/
│   │   │   └── DigitalSignatureView.jsx ......... Con ThemeSelector (MODIFICADO)
│   │   ├── device/
│   │   │   └── DeviceView.jsx ................... Con ThemeSelector (MODIFICADO)
│   │   ├── securityQuestion/
│   │   │   └── SecurityQuestionView.jsx ......... Con ThemeSelector (MODIFICADO)
│   │   └── answer/
│   │       └── AnswerView.jsx ................... Con ThemeSelector (MODIFICADO)
│   ├── services/
│   │   └── userService.ts ....................... API para usuarios
│   └── firebase.ts ............................... Configuración de Firebase
```

---

## 🚀 Cómo Usar

### Autenticación Social

1. **Habilitar proveedores en Firebase Console:**
   ```
   Firebase Console → Authentication → Sign-in method
   - Habilitar Email/Password
   - Habilitar Google
   - Habilitar GitHub (necesita OAuth App en GitHub)
   - Habilitar Microsoft (necesita Azure AD)
   ```

2. **Registrarse:**
   - Ir a `http://localhost:5173/auth/signup`
   - Elegir método: Google, GitHub, Microsoft o Email
   - Los datos se guardan automáticamente en el backend

### Selector de Temas

1. **Usar en cualquier vista CRUD:**
   - El selector aparece automáticamente en la esquina superior derecha
   - Click en el dropdown para ver las opciones
   - Seleccionar: Bootstrap, Tailwind o Material UI
   - El cambio es instantáneo y se guarda automáticamente

2. **Agregar a nuevas vistas:**
   ```tsx
   import ThemeSelector from '../../components/ThemeSelector';
   
   return (
     <Container fluid className="py-4 position-relative">
       <ThemeSelector />
       {/* Resto del contenido */}
     </Container>
   );
   ```

3. **Usar el contexto en componentes:**
   ```tsx
   import { useTheme } from '../context/ThemeContext';
   
   const MyComponent = () => {
     const { designLibrary, setDesignLibrary } = useTheme();
     
     // Aplicar estilos condicionales
     if (designLibrary === 'bootstrap') {
       // Clases de Bootstrap
     } else if (designLibrary === 'tailwind') {
       // Clases de Tailwind
     } else if (designLibrary === 'material') {
       // Componentes MUI
     }
   };
   ```

---

## 🔧 Configuración de Firebase

**Archivo:** `Frontend/src/firebase.ts`

```typescript
const firebaseConfig = {
  apiKey: "AIzaSyAdEAb3urB1jwxUlyDzWcEh10EOPhifdhw",
  authDomain: "react-proyect-fernando.firebaseapp.com",
  projectId: "react-proyect-fernando",
  storageBucket: "react-proyect-fernando.firebasestorage.app",
  messagingSenderId: "387736521137",
  appId: "1:387736521137:web:dd507ed1fc9a14678e1590"
};
```

---

## 📊 Backend (NO MODIFICADO)

El backend Flask permanece intacto. La integración funciona así:

1. **Frontend** crea usuario en Firebase
2. **Frontend** extrae datos del usuario
3. **Frontend** envía a backend: `POST /api/users`
   ```json
   {
     "name": "Usuario de Google",
     "email": "usuario@gmail.com"
   }
   ```
4. **Backend** guarda en base de datos SQLite

---

## ✨ Características

### Autenticación Social
- ✅ 3 proveedores sociales (Google, GitHub, Microsoft)
- ✅ Registro con email/password
- ✅ Validación de formularios
- ✅ Manejo de errores descriptivos
- ✅ Persistencia en backend Flask
- ✅ Notificaciones con SweetAlert2
- ✅ Mostrar/ocultar contraseñas
- ✅ Diseño responsivo con Bootstrap

### Selector de Temas
- ✅ 3 frameworks de diseño (Bootstrap, Tailwind, Material UI)
- ✅ Selector flotante en todas las vistas CRUD
- ✅ Persistencia en localStorage
- ✅ Cambio instantáneo sin recargar
- ✅ Indicador visual del tema activo
- ✅ Colores característicos de cada framework
- ✅ Diseño minimalista y responsivo

---

## 🎯 Próximos Pasos

1. **Implementar estilos condicionales** en EntityTable y EntityForm según el tema seleccionado
2. **Instalar Material UI** si se desea usar completamente:
   ```bash
   npm install @mui/material @emotion/react @emotion/styled
   ```
3. **Configurar proveedores sociales** en Firebase Console (GitHub necesita OAuth App)
4. **Crear página SignIn** con los mismos proveedores sociales

---

## 📝 Notas Importantes

- ⚠️ **Backend NO modificado** - Todos los cambios son solo en Frontend
- ⚠️ **Firebase requerido** - Necesitas una cuenta de Firebase configurada
- ⚠️ **Proveedores sociales** - Deben habilitarse en Firebase Console
- ✅ **Persistencia** - Tema y usuarios se guardan automáticamente
- ✅ **Errores** - Manejo completo con mensajes descriptivos

---

**Fecha:** 30 de octubre de 2025  
**Autor:** GitHub Copilot  
**Proyecto:** react-proyect-2
