import Link from 'next/link';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

const statuses = ['submitted', 'under_review', 'assigned', 'in_progress', 'resolved', 'validated', 'reopened', 'rejected'];

type ComplaintRow = {
    id: string;
    category: string;
    status: string;
    created_at: string;
    assigned_to: string | null;
    user_id: string;
    users: { full_name: string } | null;
    assigned_user: { full_name: string } | null;
};

export default async function AdminComplaintsPage({ searchParams }: { searchParams: { status?: string } }) {
    const supabase = createServerComponentClient({ cookies });
    const selectedStatus = searchParams.status && statuses.includes(searchParams.status) ? searchParams.status : 'all';

    let query = supabase
        .from('complaints')
        .select('id, category, status, created_at, assigned_to, user_id, users!complaints_user_id_fkey(full_name), assigned_user:users!complaints_assigned_to_fkey(full_name)')
        .order('created_at', { ascending: false });

    if (selectedStatus !== 'all') {
        query = query.eq('status', selectedStatus);
    }

    const { data: complaints } = await query;
    const rows = (complaints || []) as unknown as ComplaintRow[];

    return (
        <main className="space-y-4">
            <h1 className="text-2xl font-bold">Complaints</h1>

            <div className="flex flex-wrap gap-2">
                <Link href="/admin/complaints" className={`rounded-full px-3 py-1 text-sm ${selectedStatus === 'all' ? 'bg-teal-500 text-black' : 'bg-white/10'}`}>
                    all
                </Link>
                {statuses.map((status) => (
                    <Link
                        key={status}
                        href={`/admin/complaints?status=${status}`}
                        className={`rounded-full px-3 py-1 text-sm ${selectedStatus === status ? 'bg-teal-500 text-black' : 'bg-white/10'}`}
                    >
                        {status}
                    </Link>
                ))}
            </div>

            <div className="overflow-x-auto rounded-xl border border-white/10">
                <table className="min-w-full text-sm">
                    <thead className="bg-white/10 text-left">
                        <tr>
                            <th className="px-4 py-2">ID</th>
                            <th className="px-4 py-2">Category</th>
                            <th className="px-4 py-2">Status</th>
                            <th className="px-4 py-2">Submitted by</th>
                            <th className="px-4 py-2">Date</th>
                            <th className="px-4 py-2">Assigned to</th>
                        </tr>
                    </thead>
                    <tbody>
                        {rows.map((complaint) => (
                            <tr key={complaint.id} className="border-t border-white/10 hover:bg-white/5">
                                <td className="px-4 py-2">
                                    <Link href={`/admin/complaints/${complaint.id}`} className="text-teal-300 hover:underline">
                                        {complaint.id.slice(0, 8)}...
                                    </Link>
                                </td>
                                <td className="px-4 py-2">{complaint.category}</td>
                                <td className="px-4 py-2">{complaint.status}</td>
                                <td className="px-4 py-2">{complaint.users?.full_name ?? complaint.user_id}</td>
                                <td className="px-4 py-2">{new Date(complaint.created_at).toLocaleDateString()}</td>
                                <td className="px-4 py-2">{complaint.assigned_user?.full_name ?? '-'}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </main>
    );
}
