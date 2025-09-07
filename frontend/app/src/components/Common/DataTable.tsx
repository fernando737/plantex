import React, { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TablePagination,
  Box,
  Typography,
  IconButton,
  Tooltip,
  TextField,
  InputAdornment,
  useTheme,
  Skeleton,
  SxProps,
  Theme,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  Download as DownloadIcon,
  Search as SearchIcon,
  Clear as ClearIcon,
} from '@mui/icons-material';
import { designTokens } from '@/config';

interface Column<T> {
  id: string;
  label: string;
  render?: (item: T) => React.ReactNode;
  align?: 'left' | 'right' | 'center';
  width?: string | number;
  sortable?: boolean;
  searchable?: boolean;
}

interface PaginationProps {
  page: number;
  pageSize: number;
  totalCount: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
}

interface SearchProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  loading?: boolean;
  pagination?: PaginationProps;
  search?: SearchProps;
  onEdit?: (item: T) => void;
  onDelete?: (item: T) => void;
  onView?: (item: T) => void;
  onDownload?: (item: T) => void;
  isViewDisabled?: (item: T) => boolean;
  isDownloadDisabled?: (item: T) => boolean;
  customActions?: Array<{
    icon: React.ReactNode;
    tooltip: string;
    onClick: (item: T) => void;
    color?: 'primary' | 'secondary' | 'success' | 'error' | 'info' | 'warning';
    disabled?: (item: T) => boolean;
  }>;
  emptyMessage?: string;
  className?: string;
  sx?: SxProps<Theme>;
  rowKey?: keyof T;
  selectable?: boolean;
  onSelectionChange?: (selectedItems: T[]) => void;
  getRowSx?: (item: T) => SxProps<Theme>;
}

