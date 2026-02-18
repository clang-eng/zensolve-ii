'use client';

import { useRouter } from 'next/navigation';
import { createBrowserSupabaseClient } from '@/lib/supabase';

export default function AdminLogoutButton() {
    const router = useRouter();
    const supabase = createBrowserSupabaseClient();

    const logout = async () => {
        await supabase.auth.signOut();
        router.replace('/login');
        router.refresh();
    };

    return (
        <button
            onClick={logout}
            className="rounded-md border border-white/20 px-3 py-1.5 text-sm text-white hover:border-white/40"
        >
            Logout
        </button>
    );
}
