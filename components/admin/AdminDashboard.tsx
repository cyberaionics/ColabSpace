'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, FolderOpen, Clock, Building2, CheckCircle2, XCircle, Download } from 'lucide-react';
import { PendingApprovals } from './PendingApprovals';
import { RecentSignups } from './RecentSignups';
import { SystemControls } from './SystemControls';
import { ClubSecretaryManagement } from './ClubSecretaryManagement';

interface AdminStats {
  totalUsers: number;
  totalProjects: number;
  pendingProjects: number;
  totalOrganizations: number;
}

export function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    totalProjects: 0,
    pendingProjects: 0,
    totalOrganizations: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/admin/stats');
        const data = await response.json();
        
        if (data.success) {
          setStats(data.stats);
        }
      } catch (error) {
        console.error('Error fetching admin stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          Manage the platform and oversee all organizations
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Users
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-600" />
              <span className="text-2xl font-bold">{stats.totalUsers}</span>
            </div>
          </CardContent>
        </Card>

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
              Pending Approvals
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-yellow-600" />
              <span className="text-2xl font-bold">{stats.pendingProjects}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Organizations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-purple-600" />
              <span className="text-2xl font-bold">{stats.totalOrganizations}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="approvals" className="space-y-4">
        <TabsList>
          <TabsTrigger value="approvals">Pending Approvals</TabsTrigger>
          <TabsTrigger value="secretaries">Club Secretaries</TabsTrigger>
          <TabsTrigger value="signups">Recent Signups</TabsTrigger>
          <TabsTrigger value="system">System Controls</TabsTrigger>
        </TabsList>

        <TabsContent value="approvals">
          <PendingApprovals />
        </TabsContent>

        <TabsContent value="secretaries">
          <ClubSecretaryManagement />
        </TabsContent>

        <TabsContent value="signups">
          <RecentSignups />
        </TabsContent>

        <TabsContent value="system">
          <SystemControls />
        </TabsContent>
      </Tabs>
    </div>
  );
}