import Link from 'next/link';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import AdminLogoutButton from '@/components/admin/AdminLogoutButton';

const navItems = [
    { href: '/admin', label: 'Dashboard' },
    { href: '/admin/complaints', label: 'Complaints' },
    { href: '/admin/users', label: 'Users' },
    { href: '/admin/departments', label: 'Departments' },
    { href: '/admin/audit-log', label: 'Audit Log' },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
    const supabase = createServerComponentClient({ cookies });
    const {
        data: { session },
    } = await supabase.auth.getSession();

    if (!session?.user?.id) {
        redirect('/login');
    }

    const { data: profile } = await supabase
        .from('profiles')
        .select('full_name, role')
        .eq('id', session.user.id)
        .single();

    if (!profile || profile.role !== 'admin') {
        redirect('/unauthorized');
    }

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-white">
            <div className="mx-auto flex max-w-7xl">
                <aside className="min-h-screen w-64 border-r border-white/10 p-6">
                    <p className="text-lg font-semibold">ZenSolve Admin</p>
                    <nav className="mt-8 space-y-2">
                        {navItems.map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                className="block rounded-md px-3 py-2 text-sm text-gray-200 hover:bg-white/10"
                            >
                                {item.label}
                            </Link>
                        ))}
                    </nav>
                </aside>

                <section className="flex-1 p-6">
                    <header className="mb-8 flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-4 py-3">
                        <div>
                            <p className="text-xs uppercase tracking-wide text-gray-400">Signed in as</p>
                            <p className="font-medium">{profile.full_name || session.user.email}</p>
                        </div>
                        <AdminLogoutButton />
                    </header>

                    {children}
                </section>
            </div>
        </div>
    );
}
