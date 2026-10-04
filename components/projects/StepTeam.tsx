'use client';

import { useFormContext } from 'react-hook-form';
import { TagInput } from '@/components/ui/tag-input';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Target, BookOpen, Link as LinkIcon } from 'lucide-react';

export function StepTeam() {
  const { watch, setValue } = useFormContext();
  
  const teamSize = watch('team_size') || 1;
  const requiredSkills = watch('required_skills') || [];
  const contributorDescription = watch('contributor_description') || '';

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-2">Team Requirements</h2>
        <p className="text-sm text-muted-foreground">
          Define who you need on your team
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Users className="h-5 w-5" />
            Team Size
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <label htmlFor="team-size" className="text-sm font-medium">
              Maximum Team Size *
            </label>
            <Input
              id="team-size"
              type="number"
              min="1"
              max="50"
              value={teamSize}
              onChange={(e) => setValue('team_size', parseInt(e.target.value) || 1)}
              className="w-32"
            />
            <p className="text-xs text-muted-foreground">
              You will be the project head. Team size includes you.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Target className="h-5 w-5" />
            Required Skills
          </CardTitle>
        </CardHeader>
        <CardContent>
          <TagInput
            id="required-skills"
            label="Skills needed"
            description="Add skills required for contributors. Press Enter or comma to add."
            placeholder="e.g., React, Node.js, UI/UX"
            value={requiredSkills}
            onChange={(value) => setValue('required_skills', value)}
            maxTags={20}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Contributor Description
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <label htmlFor="contributor-description" className="text-sm font-medium">
              What are you looking for in contributors?
            </label>
            <Textarea
              id="contributor-description"
              placeholder="Describe the ideal contributor profile, expectations, and what they will gain..."
              className="min-h-[120px]"
              value={contributorDescription}
              onChange={(e) => setValue('contributor_description', e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Help potential contributors understand what you need from them
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}