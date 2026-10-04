import { getCurrentUserProfile } from '@/lib/auth/utils';
import { redirect } from 'next/navigation';
import { ProfileContent } from '@/components/profile/ProfileContent';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';

interface ProfilePageProps {
  params: {
    id: string;
  };
}

export default async function ProfilePage({ params }: ProfilePageProps) {
  const currentUser = await getCurrentUserProfile();
  
  if (!currentUser) {
    redirect('/login');
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-8">
        <ProfileContent userId={params.id} currentUserId={currentUser.id} />
      </main>
      <Footer />
    </div>
  );
}