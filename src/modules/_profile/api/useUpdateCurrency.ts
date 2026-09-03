import { supabase } from '@/shared/supabase/supabase';
import { useMutation, useQueryClient } from '@tanstack/react-query';

export const useUpdateCurrency = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (currency: string | null) => {
      const { error } = await supabase.rpc('update_currency', { p_currency: currency });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
  });
};
