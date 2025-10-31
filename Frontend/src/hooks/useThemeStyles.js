// useThemeStyles.js - Hook personalizado para obtener clases CSS según el tema activo
// Proporciona clases predefinidas para componentes comunes que se adaptan automáticamente
// a Bootstrap, Tailwind o Material UI según la preferencia del usuario

import { useTheme } from '../context/ThemeContext';

/**
 * Hook personalizado que devuelve clases CSS adaptadas al tema actual
 * @returns {object} Objeto con clases CSS para diferentes componentes
 */
export const useThemeStyles = () => {
  const { designLibrary } = useTheme();

  const getStyles = () => {
    switch (designLibrary) {
      case 'bootstrap':
        return {
          // Contenedores
          container: 'container-fluid py-4',
          containerTight: 'container py-4',
          
          // Tarjetas
          card: 'card shadow-sm border-0',
          cardHeader: 'card-header bg-white border-bottom py-3',
          cardBody: 'card-body p-4',
          cardFooter: 'card-footer bg-white border-top py-3',
          
          // Botones
          buttonPrimary: 'btn btn-primary',
          buttonSecondary: 'btn btn-secondary',
          buttonSuccess: 'btn btn-success',
          buttonDanger: 'btn btn-danger',
          buttonWarning: 'btn btn-warning',
          buttonInfo: 'btn btn-info',
          buttonOutlinePrimary: 'btn btn-outline-primary',
          buttonOutlineSecondary: 'btn btn-outline-secondary',
          buttonSm: 'btn-sm',
          buttonLg: 'btn-lg',
          
          // Alertas
          alertSuccess: 'alert alert-success shadow-sm',
          alertDanger: 'alert alert-danger shadow-sm',
          alertWarning: 'alert alert-warning shadow-sm',
          alertInfo: 'alert alert-info shadow-sm',
          alertDismissible: 'alert-dismissible fade show',
          
          // Tablas
          table: 'table table-hover',
          tableStriped: 'table table-striped table-hover',
          tableBordered: 'table table-bordered',
          
          // Formularios
          formControl: 'form-control',
          formLabel: 'form-label',
          formSelect: 'form-select',
          formCheck: 'form-check',
          
          // Badges
          badgePrimary: 'badge bg-primary',
          badgeSecondary: 'badge bg-secondary',
          badgeSuccess: 'badge bg-success',
          badgeDanger: 'badge bg-danger',
          badgeWarning: 'badge bg-warning text-dark',
          badgeInfo: 'badge bg-info',
          
          // Spinners
          spinner: 'spinner-border',
          spinnerSmall: 'spinner-border spinner-border-sm',
          
          // Modales
          modal: 'modal fade',
          modalDialog: 'modal-dialog modal-dialog-centered',
          modalContent: 'modal-content',
          modalHeader: 'modal-header',
          modalBody: 'modal-body',
          modalFooter: 'modal-footer',
          
          // Títulos
          heading1: 'h1 fw-bold',
          heading2: 'h2 fw-bold',
          heading3: 'h3 fw-bold',
          heading4: 'h4 fw-semibold',
          heading5: 'h5 fw-semibold',
          
          // Utilidades
          textMuted: 'text-muted',
          textSuccess: 'text-success',
          textDanger: 'text-danger',
          textPrimary: 'text-primary',
        };

      case 'tailwind':
        return {
          // Contenedores
          container: 'container mx-auto py-6 px-4',
          containerTight: 'container mx-auto py-6 px-4 max-w-7xl',
          
          // Tarjetas
          card: 'bg-white rounded-lg shadow-md',
          cardHeader: 'bg-gray-50 border-b px-6 py-4 rounded-t-lg',
          cardBody: 'p-6',
          cardFooter: 'bg-gray-50 border-t px-6 py-4 rounded-b-lg',
          
          // Botones
          buttonPrimary: 'bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded font-medium transition-colors',
          buttonSecondary: 'bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded font-medium transition-colors',
          buttonSuccess: 'bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded font-medium transition-colors',
          buttonDanger: 'bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded font-medium transition-colors',
          buttonWarning: 'bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded font-medium transition-colors',
          buttonInfo: 'bg-cyan-500 hover:bg-cyan-600 text-white px-4 py-2 rounded font-medium transition-colors',
          buttonOutlinePrimary: 'border-2 border-blue-500 text-blue-500 hover:bg-blue-50 px-4 py-2 rounded font-medium transition-colors',
          buttonOutlineSecondary: 'border border-gray-300 hover:bg-gray-100 px-4 py-2 rounded font-medium transition-colors',
          buttonSm: 'px-3 py-1.5 text-sm',
          buttonLg: 'px-6 py-3 text-lg',
          
          // Alertas
          alertSuccess: 'bg-green-100 border-l-4 border-green-500 text-green-800 p-4 rounded',
          alertDanger: 'bg-red-100 border-l-4 border-red-500 text-red-800 p-4 rounded',
          alertWarning: 'bg-yellow-100 border-l-4 border-yellow-500 text-yellow-800 p-4 rounded',
          alertInfo: 'bg-blue-100 border-l-4 border-blue-500 text-blue-800 p-4 rounded',
          alertDismissible: 'relative',
          
          // Tablas
          table: 'min-w-full divide-y divide-gray-200',
          tableStriped: 'min-w-full divide-y divide-gray-200',
          tableBordered: 'min-w-full border border-gray-300',
          
          // Formularios
          formControl: 'w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500',
          formLabel: 'block text-gray-700 text-sm font-bold mb-2',
          formSelect: 'w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500',
          formCheck: 'flex items-center',
          
          // Badges
          badgePrimary: 'px-2 py-1 rounded-full text-xs font-semibold bg-blue-500 text-white',
          badgeSecondary: 'px-2 py-1 rounded-full text-xs font-semibold bg-gray-500 text-white',
          badgeSuccess: 'px-2 py-1 rounded-full text-xs font-semibold bg-green-500 text-white',
          badgeDanger: 'px-2 py-1 rounded-full text-xs font-semibold bg-red-500 text-white',
          badgeWarning: 'px-2 py-1 rounded-full text-xs font-semibold bg-yellow-500 text-white',
          badgeInfo: 'px-2 py-1 rounded-full text-xs font-semibold bg-cyan-500 text-white',
          
          // Spinners
          spinner: 'animate-spin rounded-full h-8 w-8 border-4 border-green-500 border-t-transparent',
          spinnerSmall: 'animate-spin rounded-full h-5 w-5 border-2 border-green-500 border-t-transparent',
          
          // Modales
          modal: 'fixed inset-0 z-50 overflow-auto bg-black bg-opacity-50 flex items-center justify-center',
          modalDialog: 'relative w-full max-w-lg',
          modalContent: 'bg-white rounded-lg shadow-xl',
          modalHeader: 'px-6 py-4 border-b',
          modalBody: 'p-6',
          modalFooter: 'px-6 py-4 border-t flex justify-end gap-2',
          
          // Títulos
          heading1: 'text-4xl font-bold',
          heading2: 'text-3xl font-bold',
          heading3: 'text-2xl font-bold',
          heading4: 'text-xl font-semibold',
          heading5: 'text-lg font-semibold',
          
          // Utilidades
          textMuted: 'text-gray-600',
          textSuccess: 'text-green-600',
          textDanger: 'text-red-600',
          textPrimary: 'text-blue-600',
        };

      case 'material':
        return {
          // Contenedores
          container: 'container mx-auto py-8 px-6',
          containerTight: 'container mx-auto py-8 px-6 max-w-7xl',
          
          // Tarjetas
          card: 'bg-white rounded-lg shadow-lg',
          cardHeader: 'bg-gray-100 border-b-2 px-8 py-5 rounded-t-lg',
          cardBody: 'p-8',
          cardFooter: 'bg-gray-100 border-t-2 px-8 py-5 rounded-b-lg',
          
          // Botones
          buttonPrimary: 'bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-md font-medium uppercase text-sm shadow-md hover:shadow-lg transition-all',
          buttonSecondary: 'bg-gray-600 hover:bg-gray-700 text-white px-6 py-2.5 rounded-md font-medium uppercase text-sm shadow-md hover:shadow-lg transition-all',
          buttonSuccess: 'bg-green-600 hover:bg-green-700 text-white px-6 py-2.5 rounded-md font-medium uppercase text-sm shadow-md hover:shadow-lg transition-all',
          buttonDanger: 'bg-red-600 hover:bg-red-700 text-white px-6 py-2.5 rounded-md font-medium uppercase text-sm shadow-md hover:shadow-lg transition-all',
          buttonWarning: 'bg-yellow-600 hover:bg-yellow-700 text-white px-6 py-2.5 rounded-md font-medium uppercase text-sm shadow-md hover:shadow-lg transition-all',
          buttonInfo: 'bg-cyan-600 hover:bg-cyan-700 text-white px-6 py-2.5 rounded-md font-medium uppercase text-sm shadow-md hover:shadow-lg transition-all',
          buttonOutlinePrimary: 'border-2 border-blue-600 text-blue-600 hover:bg-blue-50 px-6 py-2.5 rounded-md font-medium uppercase text-sm transition-all',
          buttonOutlineSecondary: 'border-2 border-gray-400 hover:bg-gray-50 px-6 py-2.5 rounded-md font-medium uppercase text-sm transition-all',
          buttonSm: 'px-4 py-2 text-xs',
          buttonLg: 'px-8 py-3 text-base',
          
          // Alertas
          alertSuccess: 'bg-green-50 border-l-4 border-green-600 text-green-900 p-6 rounded shadow-sm',
          alertDanger: 'bg-red-50 border-l-4 border-red-600 text-red-900 p-6 rounded shadow-sm',
          alertWarning: 'bg-yellow-50 border-l-4 border-yellow-600 text-yellow-900 p-6 rounded shadow-sm',
          alertInfo: 'bg-blue-50 border-l-4 border-blue-600 text-blue-900 p-6 rounded shadow-sm',
          alertDismissible: 'relative',
          
          // Tablas
          table: 'min-w-full divide-y-2 divide-gray-300',
          tableStriped: 'min-w-full divide-y-2 divide-gray-300',
          tableBordered: 'min-w-full border-2 border-gray-300',
          
          // Formularios
          formControl: 'w-full px-4 py-3 border-b-2 border-gray-300 focus:outline-none focus:border-green-600 transition-colors',
          formLabel: 'block text-gray-700 text-sm font-bold mb-2 uppercase',
          formSelect: 'w-full px-4 py-3 border-b-2 border-gray-300 focus:outline-none focus:border-green-600 transition-colors',
          formCheck: 'flex items-center',
          
          // Badges
          badgePrimary: 'px-3 py-1 rounded text-xs font-semibold bg-blue-600 text-white',
          badgeSecondary: 'px-3 py-1 rounded text-xs font-semibold bg-gray-600 text-white',
          badgeSuccess: 'px-3 py-1 rounded text-xs font-semibold bg-green-600 text-white',
          badgeDanger: 'px-3 py-1 rounded text-xs font-semibold bg-red-600 text-white',
          badgeWarning: 'px-3 py-1 rounded text-xs font-semibold bg-yellow-600 text-white',
          badgeInfo: 'px-3 py-1 rounded text-xs font-semibold bg-cyan-600 text-white',
          
          // Spinners
          spinner: 'animate-spin rounded-full h-12 w-12 border-4 border-green-600 border-t-transparent',
          spinnerSmall: 'animate-spin rounded-full h-6 w-6 border-2 border-green-600 border-t-transparent',
          
          // Modales
          modal: 'fixed inset-0 z-50 overflow-auto bg-black bg-opacity-60 flex items-center justify-center',
          modalDialog: 'relative w-full max-w-2xl',
          modalContent: 'bg-white rounded-lg shadow-2xl',
          modalHeader: 'px-8 py-6 border-b-2',
          modalBody: 'p-8',
          modalFooter: 'px-8 py-6 border-t-2 flex justify-end gap-3',
          
          // Títulos
          heading1: 'text-5xl font-bold',
          heading2: 'text-4xl font-bold',
          heading3: 'text-3xl font-bold',
          heading4: 'text-2xl font-bold',
          heading5: 'text-xl font-bold',
          
          // Utilidades
          textMuted: 'text-gray-700',
          textSuccess: 'text-green-700',
          textDanger: 'text-red-700',
          textPrimary: 'text-blue-700',
        };

      default:
        return getStyles(); // Fallback a bootstrap
    }
  };

  return getStyles();
};

export default useThemeStyles;
