-- Phase 9: Project Approval Lifecycle
-- Add fields for approval workflow

-- Add approval fields to projects table
alter table projects add column if not exists rejection_reason text;
alter table projects add column if not exists approved_by uuid references users(id);
alter table projects add column if not exists approved_at timestamptz;
alter table projects add column if not exists rejected_by uuid references users(id);
alter table projects add column if not exists rejected_at timestamptz;
alter table projects add column if not exists resubmission_count integer default 0;

-- Add project status enum values if not already present
-- Note: project_status enum already has 'open', 'closed', 'in_progress', 'completed'
-- We'll use 'pending_approval' as a status value

-- Create project status history table
create table if not exists project_status_history (
  id uuid primary key default uuid_generate_v4(),
  project_id uuid not null references projects(id) on delete cascade,
  old_status text,
  new_status text not null,
  changed_by uuid references users(id),
  reason text,
  created_at timestamptz default now()
);

-- Create index
create index if not exists idx_project_status_history_project_id on project_status_history(project_id);
create index if not exists idx_project_status_history_created_at on project_status_history(created_at);

-- Enable RLS
alter table project_status_history enable row level security;

-- Project status history policies
create policy "project_status_history_select" on project_status_history for select using (
  user_can_access_project(project_id)
);
create policy "project_status_history_insert" on project_status_history for insert with check (
  is_super_admin() or is_club_secretary()
);

-- Function to log status change
create or replace function log_project_status_change(
  p_project_id uuid,
  p_old_status text,
  p_new_status text,
  p_changed_by uuid,
  p_reason text default null
)
returns uuid as $$
declare
  v_history_id uuid;
begin
  insert into project_status_history (project_id, old_status, new_status, changed_by, reason)
  values (p_project_id, p_old_status, p_new_status, p_changed_by, p_reason)
  returning id into v_history_id;
  
  return v_history_id;
end;
$$ language plpgsql security definer set search_path = '';

-- Grant execute permission
grant execute on function log_project_status_change to authenticated;

-- Function to approve project (server-side authorization)
create or replace function approve_project(p_project_id uuid)
returns jsonb as $$
declare
  v_user_id uuid;
  v_user_role user_role;
  v_user_org_id uuid;
  v_project_org_id uuid;
  v_project_status text;
  v_project_head_id uuid;
begin
  v_user_id := auth.uid();
  if v_user_id is null then
    return jsonb_build_object('success', false, 'error', 'Not authenticated');
  end if;

  -- Get user role and organization
  select role, organization_id into v_user_role, v_user_org_id
  from users
  where id = v_user_id;

  if v_user_role is null then
    return jsonb_build_object('success', false, 'error', 'User profile not found');
  end if;

  -- Get project details
  select organization_id, status, project_head_id into v_project_org_id, v_project_status, v_project_head_id
  from projects
  where id = p_project_id;

  if v_project_org_id is null then
    return jsonb_build_object('success', false, 'error', 'Project not found');
  end if;

  -- Authorization check
  if v_user_role = 'super_admin' then
    -- Super admin can approve any project
  elsif v_user_role = 'club_secretary' then
    -- Club secretary can only approve projects in their organization
    if v_user_org_id != v_project_org_id then
      return jsonb_build_object('success', false, 'error', 'Unauthorized: Cannot approve projects from other organizations');
    end if;
  else
    return jsonb_build_object('success', false, 'error', 'Unauthorized: Only super admins and club secretaries can approve projects');
  end if;

  -- Check current status
  if v_project_status != 'pending_approval' then
    return jsonb_build_object('success', false, 'error', 'Project is not pending approval');
  end if;

  -- Update project status
  update projects
  set status = 'open',
      approved_by = v_user_id,
      approved_at = now(),
      updated_at = now()
  where id = p_project_id;

  -- Log status change
  perform log_project_status_change(p_project_id, 'pending_approval', 'open', v_user_id, 'Approved by ' || v_user_role);

  -- Notify project head
  insert into notifications (user_id, title, message)
  values (
    v_project_head_id,
    'Project Approved',
    'Your project has been approved and is now live!'
  );

  return jsonb_build_object('success', true);
exception
  when others then
    return jsonb_build_object('success', false, 'error', SQLERRM);
end;
$$ language plpgsql security definer set search_path = '';

-- Function to reject project (server-side authorization)
create or replace function reject_project(p_project_id uuid, p_reason text)
returns jsonb as $$
declare
  v_user_id uuid;
  v_user_role user_role;
  v_user_org_id uuid;
  v_project_org_id uuid;
  v_project_status text;
  v_project_head_id uuid;
