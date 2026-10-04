'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, Calendar, Users, CheckCircle2, AlertCircle, GitBranch } from 'lucide-react';
import { formatIST } from '@/lib/utils';

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

interface ActivityFeedProps {
  activities: Activity[];
}

export function ActivityFeed({ activities }: ActivityFeedProps) {
  const getIcon = (type: string) => {
    switch (type) {
      case 'project_created':
        return <Calendar className="h-4 w-4" />;
      case 'application_submitted':
        return <Users className="h-4 w-4" />;
      case 'application_accepted':
        return <CheckCircle2 className="h-4 w-4" />;
      case 'application_rejected':
        return <AlertCircle className="h-4 w-4" />;
      case 'commit_pushed':
        return <GitBranch className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const getMessage = (activity: Activity) => {
    switch (activity.activity_type) {
      case 'project_created':
        return `Created project "${activity.project?.title}"`;
      case 'application_submitted':
        return `Applied to project "${activity.project?.title}"`;
      case 'application_accepted':
        return `Accepted into project "${activity.project?.title}"`;
      case 'application_rejected':
        return `Rejected from project "${activity.project?.title}"`;
      case 'commit_pushed':
        return `Pushed commit to "${activity.project?.title}"`;
      default:
        return activity.activity_type;
    }
  };

  if (!activities || activities.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Activity Feed</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">No recent activity</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Activity Feed</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.map((activity) => (
            <div key={activity.id} className="flex items-start gap-3">
              <div className="mt-1 text-muted-foreground">
                {getIcon(activity.activity_type)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm truncate">{getMessage(activity)}</p>
                <p className="text-xs text-muted-foreground">
                  {formatIST(activity.created_at)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}