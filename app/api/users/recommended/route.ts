import { NextRequest, NextResponse } from 'next/server';
import { createServerClientInstance } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerClientInstance();
    
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    // Get user skills
    const { data: userData } = await supabase
      .from('users')
      .select('skills')
      .eq('id', user.id)
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
      return NextResponse.json({ error: error?.message || 'Failed to fetch projects' }, { status: 500 });
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

    return NextResponse.json({ data: recommended });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch recommendations' }, { status: 500 });
  }
}