'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { TagInput } from '@/components/ui/tag-input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { updateProfileAction } from '@/lib/users/actions';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

const profileSchema = z.object({
  full_name: z.string().min(2, 'Name must be at least 2 characters'),
  bio: z.string().max(500, 'Bio must be less than 500 characters').optional(),
  github_url: z.string().url('Invalid GitHub URL').optional().or(z.literal('')),
  portfolio_url: z.string().url('Invalid portfolio URL').optional().or(z.literal('')),
  skills: z.array(z.string()).optional(),
  branch: z.string().optional(),
  year: z.number().min(1).max(10).optional(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

interface EditProfileProps {
  userId: string;
}

export function EditProfile({ userId }: EditProfileProps) {
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const form = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      full_name: '',
      bio: '',
      github_url: '',
      portfolio_url: '',
      skills: [],
      branch: '',
      year: undefined,
    },
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch(`/api/users/profile/${userId}`);
        const data = await response.json();
        
        if (data.data) {
          form.reset({
            full_name: data.data.full_name || '',
            bio: data.data.bio || '',
            github_url: data.data.github_url || '',
            portfolio_url: data.data.portfolio_url || '',
            skills: data.data.skills || [],
            branch: data.data.branch || '',
            year: data.data.year || undefined,
          });
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [userId, form]);

  const onSubmit = async (data: ProfileFormData) => {
    try {
      const result = await updateProfileAction(data);
      
      if (result.success) {
        toast.success('Profile updated successfully');
        router.push(`/profile/${userId}`);
      } else {
        toast.error(result.error || 'Failed to update profile');
      }
    } catch (error) {
      toast.error('An unexpected error occurred');
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Edit Profile</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="text-sm font-medium">Full Name</label>
            <Input {...form.register('full_name')} />
            {form.formState.errors.full_name && (
              <p className="text-sm text-destructive">{form.formState.errors.full_name.message}</p>
            )}
          </div>

          <div>
            <label className="text-sm font-medium">Bio</label>
            <Textarea {...form.register('bio')} />
            {form.formState.errors.bio && (
              <p className="text-sm text-destructive">{form.formState.errors.bio.message}</p>
            )}
          </div>

          <div>
            <label className="text-sm font-medium">GitHub URL</label>
            <Input {...form.register('github_url')} />
            {form.formState.errors.github_url && (
              <p className="text-sm text-destructive">{form.formState.errors.github_url.message}</p>
            )}
          </div>

          <div>
            <label className="text-sm font-medium">Portfolio URL</label>
            <Input {...form.register('portfolio_url')} />
            {form.formState.errors.portfolio_url && (
              <p className="text-sm text-destructive">{form.formState.errors.portfolio_url.message}</p>
            )}
          </div>

          <div>
            <label className="text-sm font-medium">Skills</label>
            <TagInput
              id="skills"
              label=""
              value={form.watch('skills') || []}
              onChange={(value) => form.setValue('skills', value)}
            />
          </div>

          <div className="flex gap-4">
            <div className="flex-1">
              <label className="text-sm font-medium">Branch</label>
              <Input {...form.register('branch')} />
            </div>
            <div className="flex-1">
              <label className="text-sm font-medium">Year</label>
              <Input type="number" {...form.register('year', { valueAsNumber: true })} />
            </div>
          </div>

          <Button type="submit">Save Changes</Button>
        </form>
      </CardContent>
    </Card>
  );
}