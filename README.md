# 🔐 Sistema de Seguridad - React + Flask

Proyecto de gestión de seguridad con Frontend en React y Backend en Flask/Python.

## 🚀 Inicio Rápido

### Verificar Configuración

Primero, verifica que todo esté correctamente configurado:

```bash
python3 verify_setup.py
```

### Iniciar el Proyecto

**Terminal 1 - Backend (Flask):**
```bash
cd Backend
./start_backend.sh
```

**Terminal 2 - Frontend (React):**
```bash
cd Frontend
./start_frontend.sh
```

### URLs del Proyecto

- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:5000/api
- **Usuarios API:** http://localhost:5000/api/users

## 👥 Crear Usuarios de Prueba

Para poblar la base de datos con usuarios de ejemplo:

```bash
cd Backend
source venv/bin/activate
python create_test_users.py
```

## 📚 Documentación

- **[INICIO_RAPIDO.md](./INICIO_RAPIDO.md)** - Comandos rápidos de inicio
- **[GUIA_COMPLETA_INSTALACION.md](./GUIA_COMPLETA_INSTALACION.md)** - Guía detallada paso a paso

## 🛠️ Tecnologías Utilizadas

### Backend
- Flask 2.3.3
- SQLAlchemy
- Flask-CORS
- Python 3.8+

### Frontend
- React 18
- Vite
- React Router DOM
- Bootstrap 5
- React-Bootstrap
- Axios
- React Icons

## 📁 Estructura del Proyecto

```
react-proyect-2/
├── Backend/                          # Backend Flask
│   ├── app/                          # Aplicación principal
│   │   ├── business/                 # Lógica de negocio
│   │   │   ├── controllers/          # Controladores
│   │   │   └── models/               # Modelos de datos
│   │   ├── data/                     # Capa de datos
│   │   └── presentation/             # Rutas API
│   ├── requirements.txt              # Dependencias Python
│   ├── run.py                        # Punto de entrada
│   ├── start_backend.sh              # Script de inicio
│   └── create_test_users.py          # Crear usuarios de prueba
│
├── Frontend/                         # Frontend React
│   ├── src/
│   │   ├── components/               # Componentes
│   │   │   └── common/               # Componentes reutilizables
│   │   │       ├── EntityTable.jsx   # Tabla genérica
│   │   │       ├── EntityForm.jsx    # Formulario genérico
│   │   │       ├── AuthGuard.jsx     # Protección de rutas
│   │   │       └── PrivateRoute.jsx  # Rutas privadas
│   │   ├── views/                    # Vistas principales
│   │   │   ├── device/               # Gestión de dispositivos
│   │   │   ├── securityQuestion/     # Preguntas de seguridad
│   │   │   ├── answer/               # Respuestas
│   │   │   └── digitalSignature/     # Firmas digitales
│   │   └── services/                 # Servicios HTTP
│   │       ├── api.js                # Configuración Axios
│   │       └── baseService.js        # Servicios CRUD genéricos
│   ├── package.json                  # Dependencias npm
│   └── start_frontend.sh             # Script de inicio
│
├── verify_setup.py                   # Script de verificación
├── INICIO_RAPIDO.md                  # Guía rápida
├── GUIA_COMPLETA_INSTALACION.md      # Guía detallada
└── README.md                         # Este archivo
```

## ✨ Funcionalidades Implementadas

### Componentes Genéricos
- ✅ **EntityTable** - Tabla de datos reutilizable con acciones
- ✅ **EntityForm** - Formulario dinámico con validaciones
- ✅ **AuthGuard** - Protección simple de rutas
- ✅ **PrivateRoute** - Protección avanzada con spinner

### Vistas CRUD Completas
- ✅ **DeviceView** - Gestión de dispositivos
- ✅ **SecurityQuestionView** - Preguntas de seguridad
- ✅ **AnswerView** - Respuestas de usuarios
- ✅ **DigitalSignatureView** - Firmas digitales

### Servicios
- ✅ **api.js** - Configuración Axios con interceptores OAuth
- ✅ **baseService.js** - Funciones CRUD genéricas (getAll, getById, create, update, remove)

