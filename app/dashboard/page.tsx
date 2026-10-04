import { getCurrentUserProfile } from '@/lib/auth/utils';
import { redirect } from 'next/navigation';
import { DashboardContent } from '@/components/dashboard/DashboardContent';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';

export default async function DashboardPage() {
  const profile = await getCurrentUserProfile();
  
  if (!profile) {
    redirect('/login');
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-8">
        <DashboardContent />
      </main>
      <Footer />
    </div>
  );
}