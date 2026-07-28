'use client';

import { JobItem } from '@/lib/types';

interface Props {
  jobs: JobItem[];
}

const STATUS_STYLES: Record<JobItem['status'], string> = {
  DRAFTED: 'bg-emerald-950 text-emerald-400',
  APPLIED: 'bg-sky-950 text-sky-400',
  SKIPPED: 'bg-rose-950 text-rose-400',
  PENDING: 'bg-zinc-800 text-zinc-400',
};

export default function JobQueue({ jobs }: Props) {
  return (
    <div className="p-6 rounded-xl bg-zinc-900 border border-zinc-800 text-white">
      <h3 className="text-lg font-semibold mb-4">Draft Review Queue</h3>
      <div className="space-y-3">
        {jobs.length === 0 && (
          <p className="text-sm text-zinc-500">No drafts yet — generate one from the panel.</p>
        )}
        {jobs.map((job) => (
          <div key={job.id} className="p-4 rounded-lg bg-zinc-950 border border-zinc-800 flex items-center justify-between">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-xs px-2 py-0.5 rounded bg-zinc-800 text-emerald-400 font-bold shrink-0">{job.platform}</span>
                <span className="font-medium text-sm truncate">{job.title}</span>
              </div>
              <p className="text-xs text-zinc-500 mt-1 line-clamp-1">{job.description}</p>
            </div>
            <div className="text-right shrink-0 ml-4">
              <span className="text-xs font-semibold block text-zinc-300">{job.budget}</span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${STATUS_STYLES[job.status]}`}>
                {job.status}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