function DataTable<T extends Record<string, any>>({
  data,
  columns,
  loading = false,
  pagination,
  search,
  onEdit,
  onDelete,
  onView,
  onDownload,
  isViewDisabled,
  isDownloadDisabled,
  customActions = [],
  emptyMessage = 'No data available',
  className,
  sx,
  rowKey = 'id',
  selectable = false,
  onSelectionChange,
  getRowSx,
}: DataTableProps<T>) {
  const theme = useTheme();
  const [selectedItems, setSelectedItems] = useState<T[]>([]);

  const hasActions =
    onEdit || onDelete || onView || onDownload || customActions.length > 0;

  const handleSelectAll = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      setSelectedItems([...data]);
      onSelectionChange?.(data);
    } else {
      setSelectedItems([]);
      onSelectionChange?.([]);
    }
  };

  const handleSelectItem = (item: T) => {
    const isSelected = selectedItems.some(
      selected => selected[rowKey] === item[rowKey]
    );
    let newSelected: T[];

    if (isSelected) {
      newSelected = selectedItems.filter(
        selected => selected[rowKey] !== item[rowKey]
      );
    } else {
      newSelected = [...selectedItems, item];
    }

    setSelectedItems(newSelected);
    onSelectionChange?.(newSelected);
  };

  const isItemSelected = (item: T) => {
    return selectedItems.some(selected => selected[rowKey] === item[rowKey]);
  };

  const handleClearSearch = () => {
    search?.onChange('');
  };

  const renderSkeletonRows = () => {
    return Array.from({ length: pagination?.pageSize || 10 }).map(
      (_, index) => (
        <TableRow key={`skeleton-${index}`}>
          {selectable && (
            <TableCell padding="checkbox">
              <Skeleton variant="rectangular" width={20} height={20} />
            </TableCell>
          )}
          {columns.map(column => (
            <TableCell key={column.id}>
              <Skeleton variant="text" width="80%" />
            </TableCell>
          ))}
          {hasActions && (
            <TableCell align="center">
              <Skeleton variant="rectangular" width={80} height={32} />
            </TableCell>
          )}
        </TableRow>
      )
    );
  };

  if (loading && data.length === 0) {
    return (
      <Paper
        className={className}
        sx={{
          borderRadius: designTokens.borderRadius.md,
          boxShadow: designTokens.shadows.sm,
          border: `1px solid ${designTokens.colors.border.light}`,
          ...sx,
        }}
      >
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                {selectable && (
                  <TableCell padding="checkbox">
                    <Skeleton variant="rectangular" width={20} height={20} />
                  </TableCell>
                )}
                {columns.map(column => (
                  <TableCell
                    key={column.id}
                    align={column.align || 'left'}
                    style={{ width: column.width }}
                    sx={{
                      fontWeight: designTokens.typography.fontWeight.semibold,
                      backgroundColor: designTokens.colors.background.paper,
                      borderBottom: `2px solid ${designTokens.colors.border.medium}`,
                    }}
                  >
                    {column.label}
                  </TableCell>
                ))}
                {hasActions && (
                  <TableCell
                    align="center"
                    style={{ width: 120 }}
                    sx={{
                      fontWeight: designTokens.typography.fontWeight.semibold,
                      backgroundColor: designTokens.colors.background.paper,
                      borderBottom: `2px solid ${designTokens.colors.border.medium}`,
                    }}
                  >
                    Acciones
                  </TableCell>
                )}
              </TableRow>
            </TableHead>
            <TableBody>{renderSkeletonRows()}</TableBody>
          </Table>
        </TableContainer>
      </Paper>
    );
  }

  return (
    <Paper
      className={className}
      sx={{
        borderRadius: designTokens.borderRadius.md,
        boxShadow: designTokens.shadows.sm,
        border: `1px solid ${designTokens.colors.border.light}`,
        overflow: 'hidden',
        ...sx,
      }}
    >
      {/* Search Bar */}
      {search && (
        <Box
          sx={{
            p: designTokens.spacing.md,
            borderBottom: `1px solid ${designTokens.colors.border.light}`,
            backgroundColor: designTokens.colors.background.paper,
          }}
        >
          <TextField
            fullWidth
            placeholder={search.placeholder || 'Search...'}
            value={search.value}
            onChange={e => search.onChange(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color="action" />
                </InputAdornment>
              ),
              endAdornment: search.value && (
                <InputAdornment position="end">
                  <IconButton
                    size="small"
                    onClick={handleClearSearch}
                    edge="end"
                  >
                    <ClearIcon />
                  </IconButton>
                </InputAdornment>
              ),
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: designTokens.borderRadius.sm,
              },
            }}
          />
        </Box>
      )}

      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              {selectable && (
                <TableCell padding="checkbox">
                  <input
                    type="checkbox"
                    checked={
                      data.length > 0 && selectedItems.length === data.length
                    }
                    onChange={handleSelectAll}
                    style={{ width: 20, height: 20 }}
                    ref={input => {
                      if (input) {
                        input.indeterminate =
                          selectedItems.length > 0 &&
                          selectedItems.length < data.length;
                      }
                    }}
                  />
                </TableCell>
              )}
              {columns.map(column => (
                <TableCell
                  key={column.id}
                  align={column.align || 'left'}
                  style={{ width: column.width }}
                  sx={{
                    fontWeight: designTokens.typography.fontWeight.semibold,
                    backgroundColor: designTokens.colors.background.paper,
                    borderBottom: `2px solid ${designTokens.colors.border.medium}`,
                    color: theme.palette.text.primary,
                  }}
                >
                  {column.label}
                </TableCell>
              ))}
              {hasActions && (
                <TableCell
                  align="center"
                  style={{ width: 120 }}
                  sx={{
                    fontWeight: designTokens.typography.fontWeight.semibold,
                    backgroundColor: designTokens.colors.background.paper,
                    borderBottom: `2px solid ${designTokens.colors.border.medium}`,
                  }}
                >
                  Acciones
                </TableCell>
              )}
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              renderSkeletonRows()
            ) : data.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={
                    columns.length + (selectable ? 1 : 0) + (hasActions ? 1 : 0)
                  }
                  align="center"
                  sx={{
                    py: designTokens.spacing.xl,
                    color: theme.palette.text.secondary,
                  }}
                >
                  <Typography variant="body1" color="text.secondary">
                    {emptyMessage}
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              data.map(item => (
                <TableRow
                  key={String(item[rowKey])}
                  hover
                  selected={isItemSelected(item)}
                  sx={{
                    '&:hover': {
                      backgroundColor: designTokens.colors.secondary[100],
                    },
                    '&.Mui-selected': {
                      backgroundColor: designTokens.colors.primary[100],
                    },
                    '&.Mui-selected:hover': {
                      backgroundColor: designTokens.colors.primary[200],
                    },
                    ...getRowSx?.(item),
                  }}
                >
                  {selectable && (
                    <TableCell padding="checkbox">
                      <input
                        type="checkbox"
                        checked={isItemSelected(item)}
                        onChange={() => handleSelectItem(item)}
                        style={{ width: 20, height: 20 }}
                      />
                    </TableCell>
                  )}
                  {columns.map(column => (
                    <TableCell
                      key={column.id}
                      align={column.align || 'left'}
                      sx={{
                        borderBottom: `1px solid ${designTokens.colors.border.light}`,
                      }}
                    >
                      {column.render
                        ? column.render(item)
                        : String(item[column.id] || '')}
                    </TableCell>
                  ))}
                  {hasActions && (
                    <TableCell
                      align="center"
                      sx={{
                        borderBottom: `1px solid ${designTokens.colors.border.light}`,
                      }}
                    >
                      <Box
                        display="flex"
                        gap={designTokens.spacing.xs}
                        justifyContent="center"
                      >
                        {onView && (
                          <Tooltip
                            title={
                              isViewDisabled && isViewDisabled(item)
                                ? 'No hay archivo disponible'
                                : 'Ver'
                            }
                          >
                            <span>
                              <IconButton
                                size="small"
                                onClick={() => onView(item)}
                                disabled={
                                  isViewDisabled ? isViewDisabled(item) : false
                                }
                                color="primary"
                                sx={{
                                  color: designTokens.colors.primary[500],
                                  '&:hover': {
                                    backgroundColor:
                                      designTokens.colors.primary[50],
                                  },
                                  '&:disabled': {
                                    color: theme.palette.action.disabled,
                                  },
                                }}
                              >
                                <VisibilityIcon />
                              </IconButton>
                            </span>
                          </Tooltip>
                        )}
                        {onDownload && (
                          <Tooltip
                            title={
                              isDownloadDisabled && isDownloadDisabled(item)
                                ? 'No hay archivo disponible'
                                : 'Descargar'
                            }
                          >
                            <span>
                              <IconButton
                                size="small"
                                onClick={() => onDownload(item)}
                                disabled={
                                  isDownloadDisabled
                                    ? isDownloadDisabled(item)
                                    : false
                                }
                                sx={{
                                  color: theme.palette.success.main,
                                  '&:hover': {
                                    backgroundColor:
                                      theme.palette.success.light,
                                  },
                                  '&:disabled': {
                                    color: theme.palette.action.disabled,
                                  },
                                }}
                              >
                                <DownloadIcon />
                              </IconButton>
                            </span>
                          </Tooltip>
                        )}
                        {onEdit && (
                          <Tooltip title="Editar">
                            <IconButton
                              size="small"
                              onClick={() => onEdit(item)}
                              color="primary"
                              sx={{
                                color: designTokens.colors.primary[500],
                                '&:hover': {
                                  backgroundColor:
                                    designTokens.colors.primary[50],
                                },
                              }}
                            >
                              <EditIcon />
                            </IconButton>
                          </Tooltip>
                        )}
                        {onDelete && (
                          <Tooltip title="Eliminar">
                            <IconButton
                              size="small"
                              onClick={() => onDelete(item)}
                              color="error"
                              sx={{
                                color: designTokens.colors.error.main,
                                '&:hover': {
                                  backgroundColor:
                                    designTokens.colors.error.light,
                                },
                              }}
                            >
                              <DeleteIcon />
                            </IconButton>
                          </Tooltip>
                        )}
                        {customActions.map((action, index) => (
                          <Tooltip key={index} title={action.tooltip}>
                            <span>
                              <IconButton
                                size="small"
                                onClick={() => action.onClick(item)}
                                disabled={
                                  action.disabled
                                    ? action.disabled(item)
                                    : false
                                }
                                sx={{
                                  color: action.color
                                    ? theme.palette[action.color].main
                                    : theme.palette.primary.main,
                                  '&:hover': {
                                    backgroundColor: action.color
                                      ? theme.palette[action.color].light
                                      : theme.palette.primary.light,
                                  },
                                  '&:disabled': {
                                    color: theme.palette.action.disabled,
                                  },
                                }}
                              >
                                {action.icon}
                              </IconButton>
                            </span>
                          </Tooltip>
                        ))}
                      </Box>
                    </TableCell>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Pagination */}
      {pagination && (
        <TablePagination
          rowsPerPageOptions={[5, 10, 25, 50]}
          component="div"
          count={pagination.totalCount}
          rowsPerPage={pagination.pageSize}
          page={pagination.page}
          onPageChange={(_, newPage) => pagination.onPageChange(newPage)}
          onRowsPerPageChange={event =>
            pagination.onPageSizeChange(parseInt(event.target.value, 10))
          }
          sx={{
            borderTop: `1px solid ${designTokens.colors.border.light}`,
            backgroundColor: designTokens.colors.background.paper,
          }}
        />
      )}
    </Paper>
  );
}

export default DataTable;
