import React, { useRef, useState } from 'react';
import { Upload, X, Image as ImageIcon } from 'lucide-react';

/**
 * GenericImageUpload - Componente reutilizable para seleccionar y previsualizar imágenes
 * 
 * Este componente proporciona:
 * 1. Botón de selección de archivo con diseño personalizable
 * 2. Vista previa de la imagen seleccionada
 * 3. Botón para remover la imagen seleccionada
 * 4. Validación de tipo de archivo (solo imágenes)
 * 5. Drag & Drop opcional para arrastrar archivos
 * 
 * Uso:
 * <GenericImageUpload
 *   onImageSelect={(file) => setSelectedFile(file)}
 *   currentImageUrl={user.photoUrl}
 *   label="Foto de Perfil"
 * />
 */

interface GenericImageUploadProps {
  /** Callback cuando se selecciona una imagen */
  onImageSelect: (file: File | null) => void;
  
  /** URL de la imagen actual (si existe) para mostrar preview */
  currentImageUrl?: string;
  
  /** Texto del label/título del componente */
  label?: string;
  
  /** Texto del botón de selección */
  buttonText?: string;
  
  /** Tipos de archivo aceptados (por defecto: imágenes) */
  acceptedTypes?: string;
  
  /** Tamaño máximo en MB (por defecto: 5MB) */
  maxSizeMB?: number;
  
  /** Texto de ayuda/descripción */
  helpText?: string;
  
  /** Mostrar preview circular (útil para fotos de perfil) */
  circularPreview?: boolean;
  
  /** Clase CSS adicional para el contenedor */
  className?: string;
}

