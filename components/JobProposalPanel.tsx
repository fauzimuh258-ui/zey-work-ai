'use client';

import { useState } from 'react';
import type { JobPlatform, WorkResponse, WorkErrorResponse, WorkResult } from '@/lib/types';

type PanelState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'done'; result: WorkResult };

const MAX_TITLE = 200;
const MAX_DESCRIPTION = 5000;
const MAX_BUDGET = 50;

export default function JobProposalPanel() {
  const [jobTitle, setJobTitle] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [platform, setPlatform] = useState<JobPlatform>('Upwork');
  const [budget, setBudget] = useState('');
  const [state, setState] = useState<PanelState>({ status: 'idle' });

  const canSubmit = jobTitle.trim().length > 0 && jobDescription.trim().length > 0 && state.status !== 'loading';

  const handleGenerate = async () => {
    if (!canSubmit) return;
    setState({ status: 'loading' });

    try {
      const res = await fetch('/api/work', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobTitle, jobDescription, platform, budget }),
      });

      const data: WorkResponse | WorkErrorResponse = await res.json();

      if (!res.ok || 'error' in data) {
        setState({ status: 'error', message: 'error' in data ? data.error : 'Something went wrong.' });
        return;
      }

      setState({ status: 'done', result: data.result });
    } catch {
      setState({ status: 'error', message: 'Could not reach the drafting service. Check your connection and try again.' });
    }
  };

  return (
    <div className="p-6 rounded-xl bg-zinc-900 border border-zinc-800 text-white space-y-4">
      <div>
        <h2 className="text-xl font-bold text-emerald-400">Proposal Draft Generator</h2>
        <p className="text-xs text-zinc-500 mt-1">
          Paste a job posting to get a match score and a draft proposal. Nothing is sent to Upwork or Fiverr — review and submit it yourself.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-zinc-400 mb-1">Platform</label>
          <select
            value={platform}
            onChange={(e) => setPlatform(e.target.value as JobPlatform)}
            className="w-full bg-zinc-950 border border-zinc-800 rounded p-2 text-sm text-white focus:outline-none focus:border-emerald-500"
          >
            <option value="Upwork">Upwork</option>
            <option value="Fiverr">Fiverr</option>
            <option value="Other">Other</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-zinc-400 mb-1">Budget</label>
          <input
            type="text"
            placeholder="$250"
            value={budget}
            onChange={(e) => setBudget(e.target.value)}
            maxLength={MAX_BUDGET}
            className="w-full bg-zinc-950 border border-zinc-800 rounded p-2 text-sm text-white focus:outline-none focus:border-emerald-500"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-zinc-400 mb-1">Job Title</label>
        <input
          type="text"
          placeholder="e.g. Next.js & Tailwind Landing Page Developer"
          value={jobTitle}
          onChange={(e) => setJobTitle(e.target.value)}
          maxLength={MAX_TITLE}
          className="w-full bg-zinc-950 border border-zinc-800 rounded p-2 text-sm text-white focus:outline-none focus:border-emerald-500"
        />
      </div>

      <div>
        <label className="block text-xs font-medium text-zinc-400 mb-1">Job Description</label>
        <textarea
          rows={4}
          placeholder="Paste requirements here..."
          value={jobDescription}
          onChange={(e) => setJobDescription(e.target.value)}
          maxLength={MAX_DESCRIPTION}
          className="w-full bg-zinc-950 border border-zinc-800 rounded p-2 text-sm text-white focus:outline-none focus:border-emerald-500"
        />
      </div>

      <button
        onClick={handleGenerate}
        disabled={!canSubmit}
        className="w-full py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {state.status === 'loading' ? 'Scoring & Drafting...' : 'Generate Draft'}
      </button>

      {state.status === 'error' && (
        <div className="p-3 rounded bg-rose-950 border border-rose-900 text-rose-300 text-sm">
          {state.message}
        </div>
      )}

      {state.status === 'done' && (
        <div className="p-4 rounded bg-zinc-950 border border-zinc-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-400">Match score</span>
            <span className={`text-sm font-bold ${state.result.match_score >= 70 ? 'text-emerald-400' : 'text-rose-400'}`}>
              {state.result.match_score}%
            </span>
          </div>
          {state.result.action === 'DRAFT_READY' ? (
            <>
              <span className="text-xs font-semibold text-zinc-400 block">Draft proposal</span>
              <p className="text-sm text-zinc-200 whitespace-pre-wrap">{state.result.proposal}</p>
            </>
          ) : (
            <p className="text-sm text-zinc-400">{state.result.reason || 'Skipped — low match score.'}</p>
          )}
        </div>
      )}
    </div>
  );
}
