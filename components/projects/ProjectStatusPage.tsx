'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Clock, UserCheck, UserX, RefreshCw, ArrowLeft, FileText, AlertCircle, CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { formatIST } from '@/lib/utils';
import { approveProjectAction, rejectProjectAction, withdrawProjectAction, resubmitProjectAction, getProjectStatus } from '@/lib/projects/approval';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

interface Project {
  id: string;
  title: string;
  tagline?: string;
  description: string;
  status: string;
  organization?: {
    id: string;
    name: string;
  };
  project_head?: {
    id: string;
    full_name: string;
    email: string;
  };
  approved_by_user?: {
    id: string;
    full_name: string;
  };
  rejected_by_user?: {
    id: string;
    full_name: string;
  };
  rejection_reason?: string;
  approved_at?: string;
  rejected_at?: string;
  resubmission_count?: number;
  created_at: string;
  updated_at: string;
}

interface StatusHistory {
  id: string;
  old_status?: string;
  new_status: string;
  changed_by_user?: {
    id: string;
    full_name: string;
  };
  reason?: string;
  created_at: string;
}

interface Permissions {
  canEdit: boolean;
  canWithdraw: boolean;
  canResubmit: boolean;
  canApprove: boolean;
  canReject: boolean;
}

interface ProjectStatusPageProps {
  projectId: string;
  userId: string;
  userRole: string;
}

