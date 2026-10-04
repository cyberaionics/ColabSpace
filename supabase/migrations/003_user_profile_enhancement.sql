-- Phase 7: User Profile Enhancement
-- Add fields for user profiles

-- Add new columns to users table
alter table users add column if not exists bio text;
alter table users add column if not exists github_url text;
alter table users add column if not exists portfolio_url text;
alter table users add column if not exists skills text[] default array[]::text[];
alter table users add column if not exists current_organization_id uuid references organizations(id);
alter table users add column if not exists is_suspended boolean default false;
alter table users add column if not exists suspension_reason text;
alter table users add column if not exists suspension_start_date timestamptz;
alter table users add column if not exists suspension_end_date timestamptz;

-- Add activity tracking
create table if not exists user_activities (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references users(id) on delete cascade,
  activity_type text not null,
  project_id uuid references projects(id) on delete cascade,
  metadata jsonb,
  created_at timestamptz default now()
);

-- Create index for faster queries
create index if not exists idx_user_activities_user_id on user_activities(user_id);
create index if not exists idx_user_activities_type on user_activities(activity_type);
create index if not exists idx_user_activities_created_at on user_activities(created_at);

-- Add activity tracking function
create or replace function log_activity(
  p_user_id uuid,
  p_activity_type text,
  p_project_id uuid default null,
  p_metadata jsonb default '{}'
)
returns uuid as $$
declare
  v_activity_id uuid;
begin
  insert into user_activities (user_id, activity_type, project_id, metadata)
  values (p_user_id, p_activity_type, p_project_id, p_metadata)
  returning id into v_activity_id;
  
  return v_activity_id;
end;
$$ language plpgsql security definer set search_path = '';

-- Grant execute permission
grant execute on function log_activity to authenticated;