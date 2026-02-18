import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import LoginForm from '@/components/auth/LoginForm';

export default async function LoginPage() {
    const supabase = createServerComponentClient({ cookies });
    const {
        data: { session },
    } = await supabase.auth.getSession();

    if (session?.user?.id) {
        const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', session.user.id)
            .single();

        if (profile?.role === 'admin') {
            redirect('/admin');
        }

        redirect('/dashboard');
    }

    return (
        <main className="flex min-h-screen items-center justify-center bg-[#0a0a0a] p-6">
            <LoginForm />
        </main>
    );
}
