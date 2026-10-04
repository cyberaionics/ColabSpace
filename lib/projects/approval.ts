'use server';

import { createServerClientInstance } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';

const rejectProjectSchema = z.object({
  project_id: z.string().uuid(),
  reason: z.string().min(10, 'Rejection reason must be at least 10 characters'),
});

export async function getProjectStatus(projectId: string) {
  const supabase = await createServerClientInstance();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { success: false, error: 'Not authenticated' };
  }

  const { data: project, error } = await supabase
    .from('projects')
    .select(`
      *,
      organization:organizations(id, name),
      project_head:users(id, full_name, email),
      approved_by_user:users!approved_by(id, full_name),
      rejected_by_user:users!rejected_by(id, full_name)
    `)
    .eq('id', projectId)
    .single();

  if (error) {
    return { success: false, error: error.message };
  }

  // Get status history
  const { data: history } = await supabase
    .from('project_status_history')
    .select(`
      *,
      changed_by_user:users(id, full_name)
    `)
    .eq('project_id', projectId)
    .order('created_at', { ascending: false });

  // Check if user can edit/withdraw
  const isProjectHead = project.project_head_id === user.id;
  const isReviewer = await checkReviewerAccess(user.id, project.organization_id);

  return {
    success: true,
    project,
    history: history || [],
    permissions: {
      canEdit: isProjectHead && project.status === 'pending_approval',
      canWithdraw: isProjectHead && ['pending_approval', 'closed'].includes(project.status),
      canResubmit: isProjectHead && project.status === 'closed' && project.rejection_reason,
      canApprove: isReviewer && project.status === 'pending_approval',
      canReject: isReviewer && project.status === 'pending_approval',
    },
  };
}

async function checkReviewerAccess(userId: string, organizationId: string): Promise<boolean> {
  const supabase = await createServerClientInstance();
  
  const { data: profile } = await supabase
    .from('users')
    .select('role, organization_id')
    .eq('id', userId)
    .single();

  if (!profile) return false;

  if (profile.role === 'super_admin') return true;
  if (profile.role === 'club_secretary' && profile.organization_id === organizationId) return true;
  
  return false;
}

export async function approveProjectAction(projectId: string) {
  const supabase = await createServerClientInstance();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { success: false, error: 'Not authenticated' };
  }

  const { data, error } = await supabase.rpc('approve_project', {
    p_project_id: projectId,
  });

  if (error) {
    return { success: false, error: error.message };
  }

  if (!data || !data.success) {
    return { success: false, error: data?.error || 'Failed to approve project' };
  }

  revalidatePath(`/projects/${projectId}`);
  revalidatePath('/admin');
  return { success: true };
}

export async function rejectProjectAction(projectId: string, reason: string) {
  const supabase = await createServerClientInstance();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { success: false, error: 'Not authenticated' };
  }

  // Validate input
  const validated = rejectProjectSchema.parse({ project_id: projectId, reason });

  const { data, error } = await supabase.rpc('reject_project', {
    p_project_id: validated.project_id,
    p_reason: validated.reason,
  });

  if (error) {
    return { success: false, error: error.message };
  }

  if (!data || !data.success) {
    return { success: false, error: data?.error || 'Failed to reject project' };
  }

  revalidatePath(`/projects/${projectId}`);
  revalidatePath('/admin');
  return { success: true };
}

export async function withdrawProjectAction(projectId: string) {
  const supabase = await createServerClientInstance();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { success: false, error: 'Not authenticated' };
  }

  const { data, error } = await supabase.rpc('withdraw_project', {
    p_project_id: projectId,
  });

  if (error) {
    return { success: false, error: error.message };
  }

  if (!data || !data.success) {
    return { success: false, error: data?.error || 'Failed to withdraw project' };
  }

  revalidatePath(`/projects/${projectId}`);
  revalidatePath('/dashboard');
  return { success: true };
}

export async function resubmitProjectAction(projectId: string) {
  const supabase = await createServerClientInstance();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { success: false, error: 'Not authenticated' };
  }

  const { data, error } = await supabase.rpc('resubmit_project', {
    p_project_id: projectId,
  });

  if (error) {
    return { success: false, error: error.message };
  }

  if (!data || !data.success) {
    return { success: false, error: data?.error || 'Failed to resubmit project' };
  }

  revalidatePath(`/projects/${projectId}`);
  revalidatePath('/dashboard');
  return { success: true };
}

export async function getProjectStatusHistory(projectId: string) {
  const supabase = await createServerClientInstance();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { success: false, error: 'Not authenticated' };
  }

  const { data: history, error } = await supabase
    .from('project_status_history')
    .select(`
      *,
      changed_by_user:users(id, full_name)
    `)
    .eq('project_id', projectId)
    .order('created_at', { ascending: false });

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true, history: history || [] };
}