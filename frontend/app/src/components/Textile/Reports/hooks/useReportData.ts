import { useState } from 'react';
import { api } from '@/hooks/useApi';
import { ReportData, ReportType, UseReportDataReturn } from '../utils/reportTypes';

export const useReportData = (): UseReportDataReturn => {
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchReport = async (budgetId: number, reportType: ReportType): Promise<ReportData> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await api.get(`/textile/production-budgets/${budgetId}/${reportType}/`);
      const data = response.data as ReportData;
      
      setReportData(data);
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al obtener el reporte';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    reportData,
    isLoading,
    error,
    fetchReport,
  };
};