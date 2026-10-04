import { getCurrentUserProfile } from '@/lib/auth/utils';
import { redirect } from 'next/navigation';
import { SecretaryDashboard } from '@/components/secretary/SecretaryDashboard';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';

interface SecretaryPageProps {
  params: {
    id: string;
  };
}

export default async function SecretaryPage({ params }: SecretaryPageProps) {
  const profile = await getCurrentUserProfile();
  
  if (!profile) {
    redirect('/login');
  }

  if (profile.role !== 'club_secretary') {
    redirect('/dashboard');
  }

  // Verify organization access
  if (profile.organization_id !== params.id) {
    redirect('/dashboard');
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-8">
        <SecretaryDashboard organizationId={params.id} />
      </main>
      <Footer />
    </div>
  );
}