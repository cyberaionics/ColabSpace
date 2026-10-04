import { getCurrentUserProfile } from '@/lib/auth/utils';
import { redirect } from 'next/navigation';
import { AdminDashboard } from '@/components/admin/AdminDashboard';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';

export default async function AdminPage() {
  const profile = await getCurrentUserProfile();
  
  if (!profile) {
    redirect('/login');
  }

  if (profile.role !== 'super_admin') {
    redirect('/dashboard');
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-8">
        <AdminDashboard />
      </main>
      <Footer />
    </div>
  );
}