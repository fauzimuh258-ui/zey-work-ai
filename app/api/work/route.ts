import { NextResponse } from 'next/server';
import { RateLimiter, safeParseWorkResult, validateWorkRequest, pickString, pickScore } from '@/lib/utils';
import { WorkRequestBody, WorkResult } from '@/lib/types';

// This endpoint only scores a job posting and drafts a proposal. It never
// submits anything to Upwork/Fiverr, and has no path for completing surveys
// or microtask-platform HITs — those platforms exist to capture genuine
// human responses, so automating them breaks their ToS. Keep it that way.

const GATEWAY_URL = process.env.ZEY_AI_GATEWAY_URL || 'https://zey-ai.vercel.app/api/chat';
const MODEL_NAME = process.env.ZEY_AI_MODEL || 'llama-3.3-70b-versatile';
const FETCH_TIMEOUT_MS = 20000;

const limiter = new RateLimiter(10, 60 * 60 * 1000);

const SYSTEM_PROMPT = `You are the Zey Work drafting assistant — you evaluate freelance job postings and draft proposals for a human freelancer to review and submit themselves. You never submit, execute, or complete anything on any platform; you only produce a draft.

## Chain-of-Thought Evaluation
1. Parse the job title, description, budget, and platform.
2. Score the match 0-100 against a Next.js / TypeScript / Tailwind web development skillset.
3. Flag red flags (unpaid-work traps, scope creep, vague requirements).
4. Decide: draft a proposal (score >= 70) or skip (score < 70).

## Chain-of-Verification Before Output
- Is the proposal specific to this posting, not generic boilerplate?
- Does it address the concrete requirements in the description?
- Is the tone professional and human, not robotic?

## Output Contract
Return ONLY valid JSON, no markdown fences, in exactly this shape:
{
  "action": "DRAFT_READY" | "SKIP",
  "match_score": number,
  "reason": string,
  "proposal": string
}
If score >= 70: write a short, specific proposal referencing concrete details from the posting, plus a one-line reason for the match. If score < 70: leave "proposal" empty and put the reason for skipping in "reason".`;

function buildUserMessage(body: WorkRequestBody): string {
  const platform = body.platform || 'Upwork';
  const budget = body.budget?.trim() || 'N/A';
  return `Platform: ${platform}\nTitle: ${body.jobTitle.trim()}\nBudget: ${budget}\nDescription: ${body.jobDescription.trim()}`;
}

export async function POST(req: Request) {
  let body: Partial<WorkRequestBody>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Request body must be valid JSON.' }, { status: 400 });
  }

  const validation = validateWorkRequest(body);
  if (!validation.valid) {
    return NextResponse.json({ error: validation.error }, { status: 400 });
  }

  if (!limiter.check()) {
    return NextResponse.json(
      { error: 'Rate limit reached for this server instance. Try again shortly.' },
      { status: 429 }
    );
  }

  const validBody = body as WorkRequestBody;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    const response = await fetch(GATEWAY_URL, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-api-key': 'vvbam988',
  },
  body: JSON.stringify({
    model: MODEL_NAME,
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: buildUserMessage(validBody) },
    ],
    temperature: 0.2,
  }),
  signal: controller.signal,
});

    if (!response.ok) {
      return NextResponse.json(
        { error: `Drafting service returned an error (status ${response.status}).` },
        { status: 502 }
      );
    }

    const data = await response.json();
    const aiText: string = data?.choices?.[0]?.message?.content ?? '';
    const parsed = safeParseWorkResult(aiText);
    const score = pickScore(parsed);

    const result: WorkResult =
      score !== null
        ? {
            action: parsed?.action === 'DRAFT_READY' ? 'DRAFT_READY' : 'SKIP',
            match_score: Math.max(0, Math.min(100, score)),
            reason: pickString(parsed, 'reason'),
            proposal: pickString(parsed, 'proposal'),
          }
        : {
            action: 'SKIP',
            match_score: 0,
            reason: 'Could not parse a structured response from the drafting service.',
            proposal: '',
          };

    return NextResponse.json({ success: true, timestamp: new Date().toISOString(), result });
  } catch (error: unknown) {
    const isAbort = error instanceof Error && error.name === 'AbortError';
    return NextResponse.json(
      { error: isAbort ? 'Drafting service timed out.' : 'Internal server error.' },
      { status: isAbort ? 504 : 500 }
    );
  } finally {
    clearTimeout(timeout);
  }
}
