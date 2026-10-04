-- Phase 8: Administrative Interfaces
-- Add fields and tables for admin management

-- Add system settings table
create table if not exists system_settings (
  id uuid primary key default uuid_generate_v4(),
  key text not null unique,
  value text,
  description text,
  updated_at timestamptz default now(),
  updated_by uuid references users(id)
);

-- Add announcements table
create table if not exists announcements (
  id uuid primary key default uuid_generate_4(),
  title text not null,
  message text not null,
  target_role user_role,
  is_active boolean default true,
  created_by uuid references users(id),
  created_at timestamptz default now(),
  expires_at timestamptz
);

-- Add invitations table
create table if not exists invitations (
  id uuid primary key default uuid_generate_v4(),
  email text not null,
  role user_role not null,
  organization_id uuid references organizations(id),
  token text not null unique,
  expires_at timestamptz not null,
  used boolean default false,
  created_by uuid references users(id),
  created_at timestamptz default now()
);

-- Add indexes
create index if not exists idx_invitations_token on invitations(token);
create index if not exists idx_invitations_email on invitations(email);
create index if not exists idx_invitations_expires_at on invitations(expires_at);
create index if not exists idx_announcements_active on announcements(is_active);

-- Insert default system settings
insert into system_settings (key, value, description) values
  ('signup_kill_switch', 'false', 'Disable new user registrations'),
  ('github_tracker_enabled', 'true', 'Enable GitHub commit tracking'),
  ('maintenance_mode', 'false', 'Enable maintenance mode')
on conflict (key) do nothing;

-- Enable RLS
alter table system_settings enable row level security;
alter table announcements enable row level security;
alter table invitations enable row level security;

-- System settings policies
create policy "system_settings_select" on system_settings for select using (is_super_admin());
create policy "system_settings_update" on system_settings for update using (is_super_admin());

-- Announcements policies
create policy "announcements_select_active" on announcements for select using (is_active or is_super_admin());
create policy "announcements_insert" on announcements for insert with check (is_super_admin());
create policy "announcements_update" on announcements for update using (is_super_admin());
create policy "announcements_delete" on announcements for delete using (is_super_admin());

-- Invitations policies
create policy "invitations_select" on invitations for select using (is_super_admin());
create policy "invitations_insert" on invitations for insert with check (is_super_admin());
create policy "invitations_update" on invitations for update using (is_super_admin());

-- Function to check if signup is allowed
create or replace function is_signup_allowed()
returns boolean as $$
declare
  v_setting text;
begin
  select value into v_setting from system_settings where key = 'signup_kill_switch';
  return v_setting = 'false';
end;
$$ language plpgsql stable security definer set search_path = '';

-- Function to check if GitHub tracker is enabled
create or replace function is_github_tracker_enabled()
returns boolean as $$
declare
  v_setting text;
begin
  select value into v_setting from system_settings where key = 'github_tracker_enabled';
  return v_setting = 'true';
end;
$$ language plpgsql stable security definer set search_path = '';

-- Grant execute permissions
grant execute on function is_signup_allowed to authenticated;
grant execute on function is_github_tracker_enabled to authenticated;