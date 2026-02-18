import { subDays } from 'date-fns';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export default async function AdminDashboardPage() {
    const supabase = createServerComponentClient({ cookies });

    const { data: complaints } = await supabase
        .from('complaints')
        .select('id, status, created_at, resolved_at');

    const { data: validations } = await supabase
        .from('validations')
        .select('validator_id');

    const resolvedBoundary = subDays(new Date(), 7).toISOString();

    const byStatus = (complaints || []).reduce<Record<string, number>>((acc, complaint) => {
        const key = complaint.status;
        acc[key] = (acc[key] || 0) + 1;
        return acc;
    }, {});

    const pendingReview = (complaints || []).filter((c) => c.status === 'submitted' || c.status === 'under_review').length;
    const resolvedThisWeek = (complaints || []).filter((c) => c.resolved_at && c.resolved_at >= resolvedBoundary).length;
    const uniqueValidators = new Set((validations || []).map((entry) => entry.validator_id)).size;

    return (
        <main className="space-y-6">
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>

            <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                <article className="rounded-xl border border-white/10 bg-white/5 p-4">
                    <p className="text-sm text-gray-300">Total by status</p>
                    <ul className="mt-3 space-y-1 text-sm text-white">
                        {Object.entries(byStatus).map(([status, count]) => (
                            <li key={status} className="flex justify-between">
                                <span className="capitalize">{status.replace('_', ' ')}</span>
                                <span>{count}</span>
                            </li>
                        ))}
                    </ul>
                </article>

                <article className="rounded-xl border border-white/10 bg-white/5 p-4">
                    <p className="text-sm text-gray-300">Pending review</p>
                    <p className="mt-2 text-3xl font-bold">{pendingReview}</p>
                </article>

                <article className="rounded-xl border border-white/10 bg-white/5 p-4">
                    <p className="text-sm text-gray-300">Resolved this week</p>
                    <p className="mt-2 text-3xl font-bold">{resolvedThisWeek}</p>
                </article>

                <article className="rounded-xl border border-white/10 bg-white/5 p-4">
                    <p className="text-sm text-gray-300">Active validators</p>
                    <p className="mt-2 text-3xl font-bold">{uniqueValidators}</p>
                </article>
            </section>
        </main>
    );
}
