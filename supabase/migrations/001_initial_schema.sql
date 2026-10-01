-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Role enum
create type user_role as enum ('super_admin', 'club_secretary', 'individual');

-- Project status enum
create type project_status as enum (
  'draft', 'pending_approval', 'open', 'in_progress', 'completed', 'archived'
);

-- Application status enum
create type application_status as enum ('pending', 'accepted', 'rejected');

-- Resource type enum
create type resource_type as enum ('equipment', 'budget', 'space', 'mentor');

-- Organizations table
create table organizations (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  type text not null check (type in ('club', 'lab', 'dept')),
  description text,
  logo_url text,
  lead_user_id uuid,
  created_at timestamptz default now()
);

-- Users table (extends Supabase auth.users)
create table users (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  name text,
  role user_role not null default 'individual',
  org_id uuid references organizations(id),
  bio text,
  skills text[] default '{}',
  github_url text,
  avatar_url text,
  is_suspended boolean default false,
  created_at timestamptz default now()
);

-- Add FK now that users exists
alter table organizations
  add constraint organizations_lead_user_id_fkey
  foreign key (lead_user_id) references users(id);

-- Projects table
create table projects (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  description text,
  tagline text,
  status project_status not null default 'pending_approval',
  poster_id uuid not null references users(id),
  org_id uuid references organizations(id),
  tags text[] default '{}',
  skills_required text[] default '{}',
  team_size_max int default 5,
  team_size_current int default 1,
  domain text,
  focus_points text,
  learning_objectives text,
  deliverables text,
  github_repo_url text,
  last_commit_at timestamptz,
  last_checked_at timestamptz,
  rejection_reason text,
  deadline date,
  cover_image_url text,
  contributor_description text,
  created_at timestamptz default now()
);

-- Project members (team)
create table project_members (
  id uuid primary key default uuid_generate_v4(),
  project_id uuid not null references projects(id) on delete cascade,
  user_id uuid not null references users(id) on delete cascade,
  role text not null check (role in ('head', 'member')),
  joined_at timestamptz default now(),
  unique(project_id, user_id)
);

-- Milestones
create table milestones (
  id uuid primary key default uuid_generate_v4(),
  project_id uuid not null references projects(id) on delete cascade,
  title text not null,
  target_date date,
  status text not null default 'todo' check (status in ('done', 'active', 'todo')),
  sort_order int default 0
);

-- Resources
create table resources (
  id uuid primary key default uuid_generate_v4(),
  project_id uuid not null references projects(id) on delete cascade,
  type resource_type not null,
  description text not null,
  status text default 'needed' check (status in ('needed', 'available', 'in_use'))
);

-- Applications
create table applications (
  id uuid primary key default uuid_generate_v4(),
  project_id uuid not null references projects(id) on delete cascade,
  applicant_id uuid not null references users(id) on delete cascade,
  message text,
  status application_status not null default 'pending',
  created_at timestamptz default now(),
  unique(project_id, applicant_id)
);

-- Notifications
create table notifications (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references users(id) on delete cascade,
  type text not null,
  message text not null,
  ref_id uuid,
  is_read boolean default false,
  created_at timestamptz default now()
);

-- Seed the 9 organizations
insert into organizations (name, type, description) values
  ('IIT Dharwad Robotics Club', 'club', 'Robotics, drones, embedded systems'),
  ('Code Geass', 'club', 'Competitive programming and software development'),
  ('Cybersec Club', 'club', 'Cybersecurity, CTF, and cryptography'),
  ('AI/ML Club', 'club', 'Machine learning and artificial intelligence'),
  ('IoT Club', 'club', 'Internet of Things and smart systems'),
  ('Drone Club', 'club', 'UAV design and autonomous systems'),
  ('Embedded Systems Club', 'club', 'FPGA, microcontrollers, and hardware'),
  ('Open Source Club', 'club', 'Open source contributions and tooling'),
  ('Research Club', 'club', 'Interdisciplinary research projects');