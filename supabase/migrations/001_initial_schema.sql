-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Enums
create type user_role as enum ('student', 'club_secretary', 'super_admin');
create type project_status as enum ('open', 'closed', 'in_progress', 'completed');
create type application_status as enum ('pending', 'accepted', 'rejected');
create type resource_type as enum ('document', 'link', 'image', 'video');

-- Organizations
create table organizations (
  id uuid primary key default uuid_generate_v4(),
  name text not null unique,
  description text,
  created_at timestamptz default now()
);

-- Users
create table users (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  full_name text not null,
  role user_role not null default 'student',
  branch text,
  year integer,
  organization_id uuid references organizations(id),
  created_at timestamptz default now()
);

-- Projects
create table projects (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  description text not null,
  organization_id uuid not null references organizations(id) on delete cascade,
  project_head_id uuid not null references users(id) on delete restrict,
  status project_status not null default 'open',
  team_size integer not null check (team_size > 0),
  team_size_current integer not null default 0 check (team_size_current >= 0),
  deadline date,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Project members
create table project_members (
  id uuid primary key default uuid_generate_v4(),
  project_id uuid not null references projects(id) on delete cascade,
  user_id uuid not null references users(id) on delete cascade,
  joined_at timestamptz default now(),
  unique(project_id, user_id)
);

-- Milestones
create table milestones (
  id uuid primary key default uuid_generate_v4(),
  project_id uuid not null references projects(id) on delete cascade,
  title text not null,
  description text,
  due_date date,
  completed boolean default false,
  created_at timestamptz default now()
);

-- Resources
create table resources (
  id uuid primary key default uuid_generate_v4(),
  project_id uuid not null references projects(id) on delete cascade,
  title text not null,
  url text,
  resource_type resource_type not null,
  uploaded_by uuid references users(id),
  created_at timestamptz default now()
);

-- Applications
create table applications (
  id uuid primary key default uuid_generate_v4(),
  project_id uuid not null references projects(id) on delete cascade,
  user_id uuid not null references users(id) on delete cascade,
  status application_status not null default 'pending',
  applied_at timestamptz default now(),
  unique(project_id, user_id)
);

-- Notifications
create table notifications (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references users(id) on delete cascade,
  title text not null,
  message text not null,
  read boolean default false,
  created_at timestamptz default now()
);

-- Helper functions to avoid RLS recursion
create or replace function auth.uid() returns uuid as $$
  select nullif(current_setting('request.jwt.claims', true)::json->>'sub', '')::uuid;
$$ language sql stable;

create or replace function get_user_role() returns user_role as $$
  select role from users where id = auth.uid();
$$ language sql stable security definer set search_path = '';

create or replace function get_user_organization_id() returns uuid as $$
  select organization_id from users where id = auth.uid();
$$ language sql stable security definer set search_path = '';

create or replace function is_super_admin() returns boolean as $$
  select exists (
    select 1 from users where id = auth.uid() and role = 'super_admin'
  );
$$ language sql stable security definer set search_path = '';

create or replace function is_club_secretary() returns boolean as $$
  select exists (
    select 1 from users where id = auth.uid() and role = 'club_secretary'
  );
$$ language sql stable security definer set search_path = '';

create or replace function is_project_head(project_uuid uuid) returns boolean as $$
  select exists (
    select 1 from projects where id = project_uuid and project_head_id = auth.uid()
  );
$$ language sql stable security definer set search_path = '';

create or replace function user_can_access_project(project_uuid uuid) returns boolean as $$
  select exists (
    select 1 from projects p
    where p.id = project_uuid and (
      p.project_head_id = auth.uid()
      or exists (select 1 from project_members pm where pm.project_id = project_uuid and pm.user_id = auth.uid())
      or is_super_admin()
      or (is_club_secretary() and p.organization_id = get_user_organization_id())
    )
  );
$$ language sql stable security definer set search_path = '';

-- RLS Enable
alter table organizations enable row level security;
alter table users enable row level security;
alter table projects enable row level security;
alter table project_members enable row level security;
alter table milestones enable row level security;
alter table resources enable row level security;
alter table applications enable row level security;
alter table notifications enable row level security;

-- Organizations policies
create policy "organizations_select_all" on organizations for select using (true);

-- Users policies
create policy "users_select_own_or_admin" on users for select using (
  id = auth.uid() or is_super_admin() or is_club_secretary()
);
create policy "users_insert_own" on users for insert with check (id = auth.uid());
create policy "users_update_own_or_admin" on users for update using (
  id = auth.uid() or is_super_admin()
);

-- Projects policies
create policy "projects_select_public" on projects for select using (
  status in ('open', 'in_progress', 'completed') or user_can_access_project(id)
);
create policy "projects_insert_club_secretary" on projects for insert with check (
  is_club_secretary() and organization_id = get_user_organization_id()
);
create policy "projects_update_owner_or_admin" on projects for update using (
  is_project_head(id) or is_super_admin() or (is_club_secretary() and organization_id = get_user_organization_id())
);

-- Project members policies
create policy "project_members_select" on project_members for select using (
  user_can_access_project(project_id) or is_super_admin()
);
create policy "project_members_insert" on project_members for insert with check (
  is_project_head(project_id) or is_super_admin()
);
create policy "project_members_delete" on project_members for delete using (
  is_project_head(project_id) or is_super_admin()
);

-- Milestones policies
create policy "milestones_select" on milestones for select using (user_can_access_project(project_id));
create policy "milestones_insert" on milestones for insert with check (user_can_access_project(project_id));
create policy "milestones_update" on milestones for update using (user_can_access_project(project_id));
create policy "milestones_delete" on milestones for delete using (user_can_access_project(project_id));

-- Resources policies
create policy "resources_select" on resources for select using (user_can_access_project(project_id));
create policy "resources_insert" on resources for insert with check (user_can_access_project(project_id));
create policy "resources_update" on resources for update using (user_can_access_project(project_id));
create policy "resources_delete" on resources for delete using (user_can_access_project(project_id));

-- Applications policies
create policy "applications_select_own_or_project_head" on applications for select using (
  user_id = auth.uid() or is_project_head(project_id) or is_super_admin()
);
create policy "applications_insert_own" on applications for insert with check (user_id = auth.uid());
create policy "applications_update_project_head" on applications for update using (
  is_project_head(project_id) or is_super_admin()
);

-- Notifications policies
create policy "notifications_select_own" on notifications for select using (user_id = auth.uid() or is_super_admin());
create policy "notifications_insert_service" on notifications for insert with check (true);
create policy "notifications_update_own" on notifications for update using (user_id = auth.uid() or is_super_admin());

-- Project member count trigger
create or replace function update_team_size_current() returns trigger as $$
begin
  if TG_OP = 'INSERT' then
    update projects set team_size_current = team_size_current + 1 where id = NEW.project_id;
    return NEW;
  elsif TG_OP = 'DELETE' then
    update projects set team_size_current = greatest(team_size_current - 1, 0) where id = OLD.project_id;
    return OLD;
  elsif TG_OP = 'UPDATE' then
    if NEW.project_id <> OLD.project_id then
      update projects set team_size_current = greatest(team_size_current - 1, 0) where id = OLD.project_id;
      update projects set team_size_current = team_size_current + 1 where id = NEW.project_id;
    end if;
    return NEW;
  end if;
  return null;
end;
$$ language plpgsql security definer set search_path = '';

create trigger project_members_count_trigger
after insert or delete or update on project_members
for each row execute function update_team_size_current();

-- Ensure team_size_current is correct on creation
create or replace function set_initial_team_size() returns trigger as $$
begin
  NEW.team_size_current := 0;
  return NEW;
end;
$$ language plpgsql;

create trigger projects_initial_team_size_trigger
before insert on projects
for each row execute function set_initial_team_size();

-- Seed organizations
insert into organizations (id, name, description) values
  ('00000000-0000-0000-0000-000000000001', 'IEEE', 'Institute of Electrical and Electronics Engineers'),
  ('00000000-0000-0000-0000-000000000002', 'ACM', 'Association for Computing Machinery'),
  ('00000000-0000-0000-0000-000000000003', 'CSI', 'Computer Society of India'),
  ('00000000-0000-0000-0000-000000000004', 'IETE', 'Institution of Electronics and Telecommunication Engineers'),
  ('00000000-0000-0000-0000-000000000005', 'SAE', 'Society of Automotive Engineers'),
  ('00000000-0000-0000-0000-000000000006', 'ASME', 'American Society of Mechanical Engineers'),
  ('00000000-0000-0000-0000-000000000007', 'ISTE', 'Indian Society for Technical Education'),
  ('00000000-0000-0000-0000-000000000008', 'NSS', 'National Service Scheme'),
  ('00000000-0000-0000-0000-000000000009', 'Cultural Club', 'Cultural Activities Club')
on conflict (name) do nothing;

-- Storage bucket for project covers
insert into storage.buckets (id, name, public) values ('project-covers', 'project-covers', true)
on conflict (id) do nothing;

-- Storage policies
create policy "project covers public read" on storage.objects for select using (bucket_id = 'project-covers');
create policy "project covers authenticated upload" on storage.objects for insert with check (
  bucket_id = 'project-covers' and auth.role() = 'authenticated'
);
create policy "project covers authenticated update" on storage.objects for update using (
  bucket_id = 'project-covers' and auth.role() = 'authenticated'
);
create policy "project covers authenticated delete" on storage.objects for delete using (
  bucket_id = 'project-covers' and auth.role() = 'authenticated'
);
