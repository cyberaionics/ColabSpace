import { createServerClientInstance } from '@/lib/supabase/server';

export async function getCurrentUser() {
  const supabase = await createServerClientInstance();
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

export async function getCurrentUserProfile() {
  const supabase = await createServerClientInstance();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) return null;

  const { data: profile } = await supabase
    .from('users')
    .select('id, email, full_name, role, organization_id, branch, year')
    .eq('id', user.id)
    .single();

  return profile;
}

export async function requireAuth() {
  const user = await getCurrentUser();
  if (!user) {
    return { error: 'Unauthorized', redirect: '/login' };
  }
  return { user };
}

export async function requireRole(allowedRoles: string[]) {
  const profile = await getCurrentUserProfile();
  if (!profile) {
    return { error: 'No profile', redirect: '/onboarding' };
  }
  if (!allowedRoles.includes(profile.role)) {
    return { error: 'Forbidden', redirect: '/dashboard' };
  }
  return { profile };
}
