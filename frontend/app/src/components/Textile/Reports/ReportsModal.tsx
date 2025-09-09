import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  CircularProgress,
} from '@mui/material';
import { designTokens } from '@/config';
import { ReportModalProps, ReportType } from './utils/reportTypes';
import { useReportModal } from './hooks/useReportModal';
import { useReportExport } from './hooks/useReportExport';
import ReportSelector from './ReportSelector';
import CostBreakdownReport from './components/CostBreakdownReport';
import ProviderSummaryReport from './components/ProviderSummaryReport';
import DetailedLineItemsReport from './components/DetailedLineItemsReport';

const ReportsModal: React.FC<ReportModalProps> = ({ open, budget, onClose }) => {
  const { reportData, reportType, isLoading, error, handleViewReport, clearReport } = useReportModal(budget?.id);
  const { exportToPDF, exportToCSV, isExporting } = useReportExport();

  const handleViewReportWrapper = async (type: ReportType) => {
    await handleViewReport(type);
  };

  const handleExportPDF = async (type: ReportType) => {
    if (!reportData || reportType !== type) {
      // If we don't have the data or it's for a different report type, fetch it first
      await handleViewReport(type);
    }
    
    // Wait a moment for the component to render with the new data
    setTimeout(async () => {
      if (reportData) {
        await exportToPDF(type, reportData);
      }
    }, 100);
  };

  const handleExportCSV = async (type: ReportType) => {
    if (!reportData || reportType !== type) {
      // If we don't have the data or it's for a different report type, fetch it first  
      await handleViewReport(type);
    }
    
    if (reportData) {
      await exportToCSV(type, reportData);
    }
  };

  const handleClose = () => {
    clearReport();
    onClose();
  };

  const renderReportContent = () => {
    if (isLoading) {
      return (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 200 }}>
          <CircularProgress />
          <Typography variant="body2" sx={{ ml: 2 }}>
            Generando reporte...
          </Typography>
        </Box>
      );
    }

    if (error) {
      return (
        <Box sx={{ p: 3, textAlign: 'center' }}>
          <Typography color="error" variant="body2">
            Error: {error}
          </Typography>
        </Box>
      );
    }

    if (!reportData || !reportType) {
      return (
        <ReportSelector
          onViewReport={handleViewReportWrapper}
          onExportPDF={handleExportPDF}
          onExportCSV={handleExportCSV}
          isLoading={isLoading}
          isExporting={isExporting}
        />
      );
    }

    // Render the appropriate report component
    const commonProps = {
      data: reportData,
      reportType,
      isPrintMode: false,
    };

    switch (reportType) {
      case 'cost-breakdown-report':
        return <CostBreakdownReport {...commonProps} />;
      case 'provider-summary-report':
        return <ProviderSummaryReport {...commonProps} />;
      case 'detailed-line-items-report':
        return <DetailedLineItemsReport {...commonProps} />;
      default:
        return null;
    }
  };

  const renderHiddenPrintVersions = () => {
    if (!reportData || !reportType) return null;

    // Render hidden print versions for PDF generation
    const printProps = {
      data: reportData,
      reportType,
      isPrintMode: true,
    };

    return (
      <div style={{ position: 'absolute', left: '-9999px', top: '-9999px' }}>
        {reportType === 'cost-breakdown-report' && (
          <div id="cost-breakdown-report-print">
            <CostBreakdownReport {...printProps} />
          </div>
        )}
        {reportType === 'provider-summary-report' && (
          <div id="provider-summary-report-print">
            <ProviderSummaryReport {...printProps} />
          </div>
        )}
        {reportType === 'detailed-line-items-report' && (
          <div id="detailed-line-items-report-print">
            <DetailedLineItemsReport {...printProps} />
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="lg"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: designTokens.borderRadius.lg,
            minHeight: '500px',
          },
        }}
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6" component="div">
              Reportes - {budget?.name}
            </Typography>
          </Box>
        </DialogTitle>

        <DialogContent sx={{ p: 3 }}>
          {renderReportContent()}

          {/* Display report with clear button */}
          {reportData && reportType && (
            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Button
                  onClick={() => handleExportPDF(reportType)}
                  variant="contained"
                  color="error"
                  size="small"
                  disabled={isExporting}
                >
                  {isExporting ? 'Exportando...' : 'Descargar PDF'}
                </Button>
                <Button
                  onClick={() => handleExportCSV(reportType)}
                  variant="contained"
                  color="success"
                  size="small"
                  disabled={isExporting}
                >
                  {isExporting ? 'Exportando...' : 'Exportar CSV'}
                </Button>
              </Box>
              
              <Button
                onClick={clearReport}
                variant="outlined"
                size="small"
              >
                Limpiar Reporte
              </Button>
            </Box>
          )}
        </DialogContent>

        <DialogActions sx={{ p: 3, borderTop: `1px solid ${designTokens.colors.border.light}` }}>
          <Button onClick={handleClose} variant="outlined">
            Cerrar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Hidden print versions for PDF generation */}
      {renderHiddenPrintVersions()}
    </>
  );
};

export default ReportsModal;