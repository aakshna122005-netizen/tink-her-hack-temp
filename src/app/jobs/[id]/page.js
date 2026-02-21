import { DEMO_JOBS } from '@/lib/demo-data';
import JobDetailClient from './JobDetailClient';

export function generateStaticParams() {
    return DEMO_JOBS.map((j) => ({ id: j.id }));
}

export default function JobDetailPage({ params }) {
    return <JobDetailClient params={params} />;
}
