import { supabase } from '@/shared/supabase/supabase';
import { useMutation, useQueryClient } from '@tanstack/react-query';

export const useUpdateStartBalance = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (startBalance: number) => {
      const { error } = await supabase.rpc('update_start_balance', { p_amount: startBalance });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
  });
};