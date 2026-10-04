'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, FolderOpen, Clock, Building2 } from 'lucide-react';

interface SecretaryStats {
  totalProjects: number;
  pendingApplications: number;
  pendingSubmissions: number;
  totalMembers: number;
}

interface SecretaryDashboardProps {
  organizationId: string;
}

export function SecretaryDashboard({ organizationId }: SecretaryDashboardProps) {
  const [stats, setStats] = useState<SecretaryStats>({
    totalProjects: 0,
    pendingApplications: 0,
    pendingSubmissions: 0,
    totalMembers: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch(`/api/secretary/${organizationId}/stats`);
        const data = await response.json();
        
        if (data.success) {
          setStats(data.stats);
        }
      } catch (error) {
        console.error('Error fetching secretary stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [organizationId]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Organization Management</h1>
        <p className="text-muted-foreground mt-2">
          Manage your organization&apos;s projects and members
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Projects
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <FolderOpen className="h-5 w-5 text-green-600" />
              <span className="text-2xl font-bold">{stats.totalProjects}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Pending Applications
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-yellow-600" />
              <span className="text-2xl font-bold">{stats.pendingApplications}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Pending Submissions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-purple-600" />
              <span className="text-2xl font-bold">{stats.pendingSubmissions}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Members
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-600" />
              <span className="text-2xl font-bold">{stats.totalMembers}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="projects" className="space-y-4">
        <TabsList>
          <TabsTrigger value="projects">Club Projects</TabsTrigger>
          <TabsTrigger value="applications">Pending Applications</TabsTrigger>
          <TabsTrigger value="submissions">Pending Submissions</TabsTrigger>
          <TabsTrigger value="members">Organization Members</TabsTrigger>
        </TabsList>

        <TabsContent value="projects">
          <div className="text-center py-12">
            <p className="text-muted-foreground">Club projects management coming soon</p>
          </div>
        </TabsContent>

        <TabsContent value="applications">
          <div className="text-center py-12">
            <p className="text-muted-foreground">Pending applications management coming soon</p>
          </div>
        </TabsContent>

        <TabsContent value="submissions">
          <div className="text-center py-12">
            <p className="text-muted-foreground">Pending submissions management coming soon</p>
          </div>
        </TabsContent>

        <TabsContent value="members">
          <div className="text-center py-12">
            <p className="text-muted-foreground">Organization members management coming soon</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}