begin
  v_user_id := auth.uid();
  if v_user_id is null then
    return jsonb_build_object('success', false, 'error', 'Not authenticated');
  end if;

  -- Get user role and organization
  select role, organization_id into v_user_role, v_user_org_id
  from users
  where id = v_user_id;

  if v_user_role is null then
    return jsonb_build_object('success', false, 'error', 'User profile not found');
  end if;

  -- Get project details
  select organization_id, status, project_head_id into v_project_org_id, v_project_status, v_project_head_id
  from projects
  where id = p_project_id;

  if v_project_org_id is null then
    return jsonb_build_object('success', false, 'error', 'Project not found');
  end if;

  -- Authorization check
  if v_user_role = 'super_admin' then
    -- Super admin can reject any project
  elsif v_user_role = 'club_secretary' then
    -- Club secretary can only reject projects in their organization
    if v_user_org_id != v_project_org_id then
      return jsonb_build_object('success', false, 'error', 'Unauthorized: Cannot reject projects from other organizations');
    end if;
  else
    return jsonb_build_object('success', false, 'error', 'Unauthorized: Only super admins and club secretaries can reject projects');
  end if;

  -- Check current status
  if v_project_status != 'pending_approval' then
    return jsonb_build_object('success', false, 'error', 'Project is not pending approval');
  end if;

  -- Validate reason
  if p_reason is null or length(trim(p_reason)) < 10 then
    return jsonb_build_object('success', false, 'error', 'Rejection reason must be at least 10 characters');
  end if;

  -- Update project status
  update projects
  set status = 'closed',
      rejection_reason = p_reason,
      rejected_by = v_user_id,
      rejected_at = now(),
      updated_at = now()
  where id = p_project_id;

  -- Log status change
  perform log_project_status_change(p_project_id, 'pending_approval', 'closed', v_user_id, 'Rejected: ' || p_reason);

  -- Notify project head
  insert into notifications (user_id, title, message)
  values (
    v_project_head_id,
    'Project Rejected',
    'Your project was rejected. Reason: ' || p_reason
  );

  return jsonb_build_object('success', true);
exception
  when others then
    return jsonb_build_object('success', false, 'error', SQLERRM);
end;
$$ language plpgsql security definer set search_path = '';

-- Function to withdraw project (project head only)
create or replace function withdraw_project(p_project_id uuid)
returns jsonb as $$
declare
  v_user_id uuid;
  v_project_head_id uuid;
  v_project_status text;
begin
  v_user_id := auth.uid();
  if v_user_id is null then
    return jsonb_build_object('success', false, 'error', 'Not authenticated');
  end if;

  -- Get project details
  select project_head_id, status into v_project_head_id, v_project_status
  from projects
  where id = p_project_id;

  if v_project_head_id is null then
    return jsonb_build_object('success', false, 'error', 'Project not found');
  end if;

  -- Authorization check - only project head can withdraw
  if v_project_head_id != v_user_id then
    return jsonb_build_object('success', false, 'error', 'Unauthorized: Only project head can withdraw');
  end if;

  -- Check current status
  if v_project_status not in ('pending_approval', 'closed') then
    return jsonb_build_object('success', false, 'error', 'Cannot withdraw project in current status');
  end if;

  -- Update project status
  update projects
  set status = 'closed',
      updated_at = now()
  where id = p_project_id;

  -- Log status change
  perform log_project_status_change(p_project_id, v_project_status, 'closed', v_user_id, 'Withdrawn by project head');

  return jsonb_build_object('success', true);
exception
  when others then
    return jsonb_build_object('success', false, 'error', SQLERRM);
end;
$$ language plpgsql security definer set search_path = '';

-- Function to resubmit project (project head only)
create or replace function resubmit_project(p_project_id uuid)
returns jsonb as $$
declare
  v_user_id uuid;
  v_project_head_id uuid;
  v_project_status text;
  v_resubmission_count integer;
begin
  v_user_id := auth.uid();
  if v_user_id is null then
    return jsonb_build_object('success', false, 'error', 'Not authenticated');
  end if;

  -- Get project details
  select project_head_id, status, resubmission_count into v_project_head_id, v_project_status, v_resubmission_count
  from projects
  where id = p_project_id;

  if v_project_head_id is null then
    return jsonb_build_object('success', false, 'error', 'Project not found');
  end if;

  -- Authorization check - only project head can resubmit
  if v_project_head_id != v_user_id then
    return jsonb_build_object('success', false, 'error', 'Unauthorized: Only project head can resubmit');
  end if;

  -- Check current status - only rejected projects can be resubmitted
  if v_project_status != 'closed' then
    return jsonb_build_object('success', false, 'error': 'Only rejected projects can be resubmitted');
  end if;

  -- Update project status
  update projects
  set status = 'pending_approval',
      rejection_reason = null,
      rejected_by = null,
      rejected_at = null,
      resubmission_count = v_resubmission_count + 1,
      updated_at = now()
  where id = p_project_id;

  -- Log status change
  perform log_project_status_change(p_project_id, 'closed', 'pending_approval', v_user_id, 'Resubmitted for approval');

  -- Notify reviewers
  insert into notifications (user_id, title, message)
  select u.id, 'Project Resubmitted', 'A project has been resubmitted for approval'
  from users u
  where u.role = 'super_admin';

  return jsonb_build_object('success', true);
exception
  when others then
    return jsonb_build_object('success', false, 'error', SQLERRM);
end;
$$ language plpgsql security definer set search_path = '';

-- Grant execute permissions
grant execute on function approve_project to authenticated;
grant execute on function reject_project to authenticated;
grant execute on function withdraw_project to authenticated;
grant execute on function resubmit_project to authenticated;