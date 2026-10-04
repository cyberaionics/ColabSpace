'use client';

import { useFormContext } from 'react-hook-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, Users, Link as LinkIcon, Target, BookOpen } from 'lucide-react';

export function StepReview() {
  const { watch } = useFormContext();
  
  const formData = watch();
  
  const formatDate = (dateStr?: string) => {
    if (!dateStr) return 'Not set';
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-2">Review & Submit</h2>
        <p className="text-sm text-muted-foreground">
          Review your project details before submission
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Basic Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Title</p>
            <p className="text-base">{formData.title || 'Not set'}</p>
          </div>
          {formData.tagline && (
            <div>
              <p className="text-sm font-medium text-muted-foreground">Tagline</p>
              <p className="text-base">{formData.tagline}</p>
            </div>
          )}
          <div>
            <p className="text-sm font-medium text-muted-foreground">Description</p>
            <p className="text-base whitespace-pre-wrap">{formData.description || 'Not set'}</p>
          </div>
          <div className="flex gap-2 flex-wrap">
            {formData.domain && (
              <Badge variant="secondary">{formData.domain}</Badge>
            )}
            <Badge variant="outline">{formData.organization_id || 'No organization'}</Badge>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="h-4 w-4" />
            <span>Deadline: {formatDate(formData.deadline)}</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Target className="h-5 w-5" />
            Project Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {formData.focus_points && formData.focus_points.length > 0 && (
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-2">Focus Points</p>
              <ul className="list-disc list-inside space-y-1">
                {formData.focus_points.map((point: string, i: number) => (
                  <li key={i} className="text-sm">{point}</li>
                ))}
              </ul>
            </div>
          )}
          {formData.learning_objectives && formData.learning_objectives.length > 0 && (
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-2">Learning Objectives</p>
              <div className="flex flex-wrap gap-2">
                {formData.learning_objectives.map((obj: string, i: number) => (
                  <Badge key={i} variant="outline">{obj}</Badge>
                ))}
              </div>
            </div>
          )}
          {formData.deliverables && formData.deliverables.length > 0 && (
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-2">Deliverables</p>
              <ul className="list-disc list-inside space-y-1">
                {formData.deliverables.map((deliverable: string, i: number) => (
                  <li key={i} className="text-sm">{deliverable}</li>
                ))}
              </ul>
            </div>
          )}
          {formData.github_url && (
            <div className="flex items-center gap-2 text-sm">
              <LinkIcon className="h-4 w-4" />
              <a href={formData.github_url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                GitHub Repository
              </a>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Users className="h-5 w-5" />
            Team Requirements
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Maximum Team Size</p>
            <p className="text-base">{formData.team_size || 1} members</p>
          </div>
          {formData.required_skills && formData.required_skills.length > 0 && (
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-2">Required Skills</p>
              <div className="flex flex-wrap gap-2">
                {formData.required_skills.map((skill: string, i: number) => (
                  <Badge key={i} variant="secondary">{skill}</Badge>
                ))}
              </div>
            </div>
          )}
          {formData.contributor_description && (
            <div>
              <p className="text-sm font-medium text-muted-foreground">Contributor Description</p>
              <p className="text-base whitespace-pre-wrap">{formData.contributor_description}</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="border-amber-200 bg-amber-50">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <div className="flex-1">
              <h3 className="font-semibold mb-2">Role-Specific Notice</h3>
              <p className="text-sm text-muted-foreground">
                Your project will be created with status based on your role:
              </p>
              <ul className="text-sm mt-2 space-y-1">
                <li>• <strong>Student:</strong> Project will be pending approval</li>
                <li>• <strong>Club Secretary:</strong> Project will be immediately open</li>
                <li>• <strong>Super Admin:</strong> Project will be immediately open</li>
              </ul>
              <p className="text-xs text-muted-foreground mt-3">
                This decision is enforced server-side and cannot be bypassed by the client.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}