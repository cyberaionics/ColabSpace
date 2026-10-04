import { getCurrentUserProfile } from '@/lib/auth/utils';
import { redirect } from 'next/navigation';
import { ProjectStatusPage } from '@/components/projects/ProjectStatusPage';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';

interface ProjectStatusPageProps {
  params: {
    id: string;
  };
}

export default async function ProjectStatusPageRoute({ params }: ProjectStatusPageProps) {
  const profile = await getCurrentUserProfile();
  
  if (!profile) {
    redirect('/login');
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-8">
        <ProjectStatusPage projectId={params.id} userId={profile.id} userRole={profile.role} />
      </main>
      <Footer />
    </div>
  );
}