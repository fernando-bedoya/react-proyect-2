// AdaptiveButton.tsx - Botón que se adapta automáticamente al tema seleccionado
// Ejemplo de componente wrapper reutilizable para mostrar cómo un mismo componente
// puede cambiar su apariencia visual según el tema (Bootstrap, Tailwind o Material)
// manteniendo la misma funcionalidad y API

import React from 'react';
import { Button as BsButton } from 'react-bootstrap';
import { useTheme } from '../context/ThemeContext';

interface AdaptiveButtonProps {
    children: React.ReactNode;
    onClick?: () => void;
    variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info';
    size?: 'sm' | 'md' | 'lg';
    disabled?: boolean;
    type?: 'button' | 'submit' | 'reset';
    className?: string;
}

/**
 * Componente de botón adaptable que cambia su estilo según el tema activo
 * @param children - Contenido del botón
 * @param onClick - Función a ejecutar al hacer clic
 * @param variant - Variante de color (primary, secondary, success, danger, warning, info)
 * @param size - Tamaño del botón (sm, md, lg)
 * @param disabled - Si el botón está deshabilitado
 * @param type - Tipo de botón HTML
 * @param className - Clases CSS adicionales
 */
const AdaptiveButton: React.FC<AdaptiveButtonProps> = ({
    children,
    onClick,
    variant = 'primary',
    size = 'md',
    disabled = false,
    type = 'button',
    className = ''
}) => {
    const { designLibrary } = useTheme();

    // Obtener clases según el tema y la variante
    const getThemeClasses = () => {
        // Clases base según el tamaño
        const sizeClasses = {
            bootstrap: {
                sm: 'btn-sm',
                md: '',
                lg: 'btn-lg'
            },
            tailwind: {
                sm: 'px-3 py-1.5 text-sm',
                md: 'px-4 py-2',
                lg: 'px-6 py-3 text-lg'
            },
            material: {
                sm: 'px-4 py-2 text-xs',
                md: 'px-6 py-2.5 text-sm',
                lg: 'px-8 py-3 text-base'
            }
        };

        // Clases de color según la variante
        const variantClasses = {
            bootstrap: {
                primary: 'btn-primary',
                secondary: 'btn-secondary',
                success: 'btn-success',
                danger: 'btn-danger',
                warning: 'btn-warning',
                info: 'btn-info'
            },
            tailwind: {
                primary: 'bg-blue-500 hover:bg-blue-600 text-white',
                secondary: 'bg-gray-500 hover:bg-gray-600 text-white',
                success: 'bg-green-500 hover:bg-green-600 text-white',
                danger: 'bg-red-500 hover:bg-red-600 text-white',
                warning: 'bg-yellow-500 hover:bg-yellow-600 text-white',
                info: 'bg-cyan-500 hover:bg-cyan-600 text-white'
            },
            material: {
                primary: 'bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg',
                secondary: 'bg-gray-600 hover:bg-gray-700 text-white shadow-md hover:shadow-lg',
                success: 'bg-green-600 hover:bg-green-700 text-white shadow-md hover:shadow-lg',
                danger: 'bg-red-600 hover:bg-red-700 text-white shadow-md hover:shadow-lg',
                warning: 'bg-yellow-600 hover:bg-yellow-700 text-white shadow-md hover:shadow-lg',
                info: 'bg-cyan-600 hover:bg-cyan-700 text-white shadow-md hover:shadow-lg'
            }
        };

        if (designLibrary === 'bootstrap') {
            return `btn ${variantClasses.bootstrap[variant]} ${sizeClasses.bootstrap[size]}`;
        } else if (designLibrary === 'tailwind') {
            return `${variantClasses.tailwind[variant]} ${sizeClasses.tailwind[size]} rounded font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed`;
        } else {
            return `${variantClasses.material[variant]} ${sizeClasses.material[size]} rounded-md font-medium uppercase transition-all disabled:opacity-50 disabled:cursor-not-allowed`;
        }
    };

    // Bootstrap usa componentes de react-bootstrap
    if (designLibrary === 'bootstrap') {
        // Bootstrap solo acepta 'sm' y 'lg', 'md' es el tamaño por defecto
        const bsSize = size === 'md' ? undefined : size;
        
        return (
            <BsButton
                variant={variant}
                size={bsSize}
                onClick={onClick}
                disabled={disabled}
                type={type}
                className={className}
            >
                {children}
            </BsButton>
        );
    }

    // Tailwind y Material usan botones HTML nativos con clases CSS
    return (
        <button
            type={type}
            onClick={onClick}
            disabled={disabled}
            className={`${getThemeClasses()} ${className}`}
        >
            {children}
        </button>
    );
};

export default AdaptiveButton;
