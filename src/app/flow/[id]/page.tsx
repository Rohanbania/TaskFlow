import { FlowPageContent } from './flow-page-content';

export default function FlowPage({ params }: { params: { id: string } }) {
  // This is now a Server Component, so we can directly access params.id
  return <FlowPageContent id={params.id} />;
}

export function generateStaticParams() {
  // This is a placeholder. In a real app, you might fetch flow IDs here.
  return [];
}
