-- Phase 6: Project Creation Wizard
-- Add fields needed for the four-step project creation wizard

-- Add new columns to projects table
alter table projects add column if not exists tagline text;
alter table projects add column if not exists domain text;
alter table projects add column if not exists cover_image text;
alter table projects add column if not exists focus_points text[] default array[]::text[];
alter table projects add column if not exists learning_objectives text[] default array[]::text[];
alter table projects add column if not exists deliverables text[] default array[]::text[];
alter table projects add column if not exists required_skills text[] default array[]::text[];
alter table projects add column if not exists contributor_description text;
alter table projects add column if not exists github_url text;

-- Add new columns to milestones table
alter table milestones add column if not exists order_index integer default 0;

-- Add new columns to resources table
alter table resources add column if not exists order_index integer default 0;

-- Add project creation status enum for approval workflow
create or replace function get_project_creation_status(user_role user_role)
returns text as $$
begin
  if user_role = 'student' then
    return 'pending_approval';
  elsif user_role = 'club_secretary' then
    return 'open';
  elsif user_role = 'super_admin' then
    return 'open';
  else
    return 'pending_approval';
  end if;
end;
$$ language plpgsql stable security definer set search_path = '';

-- RPC function for atomic project creation
-- This handles multi-table operations safely within a single transaction
create or replace function create_project_with_members(
  p_title text,
  p_tagline text,
  p_description text,
  p_organization_id uuid,
  p_domain text,
  p_deadline date,
  p_cover_image text,
  p_focus_points text[],
  p_learning_objectives text[],
  p_deliverables text[],
  p_milestones jsonb,
  p_resources jsonb,
  p_github_url text,
  p_team_size integer,
  p_required_skills text[],
  p_contributor_description text
)
returns jsonb as $$
declare
  v_user_id uuid;
  v_user_role user_role;
  v_project_id uuid;
  v_project_status text;
  v_result jsonb;
  v_milestone jsonb;
  v_resource jsonb;
begin
  -- Get current user
  v_user_id := auth.uid();
  if v_user_id is null then
    return jsonb_build_object('success', false, 'error', 'Not authenticated');
  end if;

  -- Get user role and organization
  select role, organization_id into v_user_role, p_organization_id
  from users
  where id = v_user_id;

  if v_user_role is null then
    return jsonb_build_object('success', false, 'error', 'User profile not found');
  end if;

  -- Determine project status based on role (server-side decision)
  v_project_status := get_project_creation_status(v_user_role);

  -- Validate team size
  if p_team_size is null or p_team_size < 1 or p_team_size > 50 then
    return jsonb_build_object('success', false, 'error', 'Invalid team size');
  end if;

  -- Insert project
  insert into projects (
    title, tagline, description, organization_id, domain, deadline,
    cover_image, focus_points, learning_objectives, deliverables,
    required_skills, contributor_description, github_url,
    team_size, team_size_current, status, project_head_id
  ) values (
    p_title, p_tagline, p_description, p_organization_id, p_domain, p_deadline,
    p_cover_image, p_focus_points, p_learning_objectives, p_deliverables,
    p_required_skills, p_contributor_description, p_github_url,
    p_team_size, 0, v_project_status, v_user_id
  )
  returning id into v_project_id;

  -- Insert project member as head (this triggers team_size_current increment)
  insert into project_members (project_id, user_id)
  values (v_project_id, v_user_id);

  -- Insert milestones
  if p_milestones is not null and jsonb_array_length(p_milestones) > 0 then
    for v_milestone in select * from jsonb_array_elements(p_milestones)
    loop
      insert into milestones (
        project_id, title, description, due_date, completed, order_index
      ) values (
        v_project_id,
        v_milestone->>'title',
        v_milestone->>'description',
        (v_milestone->>'due_date')::date,
        false,
        (v_milestone->>'order_index')::integer
      );
    end loop;
  end if;

  -- Insert resources
  if p_resources is not null and jsonb_array_length(p_resources) > 0 then
    for v_resource in select * from jsonb_array_elements(p_resources)
    loop
      insert into resources (
        project_id, title, url, resource_type, uploaded_by, order_index
      ) values (
        v_project_id,
        v_resource->>'title',
        v_resource->>'url',
        v_resource->>'resource_type',
        v_user_id,
        (v_resource->>'order_index')::integer
      );
    end loop;
  end if;

  -- Create reviewer notifications for pending projects
  if v_project_status = 'pending_approval' then
    insert into notifications (user_id, title, message)
    select
      u.id,
      'New Project Pending Approval',
      'A new project "' || p_title || '" is pending your approval'
    from users u
    where u.role = 'super_admin';
  end if;

  -- Build success result
  v_result := jsonb_build_object(
    'success', true,
    'project_id', v_project_id,
    'status', v_project_status
  );

  return v_result;
exception
  when others then
    return jsonb_build_object('success', false, 'error', SQLERRM);
end;
$$ language plpgsql security definer set search_path = '';

-- Grant execute permission to authenticated users
grant execute on function create_project_with_members to authenticated;