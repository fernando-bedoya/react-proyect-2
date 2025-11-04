import React, { ReactNode, useMemo, useState } from "react";
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  Checkbox,
  IconButton,
  CircularProgress,
  Box,
  Tooltip,
  Chip,
  Typography,
  Button,
  TextField,
  InputAdornment,
  useTheme,
} from "@mui/material";
import { Search } from 'lucide-react';
import { amber } from "@mui/material/colors";
import { Edit, Trash2, Shield } from 'lucide-react';

type RenderCell<T> = (row: T) => ReactNode;

export type GenericColumn<T> = {
  key: keyof T | string;
  label?: string;
  render?: RenderCell<T>;
  align?: 'left' | 'center' | 'right';
  width?: number | string;
};

export type GenericAction<T> = {
  name: string;
  label?: string;
  icon?: ReactNode;
  color?: 'primary' | 'secondary' | 'warning' | 'error' | 'info' | 'success';
  tooltip?: string;
};

export interface GenericListProps<T> {
  data: T[];
  columns: GenericColumn<T>[];
  loading?: boolean;
  selectable?: boolean;
  idKey?: keyof T | string;
  actions?: GenericAction<T>[];
  onAction?: (actionName: string, item: T) => void;
  onSelectionChange?: (selected: Array<number | string>) => void;
  pageSizeOptions?: number[];
  defaultPageSize?: number;
  emptyMessage?: string;
}

function safeGet<T>(row: any, key: keyof T | string) {
  if (!row) return '';
  if (typeof key === 'string' && key.includes('.')) {
    return key.split('.').reduce((acc: any, k) => acc?.[k], row) ?? '';
  }
  return row[key as keyof typeof row] ?? '';
}

