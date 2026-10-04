'use client';

import { useState, useEffect } from 'react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Edit, Github, ExternalLink, Users, Calendar, Award } from 'lucide-react';
import { getInitials, formatIST } from '@/lib/utils';
import Link from 'next/link';

interface UserProfile {
  id: string;
  full_name: string;
  email: string;
  bio?: string;
  github_url?: string;
  portfolio_url?: string;
  skills?: string[];
  branch?: string;
  year?: number;
  organization?: {
    id: string;
    name: string;
  };
  created_at: string;
}

interface Project {
  id: string;
  title: string;
  status: string;
  created_at: string;
}

interface ProfileContentProps {
  userId: string;
  currentUserId: string;
}

export function ProfileContent({ userId, currentUserId }: ProfileContentProps) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOwnProfile, setIsOwnProfile] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch(`/api/users/profile/${userId}`);
        const data = await response.json();
        
        if (data.data) {
          setProfile(data.data);
          setIsOwnProfile(userId === currentUserId);
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [userId, currentUserId]);

  if (loading) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Loading profile...</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Profile not found</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-start gap-6">
            <Avatar className="h-24 w-24">
              <AvatarFallback className="text-2xl">
                {getInitials(profile.full_name)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center gap-4 mb-2">
                <h1 className="text-3xl font-bold">{profile.full_name}</h1>
                {isOwnProfile && (
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/profile/${userId}/edit`}>
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Profile
                    </Link>
                  </Button>
                )}
              </div>
              <p className="text-muted-foreground mb-2">{profile.email}</p>
              {profile.bio && (
                <p className="text-sm mb-4">{profile.bio}</p>
              )}
              <div className="flex flex-wrap gap-4 text-sm">
                {profile.branch && (
                  <span className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    {profile.branch} {profile.year && `Year ${profile.year}`}
                  </span>
                )}
                {profile.organization && (
                  <span className="flex items-center gap-1">
                    <Award className="h-4 w-4" />
                    {profile.organization.name}
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  Joined {formatIST(profile.created_at)}
                </span>
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Skills</CardTitle>
          </CardHeader>
          <CardContent>
            {profile.skills && profile.skills.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {profile.skills.map((skill) => (
                  <Badge key={skill} variant="secondary">
                    {skill}
                  </Badge>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No skills listed</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Links</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {profile.github_url && (
                <a
                  href={profile.github_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm hover:underline"
                >
                  <Github className="h-4 w-4" />
                  GitHub
                  <ExternalLink className="h-3 w-3" />
                </a>
              )}
              {profile.portfolio_url && (
                <a
                  href={profile.portfolio_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm hover:underline"
                >
                  <ExternalLink className="h-4 w-4" />
                  Portfolio
                  <ExternalLink className="h-3 w-3" />
                </a>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Project History</CardTitle>
        </CardHeader>
        <CardContent>
          {projects.length > 0 ? (
            <div className="space-y-3">
              {projects.map((project) => (
                <div key={project.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <h4 className="font-medium">{project.title}</h4>
                    <p className="text-xs text-muted-foreground">
                      Created {formatIST(project.created_at)}
                    </p>
                  </div>
                  <Badge variant="outline">{project.status}</Badge>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No projects yet</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}