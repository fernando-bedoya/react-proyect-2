import React from 'react';

export type ActionDef = {
  name: string;
  label?: string;
  icon?: string; // optional, not used for now
  variant?: 'primary' | 'warning' | 'danger' | 'secondary' | string;
};

export type ColumnDef = string | { key: string; label?: string; render?: (row: any) => React.ReactNode };

interface GenericTableProps {
  data: any[];
  columns: ColumnDef[];
  actions?: ActionDef[];
  onAction?: (action: string, item: any) => void;
  striped?: boolean;
  hover?: boolean;
  responsive?: boolean;
  emptyMessage?: string;
  // theme can be used to switch styling/behavior when other table implementations exist
  theme?: 'tailwind' | 'bootstrap';
  // optional function to conditionally show/hide an action button per row
  actionVisible?: (actionName: string, row: any) => boolean;
}

const mapVariantToClass = (v?: string) => {
  // Returns classes for background, text and focus states to ensure good contrast
  switch (v) {
    case 'primary': return 'bg-primary text-white hover:opacity-90';
case 'warning': return 'bg-warning text-white hover:opacity-90';
case 'danger':  return 'bg-danger text-white hover:opacity-90';
  }
};

const getValueByPath = (obj: any, path: string) => {
  if (!obj) return '';
  const parts = path.split('.');
  let cur: any = obj;
  for (const p of parts) {
    if (cur == null) return '';
    cur = cur[p];
  }
  return cur;
};

const formatCell = (val: any) => {
  if (val == null) return '-';
  if (typeof val === 'string') {
    // try ISO date detect
    const isoLike = /^\d{4}-\d{2}-\d{2}T|\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}/;
    if (isoLike.test(val)) {
      try {
        const d = new Date(val);
        if (!isNaN(d.getTime())) return d.toLocaleString();
      } catch (e) {}
    }
    return val;
  }
  if (val instanceof Date) return val.toLocaleString();
  if (typeof val === 'object') return JSON.stringify(val);
  return String(val);
};

const GenericTableTailwind: React.FC<GenericTableProps> = ({ data, columns, actions = [], onAction, striped, hover, responsive, emptyMessage, theme = 'tailwind', actionVisible }) => {
  return (
    <div className={responsive ? 'overflow-auto' : ''}>
      <table className="min-w-full divide-y divide-stroke">
        <thead className="bg-gray-50 dark:bg-boxdark">
          <tr>
            {columns.map((col, idx) => {
              const label = typeof col === 'string' ? col.toUpperCase() : (col.label || col.key.toUpperCase());
              return (
                <th key={String(idx)} scope="col" className="px-4 py-2 text-left text-xs font-medium text-body dark:text-bodydark1 uppercase tracking-wider">
                  {label}
                </th>
              );
            })}
            {actions.length > 0 && (
              <th scope="col" className="px-4 py-2 text-right text-xs font-medium text-body dark:text-bodydark1 uppercase tracking-wider">Acciones</th>
            )}
          </tr>
        </thead>
        <tbody className="bg-white dark:bg-boxdark divide-y divide-stroke">
          {data.length === 0 ? (
            <tr>
              <td colSpan={columns.length + (actions.length > 0 ? 1 : 0)} className="px-4 py-6 text-center text-sm text-bodydark1">
                {emptyMessage || 'No hay registros.'}
              </td>
            </tr>
          ) : (
            data.map((row, i) => (
              <tr key={i} className={`${striped && i % 2 === 0 ? 'bg-gray-50 dark:bg-boxdark-2' : ''} ${hover ? 'hover:bg-gray-100' : ''}`}>
                {columns.map((col, ci) => {
                  if (typeof col === 'string') {
                    const val = getValueByPath(row, col);
                    return (
                      <td key={ci} className="px-4 py-3 text-sm text-body">
                        {formatCell(val)}
                      </td>
                    );
                  } else {
                    const { key, render } = col;
                    return (
                      <td key={ci} className="px-4 py-3 text-sm text-body">
                        {render ? render(row) : formatCell(getValueByPath(row, key))}
                      </td>
                    );
                  }
                })}

                {actions.length > 0 && (
                  <td className="px-4 py-3 text-sm text-right">
                    <div className="inline-flex items-center gap-2">
                      {actions.map((a) => {
                        // visibility check: if actionVisible provided, use it. Otherwise, apply theme-specific defaults
                        const visible = actionVisible ? actionVisible(a.name, row) : (theme === 'tailwind' ? Boolean(row && row.id !== undefined && row.id !== null) : true);
                        if (!visible) return null;

                        // theme-specific rendering: ensure edit button is clearly visible for tailwind
                        const btnClass = theme === 'tailwind'
                          ? `inline-flex items-center justify-center px-2.5 py-1.5 text-xs font-medium rounded ${mapVariantToClass(a.variant)} focus:outline-none`
                          : `inline-flex items-center justify-center px-2 py-1 text-xs rounded ${mapVariantToClass(a.variant)} focus:outline-none`;

                        return (
                          <button
                            key={a.name}
                            onClick={() => onAction && onAction(a.name, row)}
                            className={btnClass}
                            title={a.label || a.name}
                            aria-label={a.label || a.name}
                          >
                            {a.label || a.name}
                          </button>
                        );
                      })}
                    </div>
                  </td>
                )}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default GenericTableTailwind;
