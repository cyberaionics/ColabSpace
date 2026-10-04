'use client';

import { useState, useEffect, useMemo } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { ProjectGrid } from '@/components/projects/ProjectGrid';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search } from 'lucide-react';

interface Project {
  id: string;
  title: string;
  description: string;
  status: string;
  domain?: string;
  organization?: { name: string };
  poster?: { full_name: string };
  skills?: string[];
  deadline?: string;
  team_size: number;
  team_size_current: number;
  last_commit?: string;
  members?: Array<{ full_name: string }>;
}

export default function ProjectsPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [domain, setDomain] = useState(searchParams.get('domain') || 'all');
  const [organization, setOrganization] = useState(searchParams.get('org') || 'all');
  const [tab, setTab] = useState(searchParams.get('tab') || 'live');
  const [sort, setSort] = useState(searchParams.get('sort') || 'newest');

  useEffect(() => {
    setTimeout(() => {
      setProjects([
        {
          id: '1',
          title: 'AI-Powered Study Assistant',
          description: 'An intelligent assistant to help students with coursework',
          status: 'open',
          domain: 'AI/ML',
          organization: { name: 'IEEE' },
          skills: ['Python', 'TensorFlow', 'React'],
          deadline: '2026-11-15',
          team_size: 5,
          team_size_current: 2,
          last_commit: new Date().toISOString(),
          members: [{ full_name: 'John Doe' }, { full_name: 'Jane Smith' }]
        },
        {
          id: '2',
          title: 'Campus Navigation App',
          description: 'Interactive map for campus navigation',
          status: 'in_progress',
          domain: 'Mobile',
          organization: { name: 'ACM' },
          skills: ['React Native', 'Node.js'],
          deadline: '2026-10-20',
          team_size: 4,
          team_size_current: 4,
          last_commit: new Date(Date.now() - 86400000 * 2).toISOString(),
          members: []
        }
      ]);
      setLoading(false);
    }, 1000);
  }, []);

  const updateParams = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value && value !== 'all') {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    router.push(`?${params.toString()}`);
  };

  const filteredProjects = useMemo(() => {
    let filtered = [...projects];

    if (tab === 'live') {
      filtered = filtered.filter(p => p.status === 'open' || p.status === 'in_progress');
    } else if (tab === 'completed') {
      filtered = filtered.filter(p => p.status === 'completed');
    } else if (tab === 'archived') {
      filtered = filtered.filter(p => p.status === 'closed');
    }

    if (search) {
      filtered = filtered.filter(p => 
        p.title.toLowerCase().includes(search.toLowerCase()) ||
        p.description.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (domain !== 'all') {
      filtered = filtered.filter(p => p.domain === domain);
    }

    if (organization !== 'all') {
      filtered = filtered.filter(p => p.organization?.name === organization);
    }

    if (sort === 'newest') {
      filtered.sort((a, b) => new Date(b.deadline || '').getTime() - new Date(a.deadline || '').getTime());
    } else if (sort === 'deadline') {
      filtered.sort((a, b) => new Date(a.deadline || '').getTime() - new Date(b.deadline || '').getTime());
    } else if (sort === 'slots') {
      filtered.sort((a, b) => (b.team_size - b.team_size_current) - (a.team_size - a.team_size_current));
    }

    return filtered;
  }, [projects, search, domain, organization, tab, sort]);

  const domains = [...new Set(projects.map(p => p.domain).filter(Boolean))];
  const organizations = [...new Set(projects.map(p => p.organization?.name).filter(Boolean))];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Discover Projects</h1>
        <p className="text-muted-foreground">Find and join exciting projects from IIT Dharwad clubs</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-4 mb-6">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search projects..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && updateParams('search', search)}
              className="pl-9"
            />
          </div>
        </div>
        
        <div className="flex gap-2">
          <Select value={domain} onChange={(e) => updateParams('domain', e.target.value)}>
            <option value="all">All Domains</option>
            {domains.map(d => <option key={d} value={d}>{d}</option>)}
          </Select>
          
          <Select value={organization} onChange={(e) => updateParams('org', e.target.value)}>
            <option value="all">All Clubs</option>
            {organizations.map(o => <option key={o} value={o}>{o}</option>)}
          </Select>
          
          <Select value={sort} onChange={(e) => updateParams('sort', e.target.value)}>
            <option value="newest">Newest</option>
            <option value="deadline">Deadline</option>
            <option value="slots">Available Slots</option>
          </Select>
        </div>
      </div>

      <Tabs value={tab} onValueChange={(v: string) => updateParams('tab', v)} className="mb-6">
        <TabsList>
          <TabsTrigger value="live">Live</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
          <TabsTrigger value="archived">Archived</TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {filteredProjects.length} projects found
        </p>
      </div>

      <ProjectGrid projects={filteredProjects} loading={loading} />
    </div>
  );
}
