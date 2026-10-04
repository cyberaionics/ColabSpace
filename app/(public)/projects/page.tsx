import { Suspense } from 'react';
import ProjectsPageContent from './ProjectsPageContent';

export default function ProjectsPage() {
  return (
    <Suspense fallback={<div className="container mx-auto px-4 py-8">Loading...</div>}>
      <ProjectsPageContent />
    </Suspense>
  );
}
