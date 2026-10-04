'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getTimeAgo } from '@/lib/utils';
import { fetchCommits, parseGitHubUrl } from '@/lib/github';
import { useEffect, useState } from 'react';

interface CommitFeedProps {
  githubUrl?: string;
}

export function CommitFeed({ githubUrl }: CommitFeedProps) {
  const [commits, setCommits] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!githubUrl) return;
    
    const parsed = parseGitHubUrl(githubUrl);
    if (!parsed) {
      setError('Invalid GitHub URL');
      return;
    }

    setLoading(true);
    fetchCommits(parsed.owner, parsed.repo)
      .then(setCommits)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [githubUrl]);

  if (!githubUrl) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Recent Commits</CardTitle>
      </CardHeader>
      <CardContent>
        {loading && <p className="text-sm text-muted-foreground">Loading commits...</p>}
        {error && <p className="text-sm text-destructive">{error}</p>}
        {!loading && !error && commits.length === 0 && (
          <p className="text-sm text-muted-foreground">No commits found</p>
        )}
        <div className="space-y-3">
          {commits.map((commit) => (
            <div key={commit.sha} className="flex gap-3 text-sm">
              <div className="font-mono text-xs bg-muted px-2 py-1 rounded">{commit.sha}</div>
              <div className="flex-1 min-w-0">
                <p className="truncate">{commit.message}</p>
                <p className="text-xs text-muted-foreground">
                  {commit.author} • {getTimeAgo(commit.date)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
