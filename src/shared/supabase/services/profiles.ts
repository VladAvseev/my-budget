import { supabase } from '../supabase';
import type { Database } from '../types/database.types';
import { trimStrings } from '@/shared/utils';

export type Profile = Database['public']['Tables']['profiles']['Row'];
type ProfileInsert = Database['public']['Tables']['profiles']['Insert'];

export interface ProfileInput {
  email?: string;
  startBalance?: number;
  onboarded?: boolean;
  showNews?: boolean;
}

class ProfilesService {
  async getProfile(userId: string) {
    return supabase.from('profiles').select('*').eq('user_id', userId).maybeSingle();
  }

  async getOrCreateProfile(userId: string, input: ProfileInput = {}) {
    const existing = await this.getProfile(userId);
    if (existing.data) return existing;
    return this.createProfile(userId, input);
  }

  async createProfile(userId: string, input: ProfileInput = {}) {
    const insert: ProfileInsert = { user_id: userId };
    if (input.email !== undefined) insert.email = input.email;
    insert.start_balance = input.startBalance !== undefined ? String(input.startBalance) : null;
    return supabase.from('profiles').insert(trimStrings(insert)).select().single();
  }

  async updateProfile(userId: string, input: ProfileInput) {
    const updates: Database['public']['Tables']['profiles']['Update'] = {};
    if (input.email !== undefined) updates.email = input.email;
    if (input.startBalance !== undefined) updates.start_balance = String(input.startBalance);
    if (input.onboarded !== undefined) updates.onboarded = input.onboarded;
    if (input.showNews !== undefined) updates.show_news = input.showNews;
    return supabase.from('profiles').update(trimStrings(updates)).eq('user_id', userId).select().single();
  }

  async updateStartBalance(userId: string, startBalance: number) {
    return supabase
      .from('profiles')
      .update(trimStrings({ start_balance: String(startBalance) }))
      .eq('user_id', userId)
      .select()
      .single();
  }
}

export const profilesService = new ProfilesService();