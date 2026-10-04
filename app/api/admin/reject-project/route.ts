import { NextRequest, NextResponse } from 'next/server';
import { createServerClientInstance } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
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

    const { project_id, reason } = await request.json();

    if (!reason || reason.length < 10) {
      return NextResponse.json({ error: 'Rejection reason must be at least 10 characters' }, { status: 400 });
    }

    const { error } = await supabase
      .from('projects')
      .update({ status: 'closed' })
      .eq('id', project_id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Create notification
    const { data: project } = await supabase
      .from('projects')
      .select('project_head_id, title')
      .eq('id', project_id)
      .single();

    if (project) {
      await supabase.from('notifications').insert({
        user_id: project.project_head_id,
        title: 'Project Rejected',
        message: `Your project "${project.title}" was rejected. Reason: ${reason}`,
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to reject project' }, { status: 500 });
  }
}