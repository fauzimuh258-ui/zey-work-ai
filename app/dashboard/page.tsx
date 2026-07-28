import Navbar from '@/components/Navbar';
import JobProposalPanel from '@/components/JobProposalPanel';
import JobQueue from '@/components/JobQueue';
import { JobItem } from '@/lib/types';

const mockJobs: JobItem[] = [
  { id: '1', title: 'React Frontend Fixes', platform: 'Upwork', budget: '$100', description: 'Fix layout shifts and CSS bugs on dashboard.', status: 'APPLIED', matchScore: 92, createdAt: new Date().toISOString() },
  { id: '2', title: 'Python Web Scraper Needed', platform: 'Upwork', budget: '$50', description: 'Scrape data from directory listing.', status: 'SKIPPED', matchScore: 40, createdAt: new Date().toISOString() },
  { id: '3', title: 'Landing Page Rebuild', platform: 'Fiverr', budget: '$300', description: 'Rebuild marketing landing page in Next.js + Tailwind.', status: 'DRAFTED', matchScore: 88, createdAt: new Date().toISOString() },
];

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <Navbar />
      <main className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Zey Work Dashboard</h1>
          <p className="text-zinc-400 mt-1">AI-assisted proposal drafts for jobs you review and submit yourself.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <JobProposalPanel />
          <JobQueue jobs={mockJobs} />
        </div>
      </main>
    </div>
  );
}
