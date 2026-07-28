import { WorkRequestBody } from './types';

const MAX_TITLE_LENGTH = 200;
const MAX_DESCRIPTION_LENGTH = 5000;
const MAX_BUDGET_LENGTH = 50;
const ALLOWED_PLATFORMS = ['Upwork', 'Fiverr', 'Other'];

export interface ValidationResult {
  valid: boolean;
  error?: string;
}

export function validateWorkRequest(body: Partial<WorkRequestBody> | null): ValidationResult {
  if (!body || typeof body !== 'object') {
    return { valid: false, error: 'Invalid request body.' };
  }

  const { jobTitle, jobDescription, platform, budget } = body;

  if (!jobTitle || typeof jobTitle !== 'string' || !jobTitle.trim()) {
    return { valid: false, error: 'Job title is required.' };
  }
  if (jobTitle.length > MAX_TITLE_LENGTH) {
    return { valid: false, error: `Job title must be under ${MAX_TITLE_LENGTH} characters.` };
  }

  if (!jobDescription || typeof jobDescription !== 'string' || !jobDescription.trim()) {
    return { valid: false, error: 'Job description is required.' };
  }
  if (jobDescription.length > MAX_DESCRIPTION_LENGTH) {
    return { valid: false, error: `Job description must be under ${MAX_DESCRIPTION_LENGTH} characters.` };
  }

  if (platform && !ALLOWED_PLATFORMS.includes(platform)) {
    return { valid: false, error: 'Invalid platform.' };
  }

  if (budget && (typeof budget !== 'string' || budget.length > MAX_BUDGET_LENGTH)) {
    return { valid: false, error: 'Invalid budget format.' };
  }

  return { valid: true };
}

/**
 * Best-effort per-instance sliding-window limiter. On Vercel, serverless
 * functions can scale to multiple instances with separate memory, so this
 * does not enforce a hard global cap — it just protects a single warm
 * instance from runaway/looped calls to the LLM gateway. Swap in Vercel KV
 * or Upstash Redis later if a real cross-instance limit is needed.
 */
export class RateLimiter {
  private timestamps: number[] = [];
  constructor(private maxRequests: number, private windowMs: number) {}

  check(): boolean {
    const now = Date.now();
    this.timestamps = this.timestamps.filter((t) => now - t < this.windowMs);
    if (this.timestamps.length >= this.maxRequests) return false;
    this.timestamps.push(now);
    return true;
  }
}

export function safeParseWorkResult(text: string): Record<string, unknown> | null {
  try {
    const cleaned = text.replace(/```json\s*|```/g, '').trim();
    const result = JSON.parse(cleaned);
    return typeof result === 'object' && result !== null ? result : null;
  } catch {
    return null;
  }
}

export function pickString(obj: Record<string, unknown> | null, key: string): string {
  const val = obj?.[key];
  return typeof val === 'string' ? val : '';
}

export function pickScore(obj: Record<string, unknown> | null): number | null {
  const val = obj?.match_score;
  return typeof val === 'number' && Number.isFinite(val) ? val : null;
}
