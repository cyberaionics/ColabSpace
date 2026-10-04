'use server';

import { createServerClientInstance } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export interface CreateProjectInput {
  title: string;
  tagline?: string;
  description: string;
  organization_id: string;
  domain?: string;
  deadline?: string;
  cover_image?: string;
  focus_points?: string[];
  learning_objectives?: string[];
  deliverables?: string[];
  milestones?: Array<{
    title: string;
    description?: string;
    due_date?: string;
  }>;
  resources?: Array<{
    title: string;
    url?: string;
    resource_type?: 'document' | 'link' | 'image' | 'video';
  }>;
  github_url?: string;
  team_size: number;
  required_skills?: string[];
  contributor_description?: string;
}

export async function createProjectAction(input: CreateProjectInput) {
  const supabase = await createServerClientInstance();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { success: false, error: 'Not authenticated' };
  }

  // Get user profile to verify role and organization
  const { data: profile, error: profileError } = await supabase
    .from('users')
    .select('id, role, organization_id')
    .eq('id', user.id)
    .single();

  if (profileError || !profile) {
    return { success: false, error: 'User profile not found' };
  }

  // Validate required fields
  if (!input.title || input.title.trim().length < 3) {
    return { success: false, error: 'Title must be at least 3 characters' };
  }

  if (!input.description || input.description.trim().length < 10) {
    return { success: false, error: 'Description must be at least 10 characters' };
  }

  if (!input.organization_id) {
    return { success: false, error: 'Organization is required' };
  }

  if (!input.team_size || input.team_size < 1 || input.team_size > 50) {
    return { success: false, error: 'Team size must be between 1 and 50' };
  }

  // Call the atomic RPC function
  const { data, error } = await supabase.rpc('create_project_with_members', {
    p_title: input.title,
    p_tagline: input.tagline || null,
    p_description: input.description,
    p_organization_id: input.organization_id,
    p_domain: input.domain || null,
    p_deadline: input.deadline || null,
    p_cover_image: input.cover_image || null,
    p_focus_points: input.focus_points || [],
    p_learning_objectives: input.learning_objectives || [],
    p_deliverables: input.deliverables || [],
    p_milestones: JSON.stringify(input.milestones || []),
    p_resources: JSON.stringify(input.resources || []),
    p_github_url: input.github_url || null,
    p_team_size: input.team_size,
    p_required_skills: input.required_skills || [],
    p_contributor_description: input.contributor_description || null,
  });

  if (error) {
    return { success: false, error: error.message };
  }

  if (!data || !data.success) {
    return { success: false, error: data?.error || 'Failed to create project' };
  }

  revalidatePath('/projects');
  return { success: true, project_id: data.project_id, status: data.status };
}

export async function uploadCoverImage(file: File): Promise<{ success: boolean; url?: string; error?: string }> {
  const supabase = await createServerClientInstance();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { success: false, error: 'Not authenticated' };
  }

  // Validate file
  const maxSize = 5 * 1024 * 1024; // 5MB
  if (file.size > maxSize) {
    return { success: false, error: 'File size must be less than 5MB' };
  }

  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
  if (!allowedTypes.includes(file.type)) {
    return { success: false, error: 'Invalid file type. Allowed: JPEG, PNG, WebP, GIF' };
  }

  // Generate unique filename
  const fileExt = file.name.split('.').pop() || 'jpg';
  const fileName = `${user.id}/${Date.now()}-${Math.random().toString(36).substring(2, 15)}.${fileExt}`;

  const { data, error } = await supabase.storage
    .from('project-covers')
    .upload(fileName, file, {
      cacheControl: '3600',
      upsert: false,
    });

  if (error) {
    return { success: false, error: error.message };
  }

  const { data: urlData } = supabase.storage
    .from('project-covers')
    .getPublicUrl(data.path);

  return { success: true, url: urlData.publicUrl };
}