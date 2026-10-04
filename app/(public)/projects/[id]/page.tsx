import { Suspense } from 'react';
import ProjectDetailContent from './ProjectDetailContent';

export default function ProjectDetailPage({ params }: { params: { id: string } }) {
  return (
    <Suspense fallback={<div className="container mx-auto px-4 py-8">Loading...</div>}>
      <ProjectDetailContent projectId={params.id} />
    </Suspense>
  );
}
