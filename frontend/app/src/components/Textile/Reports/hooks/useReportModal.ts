import { useState } from 'react';
import toast from 'react-hot-toast';
import { ReportData, ReportType, UseReportModalReturn } from '../utils/reportTypes';
import { useReportData } from './useReportData';

export const useReportModal = (budgetId: number) => {
  const [reportType, setReportType] = useState<ReportType | null>(null);
  const { reportData, isLoading, error, fetchReport } = useReportData();

  const handleViewReport = async (type: ReportType): Promise<void> => {
    try {
      setReportType(type);
      await fetchReport(budgetId, type);
      toast.success('Reporte generado exitosamente');
    } catch (error) {
      console.error('Error generating report:', error);
      toast.error('Error al generar el reporte');
      setReportType(null);
    }
  };

  const clearReport = (): void => {
    setReportType(null);
  };

  return {
    reportData,
    reportType,
    isLoading,
    error,
    handleViewReport,
    clearReport,
  } as UseReportModalReturn;
};