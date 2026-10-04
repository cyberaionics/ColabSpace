'use server';

import { createServerClientInstance } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export async function sendOtpAction(email: string) {
  try {
    if (!email.endsWith('@iitdh.ac.in')) {
      return { success: false, error: 'Invalid email domain' };
    }

    const supabase = await createServerClientInstance();
    
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
      },
    });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    return { success: false, error: 'Failed to send OTP' };
  }
}

export async function verifyOtpAction(email: string, token: string) {
  try {
    const supabase = await createServerClientInstance();
    
    const { data, error } = await supabase.auth.verifyOtp({
      email,
      token,
      type: 'email',
    });

    if (error || !data.user) {
      return { success: false, error: 'Invalid or expired OTP' };
    }

    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from('users')
      .select('id, role, organization_id')
      .eq('id', data.user.id)
      .single();

    if (profileError || !profile) {
      // User authenticated but no profile - redirect to onboarding
      return { success: true, redirect: '/onboarding' };
    }

    // Redirect based on role
    switch (profile.role) {
      case 'super_admin':
        return { success: true, redirect: '/admin' };
      case 'club_secretary':
        return { success: true, redirect: `/org/${profile.organization_id}/manage` };
      default:
        return { success: true, redirect: '/dashboard' };
    }
  } catch (error) {
    return { success: false, error: 'Verification failed' };
  }
}

export async function logoutAction() {
  const supabase = await createServerClientInstance();
  await supabase.auth.signOut();
  redirect('/login');
}
