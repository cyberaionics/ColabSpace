'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

interface Project {
  id: string;
  title: string;
}

interface RejectProjectModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  project: Project | null;
  onReject: (projectId: string, reason: string) => void;
}

export function RejectProjectModal({ open, onOpenChange, project, onReject }: RejectProjectModalProps) {
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!project || !reason.trim()) return;
    
    setLoading(true);
    await onReject(project.id, reason);
    setReason('');
    setLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Reject Project</DialogTitle>
          <DialogDescription>
            Provide a reason for rejecting &quot;{project?.title}&quot;
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="reason">Rejection Reason</Label>
            <Textarea
              id="reason"
              placeholder="Explain why this project is being rejected..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={4}
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleSubmit}
              disabled={!reason.trim() || loading}
            >
              {loading ? 'Rejecting...' : 'Reject Project'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}