export function ProjectStatusPage({ projectId, userId, userRole }: ProjectStatusPageProps) {
  const [project, setProject] = useState<Project | null>(null);
  const [history, setHistory] = useState<StatusHistory[]>([]);
  const [permissions, setPermissions] = useState<Permissions>({
    canEdit: false,
    canWithdraw: false,
    canResubmit: false,
    canApprove: false,
    canReject: false,
  });
  const [loading, setLoading] = useState(true);
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    fetchProjectStatus();
  }, [projectId]);

  const fetchProjectStatus = async () => {
    try {
      const response = await fetch(`/api/projects/${projectId}/status`);
      const data = await response.json();
      
      if (data.success) {
        setProject(data.project);
        setHistory(data.history || []);
        setPermissions(data.permissions);
      }
    } catch (error) {
      console.error('Error fetching project status:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!project) return;
    setActionLoading('approve');
    try {
      const result = await approveProjectAction(project.id);
      if (result.success) {
        toast.success('Project approved');
        fetchProjectStatus();
      } else {
        toast.error(result.error || 'Failed to approve');
      }
    } catch (error) {
      toast.error('An error occurred');
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async () => {
    if (!project || !rejectReason.trim()) return;
    setActionLoading('reject');
    try {
      const result = await rejectProjectAction(project.id, rejectReason);
      if (result.success) {
        toast.success('Project rejected');
        setShowRejectDialog(false);
        setRejectReason('');
        fetchProjectStatus();
      } else {
        toast.error(result.error || 'Failed to reject');
      }
    } catch (error) {
      toast.error('An error occurred');
    } finally {
      setActionLoading(null);
    }
  };

  const handleWithdraw = async () => {
    if (!project) return;
    setActionLoading('withdraw');
    try {
      const result = await withdrawProjectAction(project.id);
      if (result.success) {
        toast.success('Project withdrawn');
        fetchProjectStatus();
      } else {
        toast.error(result.error || 'Failed to withdraw');
      }
    } catch (error) {
      toast.error('An error occurred');
    } finally {
      setActionLoading(null);
    }
  };

  const handleResubmit = async () => {
    if (!project) return;
    setActionLoading('resubmit');
    try {
      const result = await resubmitProjectAction(project.id);
      if (result.success) {
        toast.success('Project resubmitted for approval');
        fetchProjectStatus();
      } else {
        toast.error(result.error || 'Failed to resubmit');
      }
    } catch (error) {
      toast.error('An error occurred');
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending_approval':
        return <Badge variant="secondary">Pending Approval</Badge>;
      case 'open':
        return <Badge variant="default">Open</Badge>;
      case 'closed':
        return <Badge variant="destructive">Closed</Badge>;
      case 'in_progress':
        return <Badge variant="outline">In Progress</Badge>;
      case 'completed':
        return <Badge variant="outline">Completed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending_approval':
        return <Clock className="h-5 w-5 text-yellow-600" />;
      case 'open':
        return <CheckCircle2 className="h-5 w-5 text-green-600" />;
      case 'closed':
        return <XCircle className="h-5 w-5 text-red-600" />;
      case 'in_progress':
        return <Loader2 className="h-5 w-5 text-blue-600" />;
      case 'completed':
        return <CheckCircle2 className="h-5 w-5 text-green-600" />;
      default:
        return <FileText className="h-5 w-5" />;
    }
  };

  if (loading) {
    return <div className="text-center py-12">Loading...</div>;
  }

  if (!project) {
    return <div className="text-center py-12">Project not found</div>;
  }

  const isProjectHead = project.project_head?.id === userId;
  const isReviewer = permissions.canApprove || permissions.canReject;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{project.title}</h1>
          <p className="text-muted-foreground mt-1">{project.tagline || 'No tagline'}</p>
        </div>
        <div className="flex items-center gap-4">
          {getStatusIcon(project.status)}
          {getStatusBadge(project.status)}
        </div>
      </div>

      {/* Pending Approval Header */}
      {project.status === 'pending_approval' && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <AlertCircle className="h-6 w-6 text-yellow-600 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-semibold">Pending Approval</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  This project is awaiting review by a club secretary or super admin.
                  Submitted on {formatIST(project.created_at)}.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Rejection Reason */}
      {project.status === 'closed' && project.rejection_reason && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <XCircle className="h-6 w-6 text-red-600 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-semibold text-red-800">Project Rejected</h3>
                <p className="text-sm text-red-700 mt-1">{project.rejection_reason}</p>
                <p className="text-xs text-red-600 mt-2">
                  Rejected by {project.rejected_by_user?.full_name} on {formatIST(project.rejected_at)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Approval Info */}
      {project.status === 'open' && project.approved_by_user && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <UserCheck className="h-6 w-6 text-green-600 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-semibold">Project Approved</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Approved by {project.approved_by_user?.full_name} on {formatIST(project.approved_at)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Timeline */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Status Timeline
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {history.map((entry, index) => (
              <div key={entry.id} className="flex items-start gap-4">
                <div className="flex flex-col items-center">
                  <div className="w-3 h-3 rounded-full bg-primary" />
                  {index < history.length - 1 && <div className="w-0.5 h-full bg-muted mt-1" />}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium capitalize">{entry.new_status.replace('_', ' ')}</span>
                    {entry.reason && <span className="text-sm text-muted-foreground">- {entry.reason}</span>}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {entry.changed_by_user?.full_name || 'System'} &bull; {formatIST(entry.created_at)}
                  </p>
                </div>
              </div>
            ))}
            {/* Initial creation */}
            <div className="flex items-start gap-4">
              <div className="flex flex-col items-center">
                <div className="w-3 h-3 rounded-full bg-muted" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium">Created</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  {project.project_head?.full_name} &bull; {formatIST(project.created_at)}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {/* Reviewer Actions */}
            {isReviewer && project.status === 'pending_approval' && (
              <>
                <Button onClick={handleApprove} disabled={actionLoading === 'approve'}>
                  <UserCheck className="h-4 w-4 mr-2" />
                  {actionLoading === 'approve' ? 'Approving...' : 'Approve'}
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => setShowRejectDialog(true)}
                  disabled={actionLoading === 'reject'}
                >
                  <UserX className="h-4 w-4 mr-2" />
                  {actionLoading === 'reject' ? 'Rejecting...' : 'Reject'}
                </Button>
              </>
            )}

            {/* Project Head Actions */}
            {isProjectHead && (
              <>
                {project.status === 'pending_approval' && (
                  <Button
                    variant="outline"
                    onClick={handleWithdraw}
                    disabled={actionLoading === 'withdraw'}
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    {actionLoading === 'withdraw' ? 'Withdrawing...' : 'Withdraw'}
                  </Button>
                )}
                {project.status === 'closed' && project.rejection_reason && (
                  <Button
                    variant="outline"
                    onClick={handleResubmit}
                    disabled={actionLoading === 'resubmit'}
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    {actionLoading === 'resubmit' ? 'Resubmitting...' : 'Resubmit'}
                  </Button>
                )}
              </>
            )}

            {/* Edit Submission - only for project head when pending */}
            {isProjectHead && project.status === 'pending_approval' && (
              <Button variant="outline" asChild>
                <a href={`/projects/${project.id}/edit`}>
                  <FileText className="h-4 w-4 mr-2" />
                  Edit Submission
                </a>
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Reject Dialog */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Project</DialogTitle>
            <DialogDescription>
              Provide a reason for rejecting "{project.title}"
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Textarea
              placeholder="Explain why this project is being rejected..."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              rows={4}
            />
            <DialogFooter>
              <DialogTrigger asChild>
                <Button variant="outline" onClick={() => setShowRejectDialog(false)}>
                  Cancel
                </Button>
              </DialogTrigger>
              <Button
                variant="destructive"
                onClick={handleReject}
                disabled={!rejectReason.trim() || actionLoading === 'reject'}
              >
                {actionLoading === 'reject' ? 'Rejecting...' : 'Reject Project'}
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}