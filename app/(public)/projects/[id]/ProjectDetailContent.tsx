'use client';

import { useEffect, useState } from 'react';
import { ProjectDetailHeader } from '@/components/projects/ProjectDetailHeader';
import { MilestoneList } from '@/components/projects/MilestoneList';
import { CommitFeed } from '@/components/projects/CommitFeed';
import { ApplyModal } from '@/components/projects/ApplyModal';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Bookmark } from 'lucide-react';
import { getInitials } from '@/lib/utils';

interface Project {
  id: string;
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
  skills?: string[];
  focus_points?: string[];
  learning_objectives?: string[];
  deliverables?: string[];
  milestones?: any[];
  members?: Array<{ full_name: string }>;
  project_head_id?: string;
}

export default function ProjectDetailContent({ projectId }: { projectId: string }) {
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [bookmarked, setBookmarked] = useState(false);

  useEffect(() => {
    // Mock data - replace with Supabase query
    setTimeout(() => {
      setProject({
        id: projectId,
        title: 'AI-Powered Study Assistant',
        description: 'An intelligent assistant to help students with coursework',
        status: 'open',
        domain: 'AI/ML',
        organization: { name: 'IEEE' },
        deadline: '2026-11-15',
        team_size: 5,
        team_size_current: 2,
        github_url: 'https://github.com/example/study-assistant',
        last_commit: new Date().toISOString(),
        skills: ['Python', 'TensorFlow', 'React'],
        focus_points: ['NLP', 'Recommendation Systems'],
        learning_objectives: ['Machine Learning', 'Full Stack Development'],
        deliverables: ['MVP', 'Documentation', 'Demo'],
        milestones: [
          { id: '1', title: 'Research Phase', completed: true, due_date: '2026-09-01' },
          { id: '2', title: 'Prototype', completed: false, due_date: '2026-10-01' },
        ],
        members: [{ full_name: 'John Doe' }, { full_name: 'Jane Smith' }],
        project_head_id: 'user-123'
      });
      setLoading(false);
    }, 1000);
  }, [projectId]);

  if (loading) {
    return <div className="container mx-auto px-4 py-8">Loading...</div>;
  }

  if (!project) {
    return <div className="container mx-auto px-4 py-8">Project not found</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <ProjectDetailHeader project={project} />
          
          <Card>
            <CardHeader>
              <CardTitle>Description</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm">{project.description}</p>
            </CardContent>
          </Card>

          {project.focus_points && (
            <Card>
              <CardHeader>
                <CardTitle>Focus Points</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {project.focus_points.map((point) => (
                    <Badge key={point} variant="outline">{point}</Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          <MilestoneList milestones={project.milestones || []} />
          <CommitFeed githubUrl={project.github_url} />
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Team Capacity</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Members</span>
                <span className="text-sm font-medium">{project.team_size_current}/{project.team_size}</span>
              </div>
              <div className="flex -space-x-2">
                {project.members?.map((member, i) => (
                  <Avatar key={i} className="h-8 w-8 border-2 border-background">
                    <AvatarFallback className="text-xs">{getInitials(member.full_name)}</AvatarFallback>
                  </Avatar>
                ))}
              </div>
              <ApplyModal
                projectId={project.id}
                projectStatus={project.status}
                projectHeadId={project.project_head_id}
                currentUserId="current-user"
                teamSize={project.team_size}
                teamSizeCurrent={project.team_size_current}
              />
              <Button variant="outline" className="w-full">
                <Bookmark className="h-4 w-4 mr-2" />
                Save Project
              </Button>
            </CardContent>
          </Card>

          {project.skills && (
            <Card>
              <CardHeader>
                <CardTitle>Skills Required</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {project.skills.map((skill) => (
                    <Badge key={skill} variant="secondary">{skill}</Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Activity Health</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Project is active</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
