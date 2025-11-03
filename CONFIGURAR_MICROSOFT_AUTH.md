# Configuración de Autenticación con Microsoft (Azure AD)

## ⚠️ Problema Actual
Actualmente, cuando intentas iniciar sesión con Microsoft, aparece el error:

```
unauthorized_client: The client does not exist or is not enabled for consumers.
```

Esto significa que **Microsoft no está configurado** como proveedor de autenticación en Firebase. El código está listo, pero necesitas completar la configuración en Azure y Firebase.

---

## 📋 Pasos para Configurar Microsoft Authentication

### Paso 1: Crear una Aplicación en Azure Portal

1. **Ir a Azure Portal**
   - Visita: https://portal.azure.com
   - Inicia sesión con tu cuenta de Microsoft

2. **Registrar una Nueva Aplicación**
   - En el menú lateral, busca **"Azure Active Directory"** o **"Microsoft Entra ID"**
   - Selecciona **"App registrations"** (Registros de aplicaciones)
   - Haz clic en **"+ New registration"** (+ Nuevo registro)

3. **Configurar la Aplicación**
   - **Name**: `React Project Firebase Auth` (o el nombre que prefieras)
   - **Supported account types**: Selecciona **"Accounts in any organizational directory and personal Microsoft accounts"**
   - **Redirect URI**: 
     - Tipo: **Web**
     - URL: `https://react-proyect-fernando.firebaseapp.com/__/auth/handler`
   - Haz clic en **"Register"**

4. **Obtener las Credenciales**
   - Una vez creada la app, verás el **Application (client) ID** - **CÓPIALO**
   - Ve a **"Certificates & secrets"** en el menú lateral
   - Haz clic en **"+ New client secret"**
   - Agrega una descripción (ej: "Firebase Auth")
   - Selecciona expiración (recomendado: 24 meses)
   - Haz clic en **"Add"**
   - **COPIA EL VALOR DEL SECRET INMEDIATAMENTE** (solo se muestra una vez)

---

### Paso 2: Configurar Microsoft en Firebase Console

1. **Ir a Firebase Console**
   - Visita: https://console.firebase.google.com
   - Selecciona tu proyecto: **react-proyect-fernando**

2. **Habilitar Microsoft como Proveedor**
   - En el menú lateral, ve a **"Authentication"**
   - Selecciona la pestaña **"Sign-in method"**
   - Busca **"Microsoft"** en la lista de proveedores
   - Haz clic en **"Microsoft"** para editarlo

3. **Ingresar las Credenciales de Azure**
   - **Enable**: Activa el toggle
   - **Client ID**: Pega el **Application (client) ID** que copiaste de Azure
   - **Client Secret**: Pega el **Client Secret** que copiaste de Azure
   - Copia la **Redirect URI** que Firebase te muestra
   - Haz clic en **"Save"**

4. **Actualizar Azure con la Redirect URI de Firebase**
   - Regresa a Azure Portal → Tu aplicación → **Authentication**
   - En **"Platform configurations"**, haz clic en **"Add a platform"**
   - Selecciona **"Web"**
   - Pega la **Redirect URI** que copiaste de Firebase
   - Marca las opciones:
     - ✅ Access tokens
     - ✅ ID tokens
   - Haz clic en **"Configure"**

5. **Configurar PKCE y permisos (IMPORTANTE)**
   - En la misma página de **Authentication**
   - Ve a **"Advanced settings"** (parte inferior)
   - **Allow public client flows**: Cambia a **"Yes"**
   - Haz clic en **"Save"** en la parte superior
   
   **Nota**: Este paso es CRÍTICO. Sin esto, obtendrás el error "Proof Key for Code Exchange is required"

---

### Paso 3: Verificar la Configuración

1. **En Firebase Console**
   - Ve a **Authentication** → **Sign-in method**
   - Verifica que **Microsoft** esté **Enabled** (habilitado)
   - Verifica que aparezca el **Client ID**

2. **Probar la Autenticación**
   - Ve a tu aplicación: http://localhost:5173/auth/signin
   - Haz clic en el botón de **Microsoft**
   - Debería abrir un popup de Microsoft para iniciar sesión
   - Después de autenticarte, deberías ser redirigido a la aplicación

---

## ✅ Checklist de Verificación

- [ ] Aplicación creada en Azure Portal
- [ ] Client ID copiado
- [ ] Client Secret copiado (y guardado en lugar seguro)
- [ ] Redirect URI configurada en Azure
- [ ] Microsoft habilitado en Firebase Console
- [ ] Client ID y Secret ingresados en Firebase
- [ ] Redirect URI de Firebase configurada en Azure
- [ ] Prueba de autenticación exitosa

---

## 🔧 Solución de Problemas

### Error: "unauthorized_client"
- **Causa**: Microsoft no está habilitado en Firebase o las credenciales son incorrectas
- **Solución**: Sigue los pasos anteriores para configurar correctamente

### Error: "Proof Key for Code Exchange is required"
- **Causa**: PKCE no está habilitado en la configuración de Azure
- **Solución**: 
  1. Ve a Azure Portal → Tu aplicación → **Authentication**
  2. En **Advanced settings** (parte inferior)
  3. Cambia **"Allow public client flows"** a **"Yes"**
  4. Haz clic en **Save**

### Error: "redirect_uri_mismatch"
- **Causa**: La Redirect URI en Azure no coincide con la de Firebase
- **Solución**: Asegúrate de que la URL en Azure sea exactamente: `https://react-proyect-fernando.firebaseapp.com/__/auth/handler`

### Error: "popup_blocked"
- **Causa**: El navegador bloqueó el popup de autenticación
- **Solución**: Permite popups para `localhost:5173` en tu navegador

### Error: "Cross-Origin-Opener-Policy policy would block the window.closed call"
- **Causa**: Advertencia de seguridad del navegador (no es un error crítico)
- **Solución**: Esto es normal y no afecta la funcionalidad. Puedes ignorarlo.

---

## 📝 Notas Importantes

- **Seguridad**: Nunca compartas el **Client Secret** públicamente
- **Expiración**: Los Client Secrets expiran. Guarda la fecha de expiración
- **Dominios**: Solo funcionará en los dominios configurados en Firebase (localhost y el dominio de producción)
- **Usuarios**: Los usuarios deben tener una cuenta de Microsoft válida

---

## 🎯 Alternativas Mientras Tanto

Si no puedes configurar Microsoft ahora, los usuarios pueden:
- ✅ Iniciar sesión con **Google** (ya configurado)
- ✅ Iniciar sesión con **GitHub** (ya configurado)
- ✅ Iniciar sesión con **Email/Password**

El código ya maneja el error y muestra un mensaje claro al usuario explicando que Microsoft no está disponible.

---

## 🔗 Enlaces Útiles

- [Azure Portal](https://portal.azure.com)
- [Firebase Console](https://console.firebase.google.com)
- [Documentación de Firebase - Microsoft Auth](https://firebase.google.com/docs/auth/web/microsoft-oauth)
- [Documentación de Azure AD](https://docs.microsoft.com/azure/active-directory/)

---

**Última actualización**: 2 de noviembre de 2025
