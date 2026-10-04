'use server';

import { createServerClientInstance } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';

const updateProfileSchema = z.object({
  full_name: z.string().min(2, 'Name must be at least 2 characters').optional(),
  bio: z.string().max(500, 'Bio must be less than 500 characters').optional(),
  github_url: z.string().url('Invalid GitHub URL').optional().or(z.literal('')),
  portfolio_url: z.string().url('Invalid portfolio URL').optional().or(z.literal('')),
  skills: z.array(z.string()).optional(),
  branch: z.string().optional(),
  year: z.number().min(1).max(10).optional(),
});

export interface UpdateProfileInput {
  full_name?: string;
  bio?: string;
  github_url?: string;
  portfolio_url?: string;
  skills?: string[];
  branch?: string;
  year?: number;
}

export async function updateProfileAction(input: UpdateProfileInput) {
  const supabase = await createServerClientInstance();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { success: false, error: 'Not authenticated' };
  }

  // Validate input
  const validatedData = updateProfileSchema.parse(input);

  // Update user profile
  const { error } = await supabase
    .from('users')
    .update({
      full_name: validatedData.full_name,
      bio: validatedData.bio,
      github_url: validatedData.github_url,
      portfolio_url: validatedData.portfolio_url,
      skills: validatedData.skills,
      branch: validatedData.branch,
      year: validatedData.year,
    })
    .eq('id', user.id);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath('/dashboard');
  revalidatePath('/profile');
  return { success: true };
}

export async function getUserProfile(userId: string) {
  const supabase = await createServerClientInstance();

  const { data: profile, error } = await supabase
    .from('users')
    .select(`
      *,
      organization:organizations(id, name)
    `)
    .eq('id', userId)
    .single();

  if (error) {
    return { data: null, error: error.message };
  }

  return { data: profile, error: null };
}

export async function getCurrentUserProfile() {
  const supabase = await createServerClientInstance();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { data: null, error: 'Not authenticated' };
  }

  const { data: profile, error } = await supabase
    .from('users')
    .select(`
      *,
      organization:organizations(id, name)
    `)
    .eq('id', user.id)
    .single();

  if (error) {
    return { data: null, error: error.message };
  }

  return { data: profile, error: null };
}

export async function getMyProjects(userId: string) {
  const supabase = await createServerClientInstance();

  const { data: projects, error } = await supabase
    .from('projects')
    .select('*')
    .eq('project_head_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    return { data: [], error: error.message };
  }

  return { data: projects, error: null };
}

export async function getMyApplications(userId: string) {
  const supabase = await createServerClientInstance();

  const { data: applications, error } = await supabase
    .from('applications')
    .select(`
      *,
      project:projects(id, title, organization_id, status, deadline)
    `)
    .eq('user_id', userId)
    .order('applied_at', { ascending: false });

  if (error) {
    return { data: [], error: error.message };
  }

  return { data: applications, error: null };
}

export async function getIncomingApplications(projectId: string) {
  const supabase = await createServerClientInstance();

  const { data: applications, error } = await supabase
    .from('applications')
    .select(`
      *,
      user:users(id, full_name, email, avatar_url)
    `)
    .eq('project_id', projectId)
    .eq('status', 'pending')
    .order('applied_at', { ascending: false });

  if (error) {
    return { data: [], error: error.message };
  }

  return { data: applications, error: null };
}

export async function getActivityFeed(userId: string, limit: number = 20) {
  const supabase = await createServerClientInstance();

  const { data: activities, error } = await supabase
    .from('user_activities')
    .select(`
      *,
      project:projects(id, title)
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    return { data: [], error: error.message };
  }

  return { data: activities, error: null };
}

export async function getRecommendedProjects(userId: string) {
  const supabase = await createServerClientInstance();

  // Get user skills
  const { data: userData } = await supabase
    .from('users')
    .select('skills')
    .eq('id', userId)
    .single();

  const userSkills = userData?.skills || [];

  // Get open projects
  const { data: projects, error } = await supabase
    .from('projects')
    .select(`
      *,
      organization:organizations(id, name)
    `)
    .eq('status', 'open')
    .order('created_at', { ascending: false })
    .limit(20);

  if (error || !projects) {
    return { data: [], error: error?.message || 'Failed to fetch projects' };
  }

  // Calculate overlap score
  const recommended = projects
    .map((project) => {
      const projectSkills = project.required_skills || [];
      const overlap = userSkills.filter((skill: string) =>
        projectSkills.some((ps: string) => ps.toLowerCase() === skill.toLowerCase())
      ).length;

      return {
        ...project,
        overlap_score: overlap,
      };
    })
    .filter((p) => p.overlap_score > 0)
    .sort((a, b) => b.overlap_score - a.overlap_score)
    .slice(0, 10);

  return { data: recommended, error: null };
}

export async function getProjectStats(userId: string) {
  const supabase = await createServerClientInstance();

  // Count projects as project head
  const { count: projectHeadCount } = await supabase
    .from('projects')
    .select('*', { count: 'exact', head: false })
    .eq('project_head_id', userId);

  // Count projects as member
  const { count: memberCount } = await supabase
    .from('project_members')
    .select('*', { count: 'exact', head: false })
    .eq('user_id', userId);

  return {
    projectHeadCount: projectHeadCount || 0,
    memberCount: memberCount || 0,
  };
}