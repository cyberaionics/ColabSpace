export type UserRole = 'student' | 'club_secretary' | 'super_admin';

export interface User {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  branch?: string;
  year?: number;
  organization_id?: string;
  bio?: string;
  github_url?: string;
  portfolio_url?: string;
  skills?: string[];
  current_organization_id?: string;
  is_suspended?: boolean;
  suspension_reason?: string;
  suspension_start_date?: string;
  suspension_end_date?: string;
  created_at: string;
}

export interface UserActivity {
  id: string;
  user_id: string;
  activity_type: string;
  project_id?: string;
  metadata?: Record<string, any>;
  created_at: string;
}

export interface UserProfile extends User {
  organization?: {
    id: string;
    name: string;
  };
  project_head_count?: number;
  member_count?: number;
}

export interface Project {
  id: string;
  title: string;
  tagline?: string;
  description: string;
  club_id: string;
  organization_id?: string;
  status: 'open' | 'closed' | 'in_progress' | 'completed';
  team_size: number;
  team_size_current: number;
  deadline?: string;
  domain?: string;
  cover_image?: string;
  focus_points?: string[];
  learning_objectives?: string[];
  deliverables?: string[];
  required_skills?: string[];
  contributor_description?: string;
  github_url?: string;
  created_at: string;
  updated_at: string;
}

export interface Milestone {
  id: string;
  project_id: string;
  title: string;
  description?: string;
  due_date?: string;
  completed: boolean;
  order_index?: number;
  created_at: string;
}

export interface Resource {
  id: string;
  project_id: string;
  title: string;
  url?: string;
  resource_type: 'document' | 'link' | 'image' | 'video';
  uploaded_by?: string;
  order_index?: number;
  created_at: string;
}

export interface Application {
  id: string;
  project_id: string;
  user_id: string;
  status: 'pending' | 'accepted' | 'rejected';
  applied_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  read: boolean;
  created_at: string;
}
