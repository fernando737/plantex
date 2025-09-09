import { useState } from 'react';
import toast from 'react-hot-toast';
import { ReportData, ReportType, ExportOptions, UseReportExportReturn } from '../utils/reportTypes';
import { exportReportAsPDF, exportReportAsCSV } from '../utils/reportExporters';

export const useReportExport = (): UseReportExportReturn => {
  const [isExporting, setIsExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);

  const exportToPDF = async (
    reportType: ReportType,
    data: ReportData,
    options: ExportOptions = {}
  ): Promise<void> => {
    setIsExporting(true);
    setExportError(null);

    try {
      await exportReportAsPDF(reportType, data, options);
      toast.success('Reporte PDF descargado exitosamente');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error al generar el PDF';
      setExportError(errorMessage);
      toast.error(errorMessage);
      throw error;
    } finally {
      setIsExporting(false);
    }
  };

  const exportToCSV = async (
    reportType: ReportType,
    data: ReportData,
    options: ExportOptions = {}
  ): Promise<void> => {
    setIsExporting(true);
    setExportError(null);

    try {
      exportReportAsCSV(reportType, data, options);
      toast.success('Reporte CSV descargado exitosamente');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error al generar el CSV';
      setExportError(errorMessage);
      toast.error(errorMessage);
      throw error;
    } finally {
      setIsExporting(false);
    }
  };

  return {
    exportToPDF,
    exportToCSV,
    isExporting,
    exportError,
  };
};