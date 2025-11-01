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
  useTheme,
} from "@mui/material";
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
  idKey?: keyof T | string; // field to use as id (default 'id')
  actions?: GenericAction<T>[];
  onAction?: (actionName: string, item: T) => void;
  onSelectionChange?: (selected: Array<number | string>) => void;
  pageSizeOptions?: number[];
  defaultPageSize?: number;
  emptyMessage?: string;
}

function safeGet<T>(row: any, key: keyof T | string) {
  if (!row) return '';
  // support nested keys like 'user.name'
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
  const amberMain = amber[600];

  const [selected, setSelected] = useState<Array<number | string>>([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(defaultPageSize);

  const visibleRows = useMemo(() => {
    const start = page * rowsPerPage;
    return data.slice(start, start + rowsPerPage);
  }, [data, page, rowsPerPage]);

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
      action.name === 'edit' ? <Edit /> : action.name === 'delete' ? <Trash2 /> : <Shield />
    );

    return (
      <Tooltip key={action.name} title={action.tooltip ?? action.label ?? action.name}>
        <IconButton color={action.color ?? 'primary'} {...common}>
          {icon}
        </IconButton>
      </Tooltip>
    );
  };

  return (
    <Paper elevation={1} sx={{ width: '100%', overflow: 'hidden' }}>
      <TableContainer sx={{ maxHeight: 640 }}>
        <Table stickyHeader size="small">
          <TableHead>
            <TableRow sx={{ backgroundColor: theme.palette.mode === 'light' ? amber[50] : undefined }}>
              {selectable && (
                <TableCell padding="checkbox" sx={{ bgcolor: amber[50] }}>
                  <Checkbox
                    color="warning"
                    indeterminate={selected.length > 0 && selected.length < data.length}
                    checked={data.length > 0 && selected.length === data.length}
                    onChange={handleSelectAll}
                  />
                </TableCell>
              )}

              {columns.map((col) => (
                <TableCell key={String(col.key)} align={col.align ?? 'left'} style={{ minWidth: col.width }}>
                  <Typography variant="subtitle2" sx={{ color: amberMain }}>
                    {col.label ?? String(col.key)}
                  </Typography>
                </TableCell>
              ))}

              {actions.length > 0 && <TableCell align="center"><Typography variant="subtitle2" sx={{ color: amberMain }}>Acciones</Typography></TableCell>}
            </TableRow>
          </TableHead>

          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={columns.length + (selectable ? 1 : 0) + (actions.length > 0 ? 1 : 0)}>
                  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', p: 4 }}>
                    <CircularProgress color="warning" />
                  </Box>
                </TableCell>
              </TableRow>
            ) : data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length + (selectable ? 1 : 0) + (actions.length > 0 ? 1 : 0)}>
                  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', p: 4 }}>
                    <Chip label={emptyMessage} color="warning" variant="outlined" />
                  </Box>
                </TableCell>
              </TableRow>
            ) : (
              visibleRows.map((row, idx) => {
                const id = row[idKey as keyof T] ?? row[idKey as string] ?? idx;
                return (
                  <TableRow hover role="checkbox" tabIndex={-1} key={String(id)} selected={isSelected(id)}>
                    {selectable && (
                      <TableCell padding="checkbox">
                        <Checkbox color="warning" checked={isSelected(id)} onChange={() => handleToggle(id)} />
                      </TableCell>
                    )}

                    {columns.map((col) => (
                      <TableCell key={String(col.key)} align={col.align ?? 'left'}>
                        {col.render ? col.render(row) : String(safeGet<T>(row, col.key))}
                      </TableCell>
                    ))}

                    {actions.length > 0 && (
                      <TableCell align="center">
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

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', px: 2 }}>
        <Box sx={{ py: 1 }}>
          <Typography variant="body2" color="text.secondary">
            {`Mostrando ${data.length === 0 ? 0 : page * rowsPerPage + 1} - ${Math.min((page + 1) * rowsPerPage, data.length)} de ${data.length}`}
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
          labelRowsPerPage="Filas"
        />
      </Box>
    </Paper>
  );
}
