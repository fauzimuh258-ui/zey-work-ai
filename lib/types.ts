export type JobPlatform = 'Upwork' | 'Fiverr' | 'Other';
export type JobStatus = 'PENDING' | 'DRAFTED' | 'APPLIED' | 'SKIPPED';

export interface JobItem {
  id: string;
  title: string;
  platform: JobPlatform;
  budget: string;
  description: string;
  status: JobStatus;
  matchScore?: number;
  proposal?: string;
  createdAt: string;
}

export interface WorkRequestBody {
  jobTitle: string;
  jobDescription: string;
  platform?: JobPlatform;
  budget?: string;
}

export type WorkAction = 'DRAFT_READY' | 'SKIP';

export interface WorkResult {
  action: WorkAction;
  match_score: number;
  reason: string;
  proposal: string;
}

export interface WorkResponse {
  success: true;
  timestamp: string;
  result: WorkResult;
}

export interface WorkErrorResponse {
  error: string;
}
