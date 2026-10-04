'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatIST } from '@/lib/utils';

interface User {
  id: string;
  email: string;
  full_name: string;
  role: string;
  branch?: string;
  year?: number;
  organization?: {
    id: string;
    name: string;
  };
  created_at: string;
}

export function RecentSignups() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Recent Signups</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center py-12">
          <p className="text-muted-foreground">Recent signups management coming soon</p>
        </div>
      </CardContent>
    </Card>
  );
}