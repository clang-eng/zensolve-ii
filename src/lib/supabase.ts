import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://tmp.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'tmp';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function getProfile(userId: string) {
    const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

    if (error) throw error;
    return data;
}

export async function updateProfile(userId: string, updates: any) {
    const { error } = await supabase
        .from('users')
        .update(updates)
        .eq('id', userId);

    if (error) throw error;
}
