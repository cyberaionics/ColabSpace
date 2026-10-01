export type UserRole = 'super_admin' | 'club_secretary' | 'individual'
export type ProjectStatus = 'draft' | 'pending_approval' | 'open' | 'in_progress' | 'completed' | 'archived'
export type ApplicationStatus = 'pending' | 'accepted' | 'rejected'
export type MilestoneStatus = 'done' | 'active' | 'todo'
export type ResourceType = 'equipment' | 'budget' | 'space' | 'mentor'

export interface User {
  id: string
  email: string
  name: string
  role: UserRole
  org_id?: string
  bio?: string
  skills: string[]
  github_url?: string
  avatar_url?: string
  is_suspended: boolean
  created_at: string
}

export interface Organization {
  id: string
  name: string
  type: 'club' | 'lab' | 'dept'
  description?: string
  logo_url?: string
  lead_user_id?: string
  created_at: string
}

export interface Project {
  id: string
  title: string
  description?: string
  tagline?: string
  status: ProjectStatus
  poster_id: string
  org_id?: string
  tags: string[]
  skills_required: string[]
  team_size_max: number
  team_size_current: number
  domain?: string
  focus_points?: string
  learning_objectives?: string
  deliverables?: string
  github_repo_url?: string
  last_commit_at?: string
  last_checked_at?: string
  rejection_reason?: string
  deadline?: string
  cover_image_url?: string
  contributor_description?: string
  created_at: string
  // joined
  organizations?: Organization
  users?: User
  project_members?: ProjectMember[]
}

export interface ProjectMember {
  id: string
  project_id: string
  user_id: string
  role: 'head' | 'member'
  joined_at: string
  users?: User
}

export interface Milestone {
  id: string
  project_id: string
  title: string
  target_date?: string
  status: MilestoneStatus
  sort_order: number
}

export interface Resource {
  id: string
  project_id: string
  type: ResourceType
  description: string
  status: 'needed' | 'available' | 'in_use'
}

export interface Application {
  id: string
  project_id: string
  applicant_id: string
  message?: string
  status: ApplicationStatus
  created_at: string
  projects?: Project
  users?: User
}

export interface Notification {
  id: string
  user_id: string
  type: string
  message: string
  ref_id?: string
  is_read: boolean
  created_at: string
}