export default function GenericList<T extends Record<string, any>>(props: GenericListProps<T>) {
  const {
    data,
    columns,
    loading = false,
    selectable = false,
    idKey = 'id',
    actions = [],
    onAction,
    onSelectionChange,
    pageSizeOptions = [5, 10, 25, 50],
    defaultPageSize = 10,
    emptyMessage = 'No hay datos para mostrar',
  } = props;

  const theme = useTheme();

  const [selected, setSelected] = useState<Array<number | string>>([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(defaultPageSize);
  const [filter, setFilter] = useState<string>('');
  const [compact, setCompact] = useState<boolean>(false);

  // Filtrado local simple: busca en todas las columnas visibles
  const filteredData = useMemo(() => {
    if (!filter) return data;
    const q = filter.toLowerCase();
    return data.filter(row =>
      columns.some(col => String(safeGet<T>(row, col.key)).toLowerCase().includes(q))
    );
  }, [data, filter, columns]);

  const visibleRows = useMemo(() => {
    const start = page * rowsPerPage;
    return filteredData.slice(start, start + rowsPerPage);
  }, [filteredData, page, rowsPerPage]);

  const handleSelectAll = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      const allIds = data.map(d => d[idKey as keyof T] ?? d[idKey as string]);
      setSelected(allIds as Array<number | string>);
      onSelectionChange?.(allIds as Array<number | string>);
    } else {
      setSelected([]);
      onSelectionChange?.([]);
    }
  };

  const handleToggle = (id: number | string) => {
    setSelected(prev => {
      const exists = prev.includes(id);
      const next = exists ? prev.filter(p => p !== id) : [...prev, id];
      onSelectionChange?.(next);
      return next;
    });
  };

  const isSelected = (id: number | string) => selected.includes(id);

  const handleChangePage = (_: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const renderActionButton = (action: GenericAction<T>, item: T) => {
    const common = {
      size: 'small' as const,
      onClick: () => onAction?.(action.name, item),
    };

    const icon = action.icon ?? (
      action.name === 'edit' ? <Edit size={18} /> : action.name === 'delete' ? <Trash2 size={18} /> : <Shield size={18} />
    );

    return (
      <Tooltip key={action.name} title={action.tooltip ?? action.label ?? action.name}>
        <IconButton 
          color={action.color ?? 'primary'} 
          {...common}
          sx={{
            '&:hover': {
              backgroundColor: action.color === 'error' ? '#fee2e2' : '#f3f4f6',
            }
          }}
        >
          {icon}
        </IconButton>
      </Tooltip>
    );
  };

  return (
    <Paper
      elevation={4}
      sx={{
        width: '100%',
        overflow: 'hidden',
        borderRadius: '12px',
        border: '2px solid #f59e0b',
        boxShadow: '0 10px 30px rgba(245,158,11,0.12), 0 4px 12px rgba(0,0,0,0.06)',
        background: 'linear-gradient(180deg, #ffffff 0%, #fffaf0 100%)',
        fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
      }}
    >
  {/* Barra superior: búsqueda y controles (estilo Material - ámbar) */}
  <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', justifyContent: 'space-between', p: 2, background: 'linear-gradient(90deg, rgba(255,250,240,0.9), rgba(255,255,255,0.9))', borderBottom: '1px solid rgba(245,158,11,0.12)' }}>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <TextField
            size="small"
            placeholder="Buscar..."
            value={filter}
            onChange={(e) => { setFilter(e.target.value); setPage(0); }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search size={16} />
                </InputAdornment>
              ),
            }}
            sx={{ minWidth: 220 }}
          />
          <Typography variant="body2" sx={{ color: '#6b7280' }}>{filteredData.length} resultados</Typography>
        </Box>

        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
          <Button size="small" variant={compact ? 'contained' : 'outlined'} onClick={() => setCompact(prev => !prev)}>
            {compact ? 'Compacto' : 'Detalles'}
          </Button>
        </Box>
      </Box>

      <TableContainer sx={{ maxHeight: 640, backgroundColor: '#fafafa' }}>
          <Table stickyHeader size="medium">
          <TableHead>
            <TableRow
              sx={{
                '& th': {
                  background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                  color: '#ffffff',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  fontSize: '0.85rem',
                  letterSpacing: '1px',
                  borderBottom: '2px solid #b45309',
                  fontFamily: '"Roboto Condensed", sans-serif',
                  padding: '14px 16px'
                }
              }}
            >
              {selectable && (
                <TableCell
                  padding="checkbox"
                  sx={{
                    py: 2.5,
                  }}
                >
                  <Checkbox
                    color="primary"
                    indeterminate={selected.length > 0 && selected.length < data.length}
                    checked={data.length > 0 && selected.length === data.length}
                    onChange={handleSelectAll}
                    sx={{ 
                      '&.Mui-checked, &.MuiCheckbox-indeterminate': { 
                        color: '#78350f' 
                      } 
                    }}
                  />
                </TableCell>
              )}

              {columns.map((col) => (
                <TableCell
                  key={String(col.key)}
                  align={col.align ?? 'left'}
                  style={{ minWidth: col.width }}
                  sx={{
                    fontWeight: 600,
                    fontSize: '0.875rem',
                    color: '#78350f',
                    py: 2.5,
                    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
                    letterSpacing: '0.025em',
                  }}
                >
                  {col.label ?? String(col.key)}
                </TableCell>
              ))}

              {actions.length > 0 && (
                <TableCell
                  align="center"
                  sx={{
                    fontWeight: 600,
                    fontSize: '0.875rem',
                    color: '#78350f',
                    py: 2.5,
                    width: `${actions.length * 60}px`,
                    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
                    letterSpacing: '0.025em',
                  }}
                >
                  Acciones
                </TableCell>
              )}
            </TableRow>
          </TableHead>

          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={columns.length + (selectable ? 1 : 0) + (actions.length > 0 ? 1 : 0)}>
                  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', p: 6, backgroundColor: 'transparent' }}>
                    <CircularProgress sx={{ color: '#f59e0b' }} size={40} />
                  </Box>
                </TableCell>
              </TableRow>
              ) : filteredData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length + (selectable ? 1 : 0) + (actions.length > 0 ? 1 : 0)}>
                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', p: 6, flexDirection: 'column', gap: 2 }}>
                      {/* Simple ilustración SVG ligera */}
                      <svg width="140" height="90" viewBox="0 0 140 90" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <rect x="10" y="10" width="120" height="70" rx="8" fill="#f3f4f6" />
                        <rect x="24" y="28" width="40" height="8" rx="4" fill="#e5e7eb" />
                        <rect x="24" y="42" width="80" height="8" rx="4" fill="#e5e7eb" />
                        <rect x="24" y="56" width="60" height="8" rx="4" fill="#e5e7eb" />
                      </svg>
                      <Typography sx={{ color: '#9ca3af', fontSize: '0.95rem', fontWeight: 500, textAlign: 'center' }}>
                        {emptyMessage}
                      </Typography>
                    </Box>
                </TableCell>
              </TableRow>
            ) : (
              visibleRows.map((row, idx) => {
                const id = row[idKey as keyof T] ?? row[idKey as string] ?? idx;
                const isRowSelected = isSelected(id);
                return (
                      <TableRow
                    hover
                    role="checkbox"
                    tabIndex={-1}
                    key={String(id)}
                      selected={isRowSelected}
                      sx={{
                        backgroundColor: isRowSelected ? (compact ? '#ff8c00ff' : '#ffcc00ff') : undefined,
                        borderBottom: '1px solid #f3f4f6',
                        cursor: 'pointer',
                        position: 'relative',
                        transform: 'translateX(0) scale(1)',
                        boxShadow: 'none',
                        '&:nth-of-type(odd)': { backgroundColor: isRowSelected ? undefined : '#fff7ed' },
                        '&:hover': {
                          backgroundColor: isRowSelected ? (compact ? '#ffb300ff' : '#ffcc00ff') : '#fedfb7ff !important',
                          transform: 'translateX(6px) scale(1.01)',
                          boxShadow: '0 12px 32px rgba(245,158,11,0.18), 0 6px 16px rgba(0,0,0,0.06)',
                          zIndex: 10,
                        },
                        transition: 'background-color 0.18s ease, transform 0.18s cubic-bezier(0.4,0,0.2,1), box-shadow 0.18s ease',
                        '&:last-child td': { borderBottom: 0 },
                      }}
                  >
                    {selectable && (
                      <TableCell padding="checkbox" sx={{ py: 1.5 }}>
                        <Checkbox 
                          color="primary" 
                          checked={isRowSelected} 
                          onChange={() => handleToggle(id)}
                          sx={{ 
                            '&.Mui-checked': { 
                              color: '#f59e0b' 
                            } 
                          }}
                        />
                      </TableCell>
                    )}

                    {columns.map((col) => {
                      const cellVal = col.render ? col.render(row) : safeGet<T>(row, col.key);
                      const isBool = typeof cellVal === 'boolean' || (typeof cellVal === 'string' && (cellVal === 'true' || cellVal === 'false'));
                      return (
                        <TableCell key={String(col.key)} align={col.align ?? 'left'} sx={{ py: 1.5 }}>
                          {isBool ? (
                            <Chip
                              label={cellVal ? 'Activo' : 'Inactivo'}
                              size="small"
                              sx={{
                                backgroundColor: cellVal ? '#fff7ed' : '#fee2e2',
                                color: cellVal ? '#92400e' : '#991b1b',
                                fontWeight: 600,
                                fontSize: '0.75rem',
                                height: '24px',
                                borderRadius: '6px',
                                border: cellVal ? '1px solid #ffedd5' : '1px solid #fecaca',
                              }}
                            />
                          ) : (
                            <Typography sx={{ 
                              color: '#92400e', 
                              fontWeight: 500, 
                              fontSize: '0.875rem',
                              fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
                            }}>
                              {cellVal ?? ''}
                            </Typography>
                          )}
                        </TableCell>
                      );
                    })}

                    {actions.length > 0 && (
                      <TableCell align="center" sx={{ py: 1.5 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 0.5 }}>
                          {actions.map(a => renderActionButton(a, row))}
                        </Box>
                      </TableCell>
                    )}
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        px: 3, 
        py: 2, 
        backgroundColor: '#ffffff',
        borderTop: '1px solid #e5e7eb',
      }}>
        <Box sx={{ py: 0.5 }}>
          <Typography variant="body2" sx={{ color: '#6b7280', fontSize: '0.875rem', fontWeight: 500 }}>
            {`Mostrando ${filteredData.length === 0 ? 0 : page * rowsPerPage + 1} - ${Math.min((page + 1) * rowsPerPage, filteredData.length)} de ${filteredData.length}`}
          </Typography>
        </Box>

        <TablePagination
          rowsPerPageOptions={pageSizeOptions}
          component="div"
          count={data.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage="Filas por página"
          sx={{
            '.MuiTablePagination-selectLabel, .MuiTablePagination-displayedRows': { 
              color: '#6b7280',
              fontSize: '0.875rem',
              fontWeight: 500,
            },
            '.MuiTablePagination-select': {
              color: '#374151',
              fontWeight: 500,
            },
            '.MuiTablePagination-actions button': {
              color: '#6b7280',
              '&:hover': {
                backgroundColor: '#f3f4f6',
              },
              '&.Mui-disabled': {
                color: '#d1d5db',
              }
            }
          }}
        />
      </Box>
    </Paper>
  );
}