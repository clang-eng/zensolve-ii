import { redirect } from 'next/navigation';

export default function DeprecatedAdminLoginPage() {
    redirect('/login');
}
