import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://pewhqjsjoipjxrrrggfv.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBld2hxanNqb2lwanhycnJnZ2Z2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzEyMjYxMzQsImV4cCI6MjA4NjgwMjEzNH0.ZXrXoB2I_EoTshN1NKjEx_YMDvBAvjGKeqlY0wvx1jc';

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
