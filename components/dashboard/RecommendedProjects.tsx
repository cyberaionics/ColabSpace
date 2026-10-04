'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Users, Calendar, ExternalLink } from 'lucide-react';
import { formatIST } from '@/lib/utils';
import Link from 'next/link';

interface Project {
  id: string;
  title: string;
  tagline?: string;
  domain?: string;
  organization?: {
    id: string;
    name: string;
  };
  team_size: number;
  team_size_current: number;
  deadline?: string;
  required_skills?: string[];
  overlap_score?: number;
}

interface RecommendedProjectsProps {
  projects: Project[];
}

export function RecommendedProjects({ projects }: RecommendedProjectsProps) {
  if (!projects || projects.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Recommended Projects</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            No recommendations available. Add skills to your profile to get personalized recommendations.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Recommended Projects</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {projects.map((project) => (
            <div key={project.id} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold truncate">{project.title}</h3>
                    {project.overlap_score && project.overlap_score > 0 && (
                      <Badge variant="secondary" className="text-xs">
                        {project.overlap_score} skill match
                      </Badge>
                    )}
                  </div>
                  {project.tagline && (
                    <p className="text-sm text-muted-foreground mb-2">{project.tagline}</p>
                  )}
                  <div className="flex items-center gap-4 text-xs text-muted-foreground mb-2">
                    {project.domain && (
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {project.domain}
                      </span>
                    )}
                    {project.organization && (
                      <span>{project.organization.name}</span>
                    )}
                  </div>
                  {project.required_skills && project.required_skills.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-2">
                      {project.required_skills.slice(0, 3).map((skill) => (
                        <Badge key={skill} variant="outline" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                      {project.required_skills.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{project.required_skills.length - 3} more
                        </Badge>
                      )}
                    </div>
                  )}
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      {project.team_size_current}/{project.team_size}
                    </span>
                    {project.deadline && (
                      <span>Due {formatIST(project.deadline)}</span>
                    )}
                  </div>
                </div>
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/projects/${project.id}`}>
                    View
                    <ExternalLink className="h-3 w-3 ml-1" />
                  </Link>
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}