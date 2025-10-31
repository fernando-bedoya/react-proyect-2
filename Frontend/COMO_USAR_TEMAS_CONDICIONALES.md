# 🎨 Cómo Usar Condicionales para Cambiar Estilos según el Tema

## Resumen Ejecutivo

**Problema**: Quieres que cuando el usuario elija "Material", "Bootstrap" o "Tailwind", los componentes cambien su apariencia visual pero sigan siendo el mismo componente y manteniendo la misma funcionalidad.

**Solución**: Usar el contexto de tema (`useTheme()`) para renderizar condicionalmente diferentes estilos o componentes según el tema activo.

---

## 🚀 Solución Rápida (3 pasos)

### 1️⃣ Importar el hook de tema

```tsx
import { useTheme } from '../../context/ThemeContext';

const MiComponente = () => {
    const { designLibrary } = useTheme(); // 'bootstrap', 'tailwind', o 'material'
    
    // ... resto del código
};
```

### 2️⃣ Crear renderizado condicional

```tsx
const renderContent = () => {
    if (designLibrary === 'bootstrap') {
        return <ComponenteBootstrap />;
    } else if (designLibrary === 'tailwind') {
        return <ComponenteTailwind />;
    } else {
        return <ComponenteMaterial />;
    }
};

return renderContent();
```

### 3️⃣ O usar clases condicionales

```tsx
const buttonClass = designLibrary === 'bootstrap' 
    ? 'btn btn-success' 
    : designLibrary === 'tailwind'
    ? 'bg-green-500 text-white px-4 py-2 rounded'
    : 'bg-green-600 text-white px-6 py-3 rounded-md shadow-md';

return <button className={buttonClass}>Click me</button>;
```

---

## 📝 Ejemplo Real: Botón que se adapta al tema

```tsx
import React from 'react';
import { Button as BsButton } from 'react-bootstrap';
import { useTheme } from '../context/ThemeContext';

const MiBoton = ({ onClick, children }) => {
    const { designLibrary } = useTheme();

    // Bootstrap: usa componentes de react-bootstrap
    if (designLibrary === 'bootstrap') {
        return (
            <BsButton variant="success" onClick={onClick}>
                {children}
            </BsButton>
        );
    }

    // Tailwind: usa botón HTML con clases de Tailwind
    if (designLibrary === 'tailwind') {
        return (
            <button 
                onClick={onClick}
                className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
            >
                {children}
            </button>
        );
    }

    // Material: usa botón HTML con estilo Material Design
    return (
        <button 
            onClick={onClick}
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-md shadow-md uppercase"
        >
            {children}
        </button>
    );
};

export default MiBoton;
```

**Resultado**: El mismo componente `<MiBoton>` se ve diferente según el tema, pero la funcionalidad (`onClick`) siempre funciona igual.

---

## 🎯 Los 3 Métodos Principales

### Método 1: Renderizado Completamente Condicional
**Cuándo**: Cuando cada framework usa componentes muy diferentes

```tsx
const MiVista = () => {
    const { designLibrary } = useTheme();

    if (designLibrary === 'bootstrap') {
        return (
            <Container>
                <Card>
                    <Card.Body>Contenido Bootstrap</Card.Body>
                </Card>
            </Container>
        );
    }

    if (designLibrary === 'tailwind') {
        return (
            <div className="container mx-auto">
                <div className="bg-white rounded-lg shadow-md p-6">
                    Contenido Tailwind
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto">
            <div className="bg-white rounded-lg shadow-lg p-8">
                Contenido Material
            </div>
        </div>
    );
};
```

### Método 2: Clases Condicionales con Función Helper
**Cuándo**: Cuando solo cambias clases CSS

```tsx
const MiVista = () => {
    const { designLibrary } = useTheme();

    const getClasses = () => {
        switch (designLibrary) {
            case 'bootstrap':
                return { card: 'card shadow-sm', button: 'btn btn-success' };
            case 'tailwind':
                return { card: 'bg-white rounded-lg shadow-md', button: 'bg-green-500 text-white px-4 py-2 rounded' };
            case 'material':
                return { card: 'bg-white rounded-lg shadow-lg', button: 'bg-green-600 text-white px-6 py-3 rounded-md' };
        }
    };

    const classes = getClasses();

    return (
        <div className={classes.card}>
            <button className={classes.button}>Click me</button>
        </div>
    );
};
```

