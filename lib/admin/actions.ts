'use server';

import { createServerClientInstance } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';

const rejectProjectSchema = z.object({
  project_id: z.string().uuid(),
  reason: z.string().min(10, 'Rejection reason must be at least 10 characters'),
});

export async function getAdminStats() {
  const supabase = await createServerClientInstance();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { success: false, error: 'Not authenticated' };
  }

  // Get user profile
  const { data: profile } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single();

  if (!profile || profile.role !== 'super_admin') {
    return { success: false, error: 'Unauthorized' };
  }

  // Get stats
  const { count: totalUsers } = await supabase
    .from('users')
    .select('*', { count: 'exact', head: false });

  const { count: totalProjects } = await supabase
    .from('projects')
    .select('*', { count: 'exact', head: false });

  const { count: pendingProjects } = await supabase
    .from('projects')
    .select('*', { count: 'exact', head: false })
    .eq('status', 'pending_approval');

  const { count: totalOrganizations } = await supabase
    .from('organizations')
    .select('*', { count: 'exact', head: false });

  return {
    success: true,
    stats: {
      totalUsers: totalUsers || 0,
      totalProjects: totalProjects || 0,
      pendingProjects: pendingProjects || 0,
      totalOrganizations: totalOrganizations || 0,
    },
  };
}

export async function getPendingProjects() {
  const supabase = await createServerClientInstance();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { success: false, error: 'Not authenticated' };
  }

  const { data: profile } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single();

  if (!profile || profile.role !== 'super_admin') {
    return { success: false, error: 'Unauthorized' };
  }

  const { data: projects, error } = await supabase
    .from('projects')
    .select(`
      *,
      organization:organizations(id, name),
      project_head:users(id, full_name, email)
    `)
    .eq('status', 'pending_approval')
    .order('created_at', { ascending: false });

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true, projects };
}

export async function approveProject(projectId: string) {
  const supabase = await createServerClientInstance();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { success: false, error: 'Not authenticated' };
  }

  const { data: profile } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single();

  if (!profile || profile.role !== 'super_admin') {
    return { success: false, error: 'Unauthorized' };
  }

  const { error } = await supabase
    .from('projects')
    .update({ status: 'open' })
    .eq('id', projectId);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath('/admin');
  return { success: true };
}

export async function rejectProject(projectId: string, reason: string) {
  const supabase = await createServerClientInstance();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { success: false, error: 'Not authenticated' };
  }

  const { data: profile } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single();

  if (!profile || profile.role !== 'super_admin') {
    return { success: false, error: 'Unauthorized' };
  }

  // Validate input
  const validated = rejectProjectSchema.parse({ project_id: projectId, reason });

  // Update project status to closed
  const { error } = await supabase
    .from('projects')
    .update({ status: 'closed' })
    .eq('id', validated.project_id);

  if (error) {
    return { success: false, error: error.message };
  }

  // Create notification for project head
  const { data: project } = await supabase
    .from('projects')
    .select('project_head_id, title')
    .eq('id', validated.project_id)
    .single();

  if (project) {
    await supabase.from('notifications').insert({
      user_id: project.project_head_id,
      title: 'Project Rejected',
      message: `Your project "${project.title}" was rejected. Reason: ${validated.reason}`,
    });
  }

  revalidatePath('/admin');
  return { success: true };
}

export async function getRecentSignups(limit: number = 20) {
  const supabase = await createServerClientInstance();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { success: false, error: 'Not authenticated' };
  }

  const { data: profile } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single();

  if (!profile || profile.role !== 'super_admin') {
    return { success: false, error: 'Unauthorized' };
  }

  const { data: users, error } = await supabase
    .from('users')
    .select(`
      *,
      organization:organizations(id, name)
    `)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true, users };
}

export async function suspendUser(userId: string, reason: string, durationDays?: number) {
  const supabase = await createServerClientInstance();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { success: false, error: 'Not authenticated' };
  }

  const { data: profile } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single();

  if (!profile || profile.role !== 'super_admin') {
    return { success: false, error: 'Unauthorized' };
  }

  const suspensionEndDate = durationDays
    ? new Date(Date.now() + durationDays * 24 * 60 * 60 * 1000).toISOString()
    : null;

  const { error } = await supabase
    .from('users')
    .update({
      is_suspended: true,
      suspension_reason: reason,
      suspension_start_date: new Date().toISOString(),
      suspension_end_date: suspensionEndDate,
    })
    .eq('id', userId);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath('/admin');
  return { success: true };
}

export async function unsuspendUser(userId: string) {
  const supabase = await createServerClientInstance();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { success: false, error: 'Not authenticated' };
  }

  const { data: profile } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single();

  if (!profile || profile.role !== 'super_admin') {
    return { success: false, error: 'Unauthorized' };
  }

  const { error } = await supabase
    .from('users')
    .update({
      is_suspended: false,
      suspension_reason: null,
      suspension_start_date: null,
      suspension_end_date: null,
    })
    .eq('id', userId);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath('/admin');
  return { success: true };
}

export async function getSystemSettings() {
  const supabase = await createServerClientInstance();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { success: false, error: 'Not authenticated' };
  }

  const { data: profile } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single();

  if (!profile || profile.role !== 'super_admin') {
    return { success: false, error: 'Unauthorized' };
  }

  const { data: settings, error } = await supabase
    .from('system_settings')
    .select('*');

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true, settings };
}

export async function updateSystemSetting(key: string, value: string) {
  const supabase = await createServerClientInstance();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { success: false, error: 'Not authenticated' };
  }

  const { data: profile } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single();

  if (!profile || profile.role !== 'super_admin') {
    return { success: false, error: 'Unauthorized' };
  }

  const { error } = await supabase
    .from('system_settings')
    .update({ value, updated_by: user.id })
    .eq('key', key);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath('/admin');
  return { success: true };
}

export async function exportUsersCSV() {
  const supabase = await createServerClientInstance();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { success: false, error: 'Not authenticated' };
  }

  const { data: profile } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single();

  if (!profile || profile.role !== 'super_admin') {
    return { success: false, error: 'Unauthorized' };
  }

  const { data: users, error } = await supabase
    .from('users')
    .select(`
      id,
      email,
      full_name,
      role,
      branch,
      year,
      organization:organizations(name)
    `);

  if (error) {
    return { success: false, error: error.message };
  }

  const csv = [
    ['ID', 'Email', 'Full Name', 'Role', 'Branch', 'Year', 'Organization'],
    ...users.map((u) => [
      u.id,
      u.email,
      u.full_name,
      u.role,
      u.branch || '',
      u.year || '',
      (u as any).organization?.name || '',
    ]),
  ]
    .map((row) => row.map((cell) => `"${cell}"`).join(','))
    .join('\n');

  return { success: true, csv };
}