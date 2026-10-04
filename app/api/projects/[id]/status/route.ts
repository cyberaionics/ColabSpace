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

    const { data: project, error } = await supabase
      .from('projects')
      .select(`
        *,
        organization:organizations(id, name),
        project_head:users(id, full_name, email),
        approved_by_user:users!approved_by(id, full_name),
        rejected_by_user:users!rejected_by(id, full_name)
      `)
      .eq('id', params.id)
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Get status history
    const { data: history } = await supabase
      .from('project_status_history')
      .select(`
        *,
        changed_by_user:users(id, full_name)
      `)
      .eq('project_id', params.id)
      .order('created_at', { ascending: false });

    // Check permissions
    const isProjectHead = project.project_head_id === user.id;
    
    // Check reviewer access
    const { data: profile } = await supabase
      .from('users')
      .select('role, organization_id')
      .eq('id', user.id)
      .single();

    let isReviewer = false;
    if (profile) {
      if (profile.role === 'super_admin') {
        isReviewer = true;
      } else if (profile.role === 'club_secretary' && profile.organization_id === project.organization_id) {
        isReviewer = true;
      }
    }

    const permissions = {
      canEdit: isProjectHead && project.status === 'pending_approval',
      canWithdraw: isProjectHead && ['pending_approval', 'closed'].includes(project.status),
      canResubmit: isProjectHead && project.status === 'closed' && project.rejection_reason,
      canApprove: isReviewer && project.status === 'pending_approval',
      canReject: isReviewer && project.status === 'pending_approval',
    };

    return NextResponse.json({
      success: true,
      project,
      history: history || [],
      permissions,
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch project status' }, { status: 500 });
  }
}