'use client';

import { useState } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { StepBasics } from './StepBasics';
import { StepDetails } from './StepDetails';
import { StepTeam } from './StepTeam';
import { StepReview } from './StepReview';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { ChevronLeft, ChevronRight, Check } from 'lucide-react';
import { createProjectAction } from '@/lib/projects/actions';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

const projectSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  tagline: z.string().optional(),
  organization_id: z.string().min(1, 'Organization is required'),
  domain: z.string().optional(),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  deadline: z.string().optional(),
  cover_image: z.string().optional(),
  focus_points: z.array(z.string()).optional(),
  learning_objectives: z.array(z.string()).optional(),
  deliverables: z.array(z.string()).optional(),
  milestones: z.array(z.object({
    title: z.string(),
    description: z.string().optional(),
    due_date: z.string().optional(),
  })).optional(),
  resources: z.array(z.object({
    title: z.string(),
    url: z.string().optional(),
    resource_type: z.enum(['document', 'link', 'image', 'video']).optional(),
  })).optional(),
  github_url: z.string().url('Invalid URL').optional().or(z.literal('')),
  team_size: z.number().min(1).max(50),
  required_skills: z.array(z.string()).optional(),
  contributor_description: z.string().optional(),
});

type ProjectFormData = z.infer<typeof projectSchema>;

const steps = [
  { id: 'basics', title: 'Basics', description: 'Project information' },
  { id: 'details', title: 'Details', description: 'Focus & resources' },
  { id: 'team', title: 'Team', description: 'Requirements' },
  { id: 'review', title: 'Review', description: 'Preview & submit' },
];

export function PostProjectForm() {
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const form = useForm<ProjectFormData>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      title: '',
      tagline: '',
      organization_id: '',
      domain: '',
      description: '',
      deadline: '',
      cover_image: '',
      focus_points: [],
      learning_objectives: [],
      deliverables: [],
      milestones: [],
      resources: [],
      github_url: '',
      team_size: 1,
      required_skills: [],
      contributor_description: '',
    },
    mode: 'onChange',
  });

  const organizations = [
    { id: '00000000-0000-0000-0000-000000000001', name: 'IEEE' },
    { id: '00000000-0000-0000-0000-000000000002', name: 'ACM' },
    { id: '00000000-0000-0000-0000-000000000003', name: 'CSI' },
    { id: '00000000-0000-0000-0000-000000000004', name: 'IETE' },
    { id: '00000000-0000-0000-0000-000000000005', name: 'SAE' },
    { id: '00000000-0000-0000-0000-000000000006', name: 'ASME' },
    { id: '00000000-0000-0000-0000-000000000007', name: 'ISTE' },
    { id: '00000000-0000-0000-0000-000000000008', name: 'NSS' },
    { id: '00000000-0000-0000-0000-000000000009', name: 'Cultural Club' },
  ];

  const domains = [
    'AI/ML',
    'Web Development',
    'Mobile Development',
    'IoT',
    'Robotics',
    'Data Science',
    'Cybersecurity',
    'Blockchain',
    'Game Development',
    'Hardware',
    'Other',
  ];

  const progress = ((currentStep + 1) / steps.length) * 100;

  const handleNext = async () => {
    const fieldsToValidate = getFieldsForStep(currentStep);
    const isValid = await form.trigger(fieldsToValidate as any);
    
    if (isValid) {
      setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1));
    }
  };

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  };

  const getFieldsForStep = (step: number) => {
    switch (step) {
      case 0:
        return ['title', 'organization_id', 'description'];
      case 1:
        return [];
      case 2:
        return ['team_size'];
      default:
        return [];
    }
  };

  const handleSubmit = async (data: ProjectFormData) => {
    setIsSubmitting(true);
    try {
      const result = await createProjectAction(data);
      
      if (result.success) {
        toast.success('Project created successfully!');
        if (result.status === 'pending_approval') {
          router.push('/projects?status=pending');
        } else {
          router.push(`/projects/${result.project_id}`);
        }
      } else {
        toast.error(result.error || 'Failed to create project');
      }
    } catch (error) {
      toast.error('An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return <StepBasics organizations={organizations} domains={domains} />;
      case 1:
        return <StepDetails />;
      case 2:
        return <StepTeam />;
      case 3:
        return <StepReview />;
      default:
        return null;
    }
  };

  return (
    <FormProvider {...form}>
      <div className="max-w-4xl mx-auto">
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
              {steps.map((step, index) => (
                <div key={step.id} className="flex items-center">
                  <div
                    className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${
                      index <= currentStep
                        ? 'bg-primary border-primary text-primary-foreground'
                        : 'border-muted-foreground/30'
                    }`}
                  >
                    {index < currentStep ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <span className="text-sm font-medium">{index + 1}</span>
                    )}
                  </div>
                  {index < steps.length - 1 && (
                    <div
                      className={`w-12 h-0.5 mx-2 ${
                        index < currentStep ? 'bg-primary' : 'bg-muted'
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>
            <Progress value={progress} className="mb-4" />
            <div className="text-center">
              <h2 className="text-lg font-semibold">{steps[currentStep].title}</h2>
              <p className="text-sm text-muted-foreground">
                {steps[currentStep].description}
              </p>
            </div>
          </CardContent>
        </Card>

        <form onSubmit={form.handleSubmit(handleSubmit)}>
          <Card>
            <CardContent className="pt-6">
              {renderStepContent()}
            </CardContent>
          </Card>

          <div className="flex justify-between mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={handleBack}
              disabled={currentStep === 0}
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              Back
            </Button>

            {currentStep < steps.length - 1 ? (
              <Button type="button" onClick={handleNext}>
                Next
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            ) : (
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Creating...' : 'Create Project'}
              </Button>
            )}
          </div>
        </form>
      </div>
    </FormProvider>
  );
}