const GenericImageUpload: React.FC<GenericImageUploadProps> = ({
  onImageSelect,
  currentImageUrl,
  label = 'Seleccionar Imagen',
  buttonText = 'Elegir Archivo',
  acceptedTypes = 'image/*',
  maxSizeMB = 5,
  helpText = 'Formatos aceptados: JPG, PNG, GIF. Tamaño máximo: 5MB',
  circularPreview = false,
  className = '',
}) => {
  // Referencia al input file (oculto)
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Estado local para la imagen seleccionada y su preview
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  /**
   * Valida el archivo seleccionado
   * Comprueba el tipo y tamaño del archivo
   */
  const validateFile = (file: File): string | null => {
    // Validar tipo de archivo
    if (!file.type.startsWith('image/')) {
      return 'Por favor selecciona un archivo de imagen válido (JPG, PNG, GIF)';
    }
    
    // Validar tamaño (convertir a MB)
    const fileSizeMB = file.size / (1024 * 1024);
    if (fileSizeMB > maxSizeMB) {
      return `El archivo es demasiado grande. Tamaño máximo: ${maxSizeMB}MB`;
    }
    
    return null; // Sin errores
  };

  /**
   * Maneja la selección de archivo
   * Valida, crea preview y notifica al componente padre
   */
  const handleFileSelect = (file: File | null) => {
    setError(null);
    
    if (!file) {
      // Si no hay archivo, limpiar todo
      setSelectedFile(null);
      setPreviewUrl(null);
      onImageSelect(null);
      return;
    }
    
    // Validar el archivo
    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }
    
    // Crear URL temporal para preview
    const objectUrl = URL.createObjectURL(file);
    
    // Actualizar estados
    setSelectedFile(file);
    setPreviewUrl(objectUrl);
    
    // Notificar al componente padre
    onImageSelect(file);
  };

  /**
   * Maneja el cambio en el input file
   */
  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    handleFileSelect(file);
  };

  /**
   * Maneja el evento de drag over (necesario para drop)
   */
  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
  };

  /**
   * Maneja el evento de soltar archivo
   */
  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    
    const file = event.dataTransfer.files?.[0] || null;
    handleFileSelect(file);
  };

  /**
   * Abre el selector de archivos
   */
  const openFileSelector = () => {
    fileInputRef.current?.click();
  };

  /**
   * Limpia la imagen seleccionada
   */
  const clearSelection = () => {
    handleFileSelect(null);
    // Limpiar el input para permitir seleccionar el mismo archivo de nuevo
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Determinar qué imagen mostrar (nueva seleccionada o actual)
  const displayImageUrl = previewUrl || currentImageUrl;
  const hasImage = !!displayImageUrl;

  return (
    <div className={`mb-4 ${className}`}>
      {/* Label con colores visibles */}
      {label && (
        <label className="form-label fw-semibold d-block mb-2 text-gray-700 dark:text-gray-300">
          <ImageIcon size={18} className="me-2 inline-block" style={{ verticalAlign: 'middle' }} />
          {label}
        </label>
      )}

      {/* Input file oculto */}
      <input
        ref={fileInputRef}
        type="file"
        accept={acceptedTypes}
        onChange={handleInputChange}
        style={{ display: 'none' }}
      />

      {/* Área de drop y preview con estilos visibles en cualquier tema */}
      <div
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-3 p-4 text-center transition-all cursor-pointer ${
          hasImage 
            ? 'border-success bg-gray-50 dark:bg-gray-800' 
            : 'border-gray-400 dark:border-gray-600 bg-white dark:bg-gray-900 hover:border-gray-500 dark:hover:border-gray-500'
        }`}
        style={{ 
          minHeight: '200px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center'
        }}
        // Hacer el área siempre clicable para permitir reemplazar la imagen
        onClick={openFileSelector}
      >
        {hasImage ? (
          // Preview de la imagen
          <div className="position-relative">
            <img
              src={displayImageUrl}
              alt="Preview"
              className={circularPreview ? 'rounded-circle' : 'rounded'}
              style={{
                maxWidth: '100%',
                maxHeight: '200px',
                objectFit: 'cover',
                ...(circularPreview && {
                  width: '150px',
                  height: '150px'
                })
              }}
            />
            {/* Botón para remover imagen con colores consistentes */}
            <button
              className="position-absolute top-0 end-0 m-2 rounded-circle bg-red-500 hover:bg-red-600 text-white transition-all flex items-center justify-center"
              style={{ 
                width: '32px', 
                height: '32px', 
                padding: 0
              }}
              onClick={(e) => {
                e.stopPropagation();
                clearSelection();
              }}
            >
              <X size={18} />
            </button>
            {/* Botón para reemplazar la imagen sin necesidad de eliminarla primero */}
            <button
              className="position-absolute bottom-0 start-50 translate-middle-x mb-2 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-md transition-all"
              onClick={(e) => {
                e.stopPropagation();
                openFileSelector();
              }}
              title="Cambiar imagen"
            >
              Cambiar
            </button>
          </div>
        ) : (
          // Área de selección vacía con colores visibles
          <div>
            <Upload size={48} className="text-gray-400 dark:text-gray-500 mb-3" />
            <p className="text-gray-600 dark:text-gray-400 mb-3">
              Arrastra una imagen aquí o haz clic para seleccionar
            </p>
            <button 
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold transition-all flex items-center gap-2"
              onClick={(e) => {
                e.stopPropagation();
                openFileSelector();
              }}
            >
              <Upload size={16} />
              {buttonText}
            </button>
          </div>
        )}
      </div>

      {/* Texto de ayuda con colores visibles */}
      {helpText && !error && (
        <small className="text-gray-600 dark:text-gray-400 d-block mt-2">
          ℹ️ {helpText}
        </small>
      )}

      {/* Mensaje de error con color visible */}
      {error && (
        <small className="text-red-600 dark:text-red-400 d-block mt-2 font-semibold">
          ⚠️ {error}
        </small>
      )}

      {/* Información del archivo seleccionado con colores visibles */}
      {selectedFile && !error && (
        <div className="mt-3 p-3 bg-green-50 dark:bg-green-900 border border-green-200 dark:border-green-700 rounded-lg">
          <small className="text-green-700 dark:text-green-200">
            ✓ Archivo seleccionado: <strong>{selectedFile.name}</strong>
            <br />
            Tamaño: {(selectedFile.size / 1024).toFixed(2)} KB
          </small>
        </div>
      )}
    </div>
  );
};

export default GenericImageUpload;
