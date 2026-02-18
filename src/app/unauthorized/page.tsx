import Link from 'next/link';

export default function UnauthorizedPage() {
    return (
        <main className="flex min-h-screen flex-col items-center justify-center bg-[#0a0a0a] px-6 text-center text-white">
            <h1 className="text-3xl font-bold">Unauthorized</h1>
            <p className="mt-3 text-gray-300">You do not have permission to access this area.</p>
            <div className="mt-6 flex gap-3">
                <Link href="/dashboard" className="rounded-md bg-teal-500 px-4 py-2 font-medium text-black hover:bg-teal-400">Dashboard</Link>
                <Link href="/" className="rounded-md border border-white/20 px-4 py-2 hover:border-white/40">Home</Link>
            </div>
        </main>
    );
}