### Características
- 🔒 Autenticación y protección de rutas
- 📊 Tablas con paginación y búsqueda
- ✏️ Formularios con validaciones
- 🎨 Interfaz Bootstrap responsive
- 🔄 Manejo de errores global
- 📱 Compatible con dispositivos móviles

## 🔌 API Endpoints

### Usuarios
- `GET /api/users` - Listar usuarios
- `GET /api/users/{id}` - Obtener usuario
- `POST /api/users` - Crear usuario
- `PUT /api/users/{id}` - Actualizar usuario
- `DELETE /api/users/{id}` - Eliminar usuario

### Dispositivos
- `GET /api/devices` - Listar dispositivos
- `POST /api/devices` - Crear dispositivo
- `PUT /api/devices/{id}` - Actualizar dispositivo
- `DELETE /api/devices/{id}` - Eliminar dispositivo

### Preguntas de Seguridad
- `GET /api/security_questions` - Listar preguntas
- `POST /api/security_questions` - Crear pregunta
- `PUT /api/security_questions/{id}` - Actualizar pregunta
- `DELETE /api/security_questions/{id}` - Eliminar pregunta

### Respuestas
- `GET /api/answers` - Listar respuestas
- `POST /api/answers` - Crear respuesta
- `PUT /api/answers/{id}` - Actualizar respuesta
- `DELETE /api/answers/{id}` - Eliminar respuesta

### Firmas Digitales
- `GET /api/digital_signatures` - Listar firmas
- `POST /api/digital_signatures` - Crear firma (multipart/form-data)
- `PUT /api/digital_signatures/{id}` - Actualizar firma
- `DELETE /api/digital_signatures/{id}` - Eliminar firma

## 🛠️ Comandos Útiles

### Backend

```bash
# Activar entorno virtual
cd Backend
source venv/bin/activate  # Linux/Mac
# O en Windows: venv\Scripts\activate

# Instalar dependencias
pip install -r requirements.txt

# Ejecutar servidor
python run.py

# Crear usuarios de prueba
python create_test_users.py
```

### Frontend

```bash
# Instalar dependencias
cd Frontend
npm install

# Ejecutar servidor de desarrollo
npm run dev

# Construir para producción
npm run build

# Previsualizar build
npm run preview
```

## 🐛 Solución de Problemas

### Puerto 5000 ocupado
```bash
# Linux/Mac
lsof -ti:5000 | xargs kill -9

# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F
```

### Error CORS
Verifica que Flask-CORS esté instalado:
```bash
pip install Flask-CORS
```

### No se ven usuarios en el frontend
1. Verifica que el backend esté corriendo
2. Crea usuarios con `python create_test_users.py`
3. Verifica la URL en `src/services/api.js`
4. Revisa la consola del navegador (F12)

## 📝 Notas Importantes

- ⚠️ Este proyecto **NO modifica el backend** - Solo el frontend
- 🔒 Las validaciones del frontend son complementarias, no reemplazan las del backend
- 🌐 Usa HTTPS en producción
- 🔑 Implementa refresh tokens para mejor seguridad
- 📊 Los datos se persisten en SQLite (development) o PostgreSQL (production)

## 👨‍💻 Desarrollo

### Agregar una nueva vista

1. Crear la vista en `Frontend/src/views/`
2. Usar los componentes genéricos `EntityTable` y `EntityForm`
3. Importar servicios desde `baseService.js`
4. Agregar la ruta en tu configuración de rutas

### Agregar protección a una ruta

```jsx
import PrivateRoute from './components/common/PrivateRoute';

<Route 
  path="/mi-ruta-privada" 
  element={
    <PrivateRoute>
      <MiComponente />
    </PrivateRoute>
  } 
/>
```

## 📄 Licencia

Este proyecto es de código abierto y está disponible para uso educativo.

## 🤝 Contribuir

Las contribuciones son bienvenidas. Por favor:
1. Haz fork del proyecto
2. Crea una rama para tu feature
3. Commit tus cambios
4. Push a la rama
5. Abre un Pull Request

## 📧 Contacto

Para preguntas o soporte, abre un issue en el repositorio.

---

**Universidad de Caldas - Desarrollo Frontend**  
**Última actualización:** Octubre 2025
