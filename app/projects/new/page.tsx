import { getCurrentUserProfile } from '@/lib/auth/utils';
import { redirect } from 'next/navigation';
import { PostProjectForm } from '@/components/projects/PostProjectForm';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';

export default async function NewProjectPage() {
  const profile = await getCurrentUserProfile();
  
  if (!profile) {
    redirect('/login');
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Create New Project</h1>
          <p className="text-muted-foreground mt-2">
            Fill in the details to create your project
          </p>
        </div>
        <PostProjectForm />
      </main>
      <Footer />
    </div>
  );
}