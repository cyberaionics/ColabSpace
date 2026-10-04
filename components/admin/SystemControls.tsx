'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function SystemControls() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">System Controls</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center py-12">
          <p className="text-muted-foreground">System controls coming soon</p>
        </div>
      </CardContent>
    </Card>
  );
}