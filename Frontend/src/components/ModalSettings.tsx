import { useState } from "react";
import { Form, Row, Col, Alert, Badge } from 'react-bootstrap';
import GenericModal from './GenericModal';
import dataJSON from '../../public/data.json';

interface ModalProps {
  closeModal: () => void;
  onSubmit: (formData: FormState) => void;
  defaultValue?: FormState;
}

interface FormState {
  id: string;
  para: string;
  criterion: string;
  value: string;
  type: string;
}

export const Modal: React.FC<ModalProps> = ({ closeModal, onSubmit, defaultValue }) => {
  const fields = Object.keys(Object.values(dataJSON)[0]).filter((item: string) => !item.startsWith("delta_"));
  
  const [formState, setFormState] = useState<FormState>(
    defaultValue || {
      id: "",
      para: "price",
      criterion: "0",
      value: "",
      type: "0",
    }
  );
  const [errors, setErrors] = useState<string[]>([]);

  const validateForm = (): boolean => {
    if (formState.id && formState.value) {
      setErrors([]);
      return true;
    } else {
      const errorFields: string[] = [];
      for (const [key, value] of Object.entries(formState)) {
        if (!value) {
          errorFields.push(key === "id" ? "Bond ID" : key);
        } else {
          if (key === 'id') {
            if (!(Object.keys(dataJSON).includes(value) || value === "ALL")) {
              errorFields.push("INVALID_ID_" + value);
            }
          }
        }
      }
      setErrors(errorFields);
      return false;
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    // Si cambia el parámetro a 'rating' y el criterio es 2 o 3, resetear a 0
    if (name === "para" && value === 'rating' && 
        parseInt(formState.criterion) > 1 && parseInt(formState.criterion) < 4) {
      setFormState(prev => ({ ...prev, criterion: "0", [name]: value }));
    } else {
      setFormState(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = () => {
    if (!validateForm()) return;

    onSubmit(formState);
    closeModal();
  };

  // Obtener el texto del criterio
  const getCriterionText = (criterion: string): string => {
    switch (criterion) {
      case "0": return "goes down by";
      case "1": return "goes up by";
      case "2": return "is smaller than";
      case "3": return "is greater than";
      case "4": return "is equal to";
      default: return "";
    }
  };

  // Obtener el tipo de alerta y color
  const getAlertTypeInfo = (type: string): { label: string; bg: string; variant: 'success' | 'warning' | 'danger' } => {
    switch (type) {
      case "0": return { label: "Info", bg: "bg-success", variant: "success" };
      case "1": return { label: "Warning", bg: "bg-warning", variant: "warning" };
      case "2": return { label: "Alert", bg: "bg-danger", variant: "danger" };
      default: return { label: "Info", bg: "bg-success", variant: "success" };
    }
  };

  const invalidIdErrors = errors.filter(item => item.startsWith("INVALID_ID"));
  const otherErrors = errors.filter(item => !item.startsWith("INVALID_ID"));
  const alertTypeInfo = getAlertTypeInfo(formState.type);

  return (
    <GenericModal
      show={true}
      onHide={closeModal}
      title="Configuración de Alerta de Bonos"
      size="lg"
      centered
      showFooter
      primaryButton={{
        label: "Guardar Alerta",
        onClick: handleSubmit,
        variant: "success"
      }}
      secondaryButton={{
        label: "Cancelar",
        onClick: closeModal,
        variant: "outline-secondary"
      }}
    >
      <Form>
        {/* Errores de validación */}
        {invalidIdErrors.length > 0 && (
          <Alert variant="danger" className="mb-3">
            <strong>{invalidIdErrors[0].replace("INVALID_ID_", "")}</strong> no es un bono válido
          </Alert>
        )}
        
        {otherErrors.length > 0 && (
          <Alert variant="warning" className="mb-3">
            Por favor, complete los siguientes campos: <strong>{otherErrors.join(", ")}</strong>
          </Alert>
        )}

        <Row className="g-3">
          {/* Bond ID */}
          <Col xs={12}>
            <Form.Group>
              <Form.Label className="fw-medium">
                Bond ID 
                <small className="text-muted ms-2">(Ingrese "ALL" para rastrear todos los bonos)</small>
              </Form.Label>
              <Form.Control
                type="text"
                name="id"
                value={formState.id}
                onChange={handleChange}
                placeholder="Ej: BOND001 o ALL"
                className="shadow-sm"
                isInvalid={errors.includes("Bond ID") || invalidIdErrors.length > 0}
              />
            </Form.Group>
          </Col>

          {/* Parámetro */}
          <Col md={4}>
            <Form.Group>
              <Form.Label className="fw-medium">Parámetro</Form.Label>
              <div className="position-relative">
                <Badge 
                  bg="secondary" 
                  className="position-absolute top-50 start-0 translate-middle-y ms-2 z-1"
                  style={{ pointerEvents: 'none' }}
                >
                  {formState.para}
                </Badge>
                <Form.Select
                  name="para"
                  value={formState.para}
                  onChange={handleChange}
                  className="shadow-sm ps-5"
                >
                  {fields.map((item: string, idx: number) => (
                    <option key={idx} value={item}>
                      {item}
                    </option>
                  ))}
                </Form.Select>
              </div>
            </Form.Group>
          </Col>

          {/* Criterio */}
          <Col md={4}>
            <Form.Group>
              <Form.Label className="fw-medium">Criterio</Form.Label>
              <div className="position-relative">
                <Badge 
                  bg="info" 
                  className="position-absolute top-50 start-0 translate-middle-y ms-2 z-1 text-truncate"
                  style={{ pointerEvents: 'none', maxWidth: '70%' }}
                >
                  {getCriterionText(formState.criterion)}
                </Badge>
                <Form.Select
                  name="criterion"
                  value={formState.criterion}
                  onChange={handleChange}
                  className="shadow-sm"
                  style={{ paddingLeft: '140px' }}
                >
                  <option value="0">goes down by</option>
                  <option value="1">goes up by</option>
                  {formState.para !== 'rating' && <option value="2">is smaller than</option>}
                  {formState.para !== 'rating' && <option value="3">is greater than</option>}
                  <option value="4">is equal to</option>
                </Form.Select>
              </div>
            </Form.Group>
          </Col>

          {/* Valor */}
          <Col md={4}>
            <Form.Group>
              <Form.Label className="fw-medium">Valor para Alerta</Form.Label>
              <Form.Control
                type="text"
                name="value"
                value={formState.value}
                onChange={handleChange}
                placeholder="Ingrese valor"
                className="shadow-sm"
                isInvalid={errors.includes("value")}
              />
            </Form.Group>
          </Col>

          {/* Tipo de Alerta */}
          <Col xs={12}>
            <Form.Group>
              <Form.Label className="fw-medium">Tipo de Alerta</Form.Label>
              <div className="position-relative">
                <Badge 
                  bg={alertTypeInfo.variant}
                  className="position-absolute top-50 start-0 translate-middle-y ms-2 z-1 text-white"
                  style={{ pointerEvents: 'none' }}
                >
                  {alertTypeInfo.label}
                </Badge>
                <Form.Select
                  name="type"
                  value={formState.type}
                  onChange={handleChange}
                  className="shadow-sm ps-5"
                >
                  <option value="0">Info</option>
                  <option value="1">Warning</option>
                  <option value="2">Alert</option>
                </Form.Select>
              </div>
            </Form.Group>
          </Col>
        </Row>
      </Form>
    </GenericModal>
  );
};