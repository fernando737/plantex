import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  useTheme,
  Skeleton,
  SxProps,
  Theme,
} from '@mui/material';
import { designTokens } from '@/config';

interface Column<T> {
  id: string;
  label: string;
  render?: (item: T) => React.ReactNode;
  align?: 'left' | 'right' | 'center';
  width?: string | number;
}

interface DataTableSimpleProps<T> {
  data: T[];
  columns: Column<T>[];
  loading?: boolean;
  emptyMessage?: string;
  className?: string;
  sx?: SxProps<Theme>;
  rowKey?: keyof T;
  showHeaders?: boolean;
}

function DataTableSimple<T extends Record<string, any>>({
  data,
  columns,
  loading = false,
  emptyMessage = 'No data available',
  className,
  sx,
  rowKey = 'id',
  showHeaders = true,
}: DataTableSimpleProps<T>) {
  const theme = useTheme();

  const renderSkeletonRows = () => {
    return Array.from({ length: 5 }).map((_, index) => (
      <TableRow key={`skeleton-${index}`}>
        {columns.map(column => (
          <TableCell key={column.id} sx={{ py: 1 }}>
            <Skeleton variant="text" width="80%" />
          </TableCell>
        ))}
      </TableRow>
    ));
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
          <Table size="small">
            {showHeaders && (
              <TableHead>
                <TableRow>
                  {columns.map(column => (
                    <TableCell
                      key={column.id}
                      align={column.align || 'left'}
                      style={{ width: column.width }}
                      sx={{
                        fontWeight: designTokens.typography.fontWeight.semibold,
                        backgroundColor: designTokens.colors.background.paper,
                        borderBottom: `2px solid ${designTokens.colors.border.medium}`,
                        py: 1,
                        px: 2,
                      }}
                    >
                      {column.label}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
            )}
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
      <TableContainer>
        <Table size="small">
          {showHeaders && (
            <TableHead>
              <TableRow>
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
                      py: 1,
                      px: 2,
                    }}
                  >
                    {column.label}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
          )}
          <TableBody>
            {loading ? (
              renderSkeletonRows()
            ) : data.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  align="center"
                  sx={{
                    py: designTokens.spacing.lg,
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
                  sx={{
                    '&:hover': {
                      backgroundColor: designTokens.colors.secondary[50],
                    },
                  }}
                >
                  {columns.map(column => (
                    <TableCell
                      key={column.id}
                      align={column.align || 'left'}
                      sx={{
                        borderBottom: `1px solid ${designTokens.colors.border.light}`,
                        py: 1,
                        px: 2,
                      }}
                    >
                      {column.render
                        ? column.render(item)
                        : String(item[column.id] || '')}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
}

export default DataTableSimple;
