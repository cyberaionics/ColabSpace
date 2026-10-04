'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, XCircle, Eye } from 'lucide-react';
import { RejectProjectModal } from './RejectProjectModal';
import { formatIST } from '@/lib/utils';

interface Project {
  id: string;
  title: string;
  tagline?: string;
  description: string;
  organization?: {
    id: string;
    name: string;
  };
  project_head?: {
    id: string;
    full_name: string;
    email: string;
  };
  created_at: string;
}

export function PendingApprovals() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [showRejectModal, setShowRejectModal] = useState(false);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const response = await fetch('/api/admin/pending-projects');
      const data = await response.json();
      
      if (data.success) {
        setProjects(data.projects);
      }
    } catch (error) {
      console.error('Error fetching pending projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (projectId: string) => {
    try {
      const response = await fetch('/api/admin/approve-project', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ project_id: projectId }),
      });

      const data = await response.json();
      
      if (data.success) {
        fetchProjects();
      }
    } catch (error) {
      console.error('Error approving project:', error);
    }
  };

  const handleReject = async (projectId: string, reason: string) => {
    try {
      const response = await fetch('/api/admin/reject-project', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ project_id: projectId, reason }),
      });

      const data = await response.json();
      
      if (data.success) {
        fetchProjects();
        setShowRejectModal(false);
        setSelectedProject(null);
      }
    } catch (error) {
      console.error('Error rejecting project:', error);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (projects.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-muted-foreground">No pending approvals</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {projects.map((project) => (
        <Card key={project.id}>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-lg">{project.title}</CardTitle>
                {project.tagline && (
                  <p className="text-sm text-muted-foreground mt-1">{project.tagline}</p>
                )}
              </div>
              <Badge variant="secondary">Pending</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <p className="text-sm">{project.description}</p>
              
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span>Organization: {project.organization?.name}</span>
                <span>Submitted by: {project.project_head?.full_name}</span>
                <span>Created: {formatIST(project.created_at)}</span>
              </div>

              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={() => handleApprove(project.id)}
                >
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Approve
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => {
                    setSelectedProject(project);
                    setShowRejectModal(true);
                  }}
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Reject
                </Button>
                <Button size="sm" variant="outline">
                  <Eye className="h-4 w-4 mr-2" />
                  View Details
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}

      {selectedProject && (
        <RejectProjectModal
          open={showRejectModal}
          onOpenChange={setShowRejectModal}
          project={selectedProject}
          onReject={handleReject}
        />
      )}
    </div>
  );
}