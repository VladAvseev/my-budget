import {
  operationsService,
  type Operation,
} from '@/shared/supabase/services/operations';
import { reportsService } from '@/shared/supabase/services/reports';
import { useQuery } from '@tanstack/react-query';

export type SavingsOperation = Operation & { reportName: string; reportCreatedAt: string };

export const useSavingsOperations = (userId: string) =>
  useQuery<SavingsOperation[]>({
    queryKey: ['savingsOperations', userId],
    enabled: Boolean(userId),
    queryFn: async () => {
      const [
        { data: depositsData, error: depositsError },
        { data: withdrawalsData, error: withdrawalsError },
        { data: reportsData, error: reportsError },
      ] = await Promise.all([
        operationsService.listByTypeForUser(userId, 'savings'),
        operationsService.listByTypeForUser(userId, 'savings_out'),
        reportsService.listReportsByUser(userId),
      ]);
      if (depositsError) throw depositsError;
      if (withdrawalsError) throw withdrawalsError;
      if (reportsError) throw reportsError;

      const reportNames = new Map((reportsData ?? []).map((report) => [report.id, report.name]));
      const reportCreatedAt = new Map(
        (reportsData ?? []).map((report) => [report.id, report.created_at ?? '']),
      );

      return [...(depositsData ?? []), ...(withdrawalsData ?? [])]
        .map((operation) => ({
          ...operation,
          reportName: reportNames.get(operation.report_id) ?? '',
          reportCreatedAt: reportCreatedAt.get(operation.report_id) ?? '',
        }))
        .sort((a, b) =>
          (b.reportCreatedAt ?? '').localeCompare(a.reportCreatedAt ?? '') ||
          (b.created_at ?? '').localeCompare(a.created_at ?? ''),
        );
    },
  });