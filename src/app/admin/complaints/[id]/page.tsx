import Link from 'next/link';
import { revalidatePath } from 'next/cache';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

const transitions: Record<string, string[]> = {
    submitted: ['under_review', 'rejected'],
    under_review: ['assigned', 'rejected'],
    assigned: ['in_progress', 'rejected'],
    in_progress: ['resolved', 'rejected'],
    resolved: ['validated', 'reopened', 'rejected'],
    reopened: ['under_review', 'rejected'],
    validated: ['rejected'],
    rejected: [],
};

export default async function AdminComplaintDetailPage({ params }: { params: { id: string } }) {
    const supabase = createServerComponentClient({ cookies });

    const { data: complaint } = await supabase
        .from('complaints')
        .select('id, title, description, category, status, created_at, assigned_to, user_id, address')
        .eq('id', params.id)
        .single();

    if (!complaint) {
        redirect('/admin/complaints');
    }

    async function updateStatus(formData: FormData) {
        'use server';

        const nextStatus = formData.get('nextStatus');
        if (typeof nextStatus !== 'string') {
            return;
        }

        const currentAllowed = transitions[complaint.status] || [];
        if (!currentAllowed.includes(nextStatus)) {
            return;
        }

        const serverSupabase = createServerComponentClient({ cookies });
        await serverSupabase
            .from('complaints')
            .update({ status: nextStatus, updated_at: new Date().toISOString() })
            .eq('id', complaint.id);

        revalidatePath(`/admin/complaints/${complaint.id}`);
        revalidatePath('/admin/complaints');
        revalidatePath('/admin');
    }

    return (
        <main className="space-y-6">
            <Link href="/admin/complaints" className="text-sm text-teal-300 hover:underline">← Back to complaints</Link>

            <section className="rounded-xl border border-white/10 bg-white/5 p-5">
                <h1 className="text-2xl font-bold">{complaint.title}</h1>
                <p className="mt-3 text-gray-200">{complaint.description}</p>

                <dl className="mt-5 grid gap-2 text-sm text-gray-300 md:grid-cols-2">
                    <div><dt className="text-gray-500">ID</dt><dd>{complaint.id}</dd></div>
                    <div><dt className="text-gray-500">Category</dt><dd>{complaint.category}</dd></div>
                    <div><dt className="text-gray-500">Status</dt><dd>{complaint.status}</dd></div>
                    <div><dt className="text-gray-500">Submitted</dt><dd>{new Date(complaint.created_at).toLocaleString()}</dd></div>
                    <div><dt className="text-gray-500">Submitted by</dt><dd>{complaint.user_id}</dd></div>
                    <div><dt className="text-gray-500">Assigned to</dt><dd>{complaint.assigned_to ?? '-'}</dd></div>
                    <div className="md:col-span-2"><dt className="text-gray-500">Address</dt><dd>{complaint.address ?? '-'}</dd></div>
                </dl>
            </section>

            <section className="rounded-xl border border-white/10 bg-white/5 p-5">
                <h2 className="text-lg font-semibold">Update status</h2>
                <div className="mt-3 flex flex-wrap gap-2">
                    {(transitions[complaint.status] || []).map((nextStatus) => (
                        <form key={nextStatus} action={updateStatus}>
                            <input type="hidden" name="nextStatus" value={nextStatus} />
                            <button type="submit" className="rounded-md bg-teal-500 px-3 py-1.5 text-sm font-medium text-black hover:bg-teal-400">
                                Move to {nextStatus}
                            </button>
                        </form>
                    ))}
                </div>
            </section>
        </main>
    );
}
