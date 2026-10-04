'use client';

import { useFormContext, useFieldArray } from 'react-hook-form';
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  FormDescription,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Trash2, GripVertical, Link as LinkIcon, BookOpen, Target } from 'lucide-react';

export function StepDetails() {
  const { control, register } = useFormContext();
  const {
    fields: milestoneFields,
    append: appendMilestone,
    remove: removeMilestone,
  } = useFieldArray({ name: 'milestones' });
  const {
    fields: resourceFields,
    append: appendResource,
    remove: removeResource,
  } = useFieldArray({ name: 'resources' });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-2">Project Details</h2>
        <p className="text-sm text-muted-foreground">
          Define focus points, objectives, deliverables, and resources
        </p>
      </div>

      {/* Focus Points */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Target className="h-5 w-5" />
            Focus Points
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {milestoneFields.length === 0 && (
              <p className="text-sm text-muted-foreground">No focus points added yet</p>
            )}
            {milestoneFields.map((field, index) => (
              <div key={field.id} className="flex gap-2 items-start">
                <GripVertical className="h-5 w-5 text-muted-foreground mt-2" />
                <div className="flex-1 space-y-2">
                  <Input
                    placeholder="Focus point title"
                    {...register(`milestones.${index}.title`)}
                  />
                  <Input
                    placeholder="Description (optional)"
                    {...register(`milestones.${index}.description`)}
                  />
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeMilestone(index)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() =>
                appendMilestone({ title: '', description: '' })
              }
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Focus Point
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Learning Objectives */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Learning Objectives
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div>
              <Input
                placeholder="What will contributors learn? (comma-separated)"
                id="learning-objectives-input"
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Enter objectives separated by commas. Example: React, TypeScript, UI/UX Design
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Deliverables */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Target className="h-5 w-5" />
            Deliverables
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div>
              <Input
                placeholder="What will be delivered? (comma-separated)"
                id="deliverables-input"
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Enter deliverables separated by commas. Example: Working app, Documentation, Demo video
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Milestones */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Target className="h-5 w-5" />
            Milestones
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {resourceFields.length === 0 && (
              <p className="text-sm text-muted-foreground">No milestones added yet</p>
            )}
            {resourceFields.map((field, index) => (
              <div key={field.id} className="flex gap-2 items-start p-3 border rounded-md">
                <GripVertical className="h-5 w-5 text-muted-foreground mt-2" />
                <div className="flex-1 space-y-2">
                  <Input
                    placeholder="Milestone title"
                    {...register(`resources.${index}.title`)}
                  />
                  <Input
                    placeholder="URL (optional)"
                    {...register(`resources.${index}.url`)}
                  />
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeResource(index)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() =>
                appendResource({ title: '', url: '' })
              }
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Milestone
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Resources */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <LinkIcon className="h-5 w-5" />
            Resources
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Links to documentation, tutorials, or reference materials
            </p>
            <div className="space-y-2">
              <Input placeholder="Resource title" id="resource-title" />
              <Input placeholder="URL" id="resource-url" />
              <Button type="button" variant="outline" size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Resource
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* GitHub URL */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <LinkIcon className="h-5 w-5" />
            GitHub Repository
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div>
              <Input
                placeholder="https://github.com/owner/repo"
                id="github-url"
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Link to your project repository (optional)
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}