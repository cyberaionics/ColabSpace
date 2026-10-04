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

    const { data: profile } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!profile || profile.role !== 'super_admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

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

    return NextResponse.json({
      success: true,
      stats: {
        totalUsers: totalUsers || 0,
        totalProjects: totalProjects || 0,
        pendingProjects: pendingProjects || 0,
        totalOrganizations: totalOrganizations || 0,
      },
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
  }
}