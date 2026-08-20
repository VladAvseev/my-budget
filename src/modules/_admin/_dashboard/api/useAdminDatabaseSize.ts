import { supabase } from '@/shared/supabase/supabase';
import type { DatabaseSize } from '@/shared/supabase/types/domain';
import { useQuery } from '@tanstack/react-query';

export const useAdminDatabaseSize = () =>
  useQuery<DatabaseSize>({
    queryKey: ['admin', 'databaseSize'],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('admin_get_database_size');
      if (error) throw error;
      return data;
    },
    refetchInterval: 60_000,
  });