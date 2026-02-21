import { DEMO_STARTUPS } from '@/lib/demo-data';
import StartupDetailClient from './StartupDetailClient';

export function generateStaticParams() {
    return DEMO_STARTUPS.map((s) => ({ id: s.id }));
}

export default function StartupDetailPage({ params }) {
    return <StartupDetailClient params={params} />;
}
