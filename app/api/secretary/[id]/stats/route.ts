import { NextRequest, NextResponse } from 'next/server';
import { createServerClientInstance } from '@/lib/supabase/server';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = await createServerClientInstance();
    
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from('users')
      .select('role, organization_id')
      .eq('id', user.id)
      .single();

    if (!profile || profile.role !== 'club_secretary') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    if (profile.organization_id !== params.id) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    const { count: totalProjects } = await supabase
      .from('projects')
      .select('*', { count: 'exact', head: false })
      .eq('organization_id', params.id);

    const { count: pendingApplications } = await supabase
      .from('applications')
      .select('*', { count: 'exact', head: false })
      .eq('status', 'pending');

    const { count: totalMembers } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: false })
      .eq('organization_id', params.id);

    return NextResponse.json({
      success: true,
      stats: {
        totalProjects: totalProjects || 0,
        pendingApplications: pendingApplications || 0,
        pendingSubmissions: 0,
        totalMembers: totalMembers || 0,
      },
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
  }
}