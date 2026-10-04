import { getCurrentUserProfile } from '@/lib/auth/utils';
import { redirect } from 'next/navigation';

export default async function OnboardingPage() {
  const profile = await getCurrentUserProfile();
  
  if (!profile) {
    redirect('/login');
  }
  
  // If profile exists, redirect to appropriate dashboard
  switch (profile.role) {
    case 'super_admin':
      redirect('/admin');
    case 'club_secretary':
      redirect(`/org/${profile.organization_id}/manage`);
    default:
      redirect('/dashboard');
  }
}
