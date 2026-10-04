'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

interface ApplyModalProps {
  projectId: string;
  projectStatus: string;
  projectHeadId?: string;
  currentUserId?: string;
  teamSize: number;
  teamSizeCurrent: number;
}

export function ApplyModal({ projectId, projectStatus, projectHeadId, currentUserId, teamSize, teamSizeCurrent }: ApplyModalProps) {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const canApply = projectStatus === 'open' && 
                   teamSizeCurrent < teamSize && 
                   currentUserId !== projectHeadId &&
                   currentUserId;

  const handleApply = async () => {
    if (!canApply) return;
    
    setLoading(true);
    setError('');
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setOpen(false);
      setMessage('');
      window.location.reload();
    } catch (err) {
      setError('Failed to submit application');
    } finally {
      setLoading(false);
    }
  };

  if (!canApply) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="w-full">Apply to Join</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Apply to Project</DialogTitle>
          <DialogDescription>
            Tell the project head why you&apos;d like to join this project
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <Textarea
            placeholder="Introduce yourself and explain your interest..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={4}
          />
          {error && <p className="text-sm text-destructive">{error}</p>}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={handleApply} disabled={loading}>
              {loading ? 'Submitting...' : 'Submit Application'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