### Método 3: Componente Wrapper Reutilizable
**Cuándo**: Para elementos que usas mucho (botones, inputs, cards)

```tsx
// AdaptiveButton.tsx
const AdaptiveButton = ({ variant, onClick, children }) => {
    const { designLibrary } = useTheme();

    if (designLibrary === 'bootstrap') {
        return <BsButton variant={variant} onClick={onClick}>{children}</BsButton>;
    }

    const tailwindClasses = variant === 'success' 
        ? 'bg-green-500 hover:bg-green-600' 
        : 'bg-blue-500 hover:bg-blue-600';

    return (
        <button className={`${tailwindClasses} text-white px-4 py-2 rounded`} onClick={onClick}>
            {children}
        </button>
    );
};

// Usar en cualquier parte
<AdaptiveButton variant="success" onClick={handleSave}>
    Guardar
</AdaptiveButton>
```

---

## 💡 Ventajas de este Enfoque

✅ **Un solo componente**: No necesitas crear 3 versiones separadas  
✅ **Misma lógica**: Los eventos, estados y funciones no cambian  
✅ **Fácil mantenimiento**: Cambias la lógica en un solo lugar  
✅ **Cambio dinámico**: El usuario puede cambiar el tema en tiempo real  
✅ **TypeScript friendly**: Todo tipado correctamente  

---

## 📂 Archivos de Referencia en tu Proyecto

1. **`Frontend/src/pages/Users/List.tsx`**  
   → Ejemplo completo de renderizado condicional en una vista CRUD

2. **`Frontend/src/components/AdaptiveButton.tsx`**  
   → Componente wrapper reutilizable para botones adaptativos

3. **`Frontend/src/components/EjemploAdaptiveButton.tsx`**  
   → Página de demostración con ejemplos de uso

4. **`Frontend/src/context/ThemeContext.tsx`**  
   → Contexto que maneja el tema activo

5. **`Frontend/src/components/ThemeSelector.tsx`**  
   → Selector de tema (dropdown)

---

## 🔍 Ver en Acción

1. Navega a `http://localhost:5173/users/list`
2. Usa el selector de tema (arriba a la derecha)
3. Cambia entre Bootstrap, Tailwind y Material
4. Observa cómo los mismos datos se muestran con diferentes estilos

---

## 🎓 Conceptos Clave

- **El tema se guarda en `localStorage`**: Persiste entre sesiones
- **`useTheme()` devuelve el tema actual**: Puedes usarlo en cualquier componente
- **Solo cambia la vista, no la lógica**: `useState`, `useEffect`, `onClick`, etc. funcionan igual
- **No afecta el rendimiento**: React es muy eficiente con renderizado condicional

---

## 📚 Documentación Adicional

- **Guía completa**: `Frontend/GUIA_TEMAS_CONDICIONALES.md`
- **Contexto de tema**: `Frontend/src/context/ThemeContext.tsx`

---

## ❓ Preguntas Frecuentes

**P: ¿Tengo que cambiar todos mis componentes?**  
R: No. Puedes ir cambiándolos gradualmente. Los componentes sin condicionales seguirán funcionando.

**P: ¿Puedo mezclar estilos de diferentes frameworks?**  
R: Sí, pero no es recomendado. Es mejor mantener consistencia en cada tema.

**P: ¿Funciona con componentes externos?**  
R: Sí. Puedes wrappear cualquier componente de terceros (Material-UI, Ant Design, etc.)

**P: ¿Qué pasa si no uso el condicional?**  
R: El componente seguirá funcionando, pero no cambiará de estilo al cambiar el tema.

---

## 🚀 Siguiente Paso

Prueba modificar uno de tus componentes para que se adapte al tema. Empieza con algo simple como un botón o una tarjeta, y luego expande a componentes más complejos.

**Sugerencia**: Crea componentes wrapper para elementos que uses mucho (botones, inputs, cards) y úsalos en toda tu aplicación. Así solo cambias el estilo en un lugar.
