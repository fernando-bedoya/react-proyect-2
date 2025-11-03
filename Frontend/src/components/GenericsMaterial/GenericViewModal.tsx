import React from 'react';
import { Modal, Button, Badge } from 'react-bootstrap';

type Field = {
  label: string;
  key: string;
  render?: (value: any, data?: any) => React.ReactNode;
};

interface GenericViewModalProps {
  show: boolean;
  onClose: () => void;
  title?: string;
  data?: any | null;
  fields?: Field[];
  emptyLabel?: string;
}

const isPrimitive = (v: any) => {
  return v === null || v === undefined || typeof v === 'string' || typeof v === 'number' || typeof v === 'boolean';
};

const GenericViewModal: React.FC<GenericViewModalProps> = ({ show, onClose, title = '', data = null, fields, emptyLabel = '—' }) => {
  const renderValue = (value: any) => {
    if (value == null) return emptyLabel;
    if (Array.isArray(value)) {
      if (value.length === 0) return <span className="text-muted">No tiene elementos</span>;
      return (
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {value.map((v, i) => (
            <Badge key={v?.id ?? i} bg="secondary" className="me-1 mb-1">{v?.name ?? String(v)}</Badge>
          ))}
        </div>
      );
    }
    if (isPrimitive(value)) return String(value);
    // fallback: show JSON for objects
    try {
      return <pre style={{ whiteSpace: 'pre-wrap', margin: 0 }}>{JSON.stringify(value, null, 2)}</pre>;
    } catch (e) {
      return String(value);
    }
  };

  const effectiveFields: Field[] = fields && fields.length > 0 ? fields : (
    data ? Object.keys(data).map(k => ({ label: k, key: k })) : []
  );

  return (
    <Modal show={show} onHide={onClose} size="lg" centered>
      <Modal.Header closeButton className="bg-light">
        <Modal.Title>{title}</Modal.Title>
      </Modal.Header>
      <Modal.Body className="p-4">
        {!data ? (
          <div className="text-muted">{emptyLabel}</div>
        ) : (
          <dl className="row">
            {effectiveFields.map(f => (
              <React.Fragment key={f.key}>
                <dt className="col-sm-3" style={{ textTransform: 'capitalize' }}>{f.label}</dt>
                <dd className="col-sm-9">
                  {f.render ? f.render(data[f.key], data) : renderValue(data[f.key])}
                </dd>
              </React.Fragment>
            ))}
          </dl>
        )}
      </Modal.Body>
      <Modal.Footer className="bg-light">
        <Button variant="outline-secondary" onClick={onClose}>Cerrar</Button>
      </Modal.Footer>
    </Modal>
  );
};

export default GenericViewModal;
