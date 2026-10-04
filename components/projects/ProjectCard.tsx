'use client';

import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Bookmark, Users, Calendar, GitBranch } from 'lucide-react';
import { getHealthDotColor, getTimeAgo, getInitials } from '@/lib/utils';
import { useState, useEffect } from 'react';

interface ProjectCardProps {
  project: {
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
  };
}

export function ProjectCard({ project }: ProjectCardProps) {
  const [bookmarked, setBookmarked] = useState(false);

  useEffect(() => {
    const bookmarks = JSON.parse(localStorage.getItem('project-bookmarks') || '[]');
    setBookmarked(bookmarks.includes(project.id));
  }, [project.id]);

  const toggleBookmark = () => {
    const bookmarks = JSON.parse(localStorage.getItem('project-bookmarks') || '[]');
    const newBookmarks = bookmarked
      ? bookmarks.filter((id: string) => id !== project.id)
      : [...bookmarks, project.id];
    localStorage.setItem('project-bookmarks', JSON.stringify(newBookmarks));
    setBookmarked(!bookmarked);
  };

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
    return date.toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata', day: 'numeric', month: 'short', year: 'numeric' });
  };

  const availableSlots = project.team_size - project.team_size_current;

  return (
    <Card className="border-[0.5px] hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <div className={`w-2 h-2 rounded-full ${getHealthDotColor(getHealthStatus())}`} />
              <Badge variant="outline" className="text-xs">{project.status}</Badge>
              {project.domain && <Badge variant="secondary" className="text-xs">{project.domain}</Badge>}
            </div>
            <h3 className="font-semibold truncate">{project.title}</h3>
            <p className="text-sm text-muted-foreground">{project.organization?.name}</p>
          </div>
          <Button variant="ghost" size="icon" onClick={toggleBookmark} className="shrink-0">
            <Bookmark className={`h-4 w-4 ${bookmarked ? 'fill-current' : ''}`} />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm line-clamp-2 text-muted-foreground">{project.description}</p>
        
        {project.skills && project.skills.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {project.skills.slice(0, 3).map((skill) => (
              <Badge key={skill} variant="outline" className="text-xs">{skill}</Badge>
            ))}
            {project.skills.length > 3 && (
              <Badge variant="outline" className="text-xs">+{project.skills.length - 3}</Badge>
            )}
          </div>
        )}

        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            {formatIST(project.deadline)}
          </div>
          {project.last_commit && (
            <div className="flex items-center gap-1">
              <GitBranch className="h-3 w-3" />
              {getTimeAgo(project.last_commit)}
            </div>
          )}
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex -space-x-2">
              {project.members?.slice(0, 3).map((member, i) => (
                <Avatar key={i} className="h-6 w-6 border-[0.5px] border-background">
                  <AvatarFallback className="text-xs">{getInitials(member.full_name)}</AvatarFallback>
                </Avatar>
              ))}
            </div>
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <Users className="h-3 w-3" />
              {project.team_size_current}/{project.team_size}
            </span>
          </div>
          <span className={`text-xs ${availableSlots > 0 ? 'text-green-600' : 'text-red-600'}`}>
            {availableSlots > 0 ? `${availableSlots} slots` : 'Full'}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
