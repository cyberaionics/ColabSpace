'use client';

import { useState, useEffect } from 'react';
import { StatsStrip } from './StatsStrip';
import { ActivityFeed } from './ActivityFeed';
import { RecommendedProjects } from './RecommendedProjects';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ProjectGrid } from '@/components/projects/ProjectGrid';
import { ExternalLink, Clock, AlertCircle } from 'lucide-react';
import { getISTGreeting, getISTDate, getISTTime } from '@/lib/utils';
import Link from 'next/link';

interface Project {
  id: string;
  title: string;
  description: string;
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
  status: string;
}

interface Application {
  id: string;
  project_id: string;
  user_id: string;
  status: 'pending' | 'accepted' | 'rejected';
  applied_at: string;
  project?: {
    id: string;
    title: string;
    organization_id?: string;
    status: string;
    deadline?: string;
  };
}

interface Activity {
  id: string;
  activity_type: string;
  project?: {
    id: string;
    title: string;
  };
  metadata?: Record<string, any>;
  created_at: string;
}

export function DashboardContent() {
  const [stats, setStats] = useState({
    projectHeadCount: 0,
    memberCount: 0,
    pendingApplications: 0,
    openProjects: 0,
  });
  const [projects, setProjects] = useState<Project[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [recommended, setRecommended] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Fetch user profile
        const profileResponse = await fetch('/api/users/profile');
        const profileData = await profileResponse.json();
        
        // Fetch my projects
        const projectsResponse = await fetch('/api/users/projects');
        const projectsData = await projectsResponse.json();
        
        // Fetch my applications
        const appsResponse = await fetch('/api/users/applications');
        const appsData = await appsResponse.json();
        
        // Fetch activity feed
        const activitiesResponse = await fetch('/api/users/activities');
        const activitiesData = await activitiesResponse.json();
        
        // Fetch recommended projects
        const recommendedResponse = await fetch('/api/users/recommended');
        const recommendedData = await recommendedResponse.json();

        setStats({
          projectHeadCount: projectsData.data?.length || 0,
          memberCount: 0,
          pendingApplications: appsData.data?.filter((a: Application) => a.status === 'pending').length || 0,
          openProjects: recommendedData.data?.length || 0,
        });
        setProjects(projectsData.data || []);
        setApplications(appsData.data || []);
        setActivities(activitiesData.data || []);
        setRecommended(recommendedData.data || []);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  return (
    <div className="space-y-6">
      <StatsStrip
        projectHeadCount={stats.projectHeadCount}
        memberCount={stats.memberCount}
        pendingApplications={stats.pendingApplications}
        openProjects={stats.openProjects}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">My Projects</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">Loading projects...</p>
                </div>
              ) : projects.length > 0 ? (
                <ProjectGrid projects={projects} />
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground mb-4">You haven&apos;t created any projects yet</p>
                  <Button asChild>
                    <Link href="/projects/new">Create Your First Project</Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">My Applications</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">Loading applications...</p>
                </div>
              ) : applications.length > 0 ? (
                <div className="space-y-3">
                  {applications.map((app) => (
                    <div key={app.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex-1">
                        <h4 className="font-medium text-sm">{app.project?.title}</h4>
                        <p className="text-xs text-muted-foreground">
                          Applied on {new Date(app.applied_at).toLocaleDateString('en-IN')}
                        </p>
                      </div>
                      <Badge
                        variant={
                          app.status === 'accepted' ? 'default' :
                          app.status === 'rejected' ? 'destructive' : 'secondary'
                        }
                      >
                        {app.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No applications yet</p>
                  <Button variant="outline" size="sm" className="mt-2" asChild>
                    <Link href="/projects">Browse Projects</Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          <ActivityFeed activities={activities} />
        </div>

        <div className="space-y-6">
          <RecommendedProjects projects={recommended} />

          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <AlertCircle className="h-5 w-5" />
                Pending Approval
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Your projects may be pending approval by the club secretary. Check your dashboard for updates.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}