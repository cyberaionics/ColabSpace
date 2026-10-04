'use client';

import { ProjectCard } from './ProjectCard';

interface Project {
  id: string;
  title: string;
  description: string;
  status: string;
  domain?: string;
  organization?: { name: string };
  poster?: { full_name: string };
  skills?: string[];
  deadline?: string;
  team_size: number;
  team_size_current: number;
  last_commit?: string;
  members?: Array<{ full_name: string }>;
}

interface ProjectGridProps {
  projects: Project[];
  loading?: boolean;
}

export function ProjectGrid({ projects, loading }: ProjectGridProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-64 bg-muted animate-pulse rounded-lg border-[0.5px]" />
        ))}
      </div>
    );
  }

  if (projects.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No projects found matching your filters.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {projects.map((project) => (
        <ProjectCard key={project.id} project={project} />
      ))}
    </div>
  );
}
