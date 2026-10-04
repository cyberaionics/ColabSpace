'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, Users, GitBranch, ExternalLink } from 'lucide-react';
import { getHealthDotColor } from '@/lib/utils';

interface ProjectDetailHeaderProps {
  project: {
    title: string;
    description: string;
    status: string;
    domain?: string;
    organization?: { name: string };
    deadline?: string;
    team_size: number;
    team_size_current: number;
    github_url?: string;
    last_commit?: string;
  };
}

export function ProjectDetailHeader({ project }: ProjectDetailHeaderProps) {
  const getHealthStatus = () => {
    if (!project.deadline) return 'error';
    const deadline = new Date(project.deadline);
    const now = new Date();
    const diffDays = Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays <= 14) return 'healthy';
    if (diffDays <= 60) return 'warning';
    return 'error';
  };

  const formatIST = (dateStr?: string) => {
    if (!dateStr) return 'No deadline';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata', day: 'numeric', month: 'long', year: 'numeric' });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-start gap-3">
        <div className={`w-3 h-3 rounded-full mt-1 ${getHealthDotColor(getHealthStatus())}`} />
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="outline">{project.status}</Badge>
            {project.domain && <Badge variant="secondary">{project.domain}</Badge>}
            {project.organization && <Badge variant="outline">{project.organization.name}</Badge>}
          </div>
          <h1 className="text-3xl font-bold">{project.title}</h1>
          <p className="text-muted-foreground mt-2">{project.description}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t">
        <div className="flex items-center gap-2 text-sm">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <span>{formatIST(project.deadline)}</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <Users className="h-4 w-4 text-muted-foreground" />
          <span>{project.team_size_current}/{project.team_size} members</span>
        </div>
        {project.last_commit && (
          <div className="flex items-center gap-2 text-sm">
            <GitBranch className="h-4 w-4 text-muted-foreground" />
            <span>Last commit: {new Date(project.last_commit).toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata' })}</span>
          </div>
        )}
        {project.github_url && (
          <Button variant="outline" size="sm" asChild>
            <a href={project.github_url} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="h-4 w-4 mr-2" />
              GitHub
            </a>
          </Button>
        )}
      </div>
    </div>
  );
}
