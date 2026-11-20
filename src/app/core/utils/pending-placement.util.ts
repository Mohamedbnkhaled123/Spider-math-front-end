export interface IPendingPlacementResult {
  attemptId: string;
  curriculum: string;
  gradeLevel: string;
  academicTerm: string;
  countryCode?: string;
  divisionCode?: string;
  score: number;
  maxScore: number;
  percentage: number;
  passed: boolean;
  totalQuestions: number;
  correctAnswersCount: number;
  submittedAt: number;
}

const PENDING_PLACEMENT_STORAGE_KEY = 'spider_pending_placement_result';
const PENDING_PLACEMENT_TTL_MS = 2 * 60 * 60 * 1000;
const MONGO_OBJECT_ID_REGEX = /^[0-9a-fA-F]{24}$/;

/**
 * Checks whether an ID matches a 24-character hex Mongo ObjectId.
 */
export function isValidMongoObjectId(id?: string | null): boolean {
  return Boolean(id && MONGO_OBJECT_ID_REGEX.test(id));
}

/**
 * Builds the canonical post-auth return URL pointing back to the placement result report.
 */
export function buildPlacementResultReturnUrl(attemptId?: string | null): string {
  if (attemptId && attemptId.trim()) {
    return `/placement-test?showResult=true&attemptId=${encodeURIComponent(attemptId.trim())}`;
  }
  return '/placement-test?showResult=true';
}

/**
 * Persists a guest's evaluated placement test result across auth navigation (2h TTL).
 */
export function savePendingPlacementResult(
  result: Omit<IPendingPlacementResult, 'submittedAt'>
): void {
  const payload: IPendingPlacementResult = {
    ...result,
    submittedAt: Date.now()
  };
  const serialized = JSON.stringify(payload);

  if (typeof sessionStorage !== 'undefined') {
    try {
      sessionStorage.setItem(PENDING_PLACEMENT_STORAGE_KEY, serialized);
    } catch {}
  }
  if (typeof localStorage !== 'undefined') {
    try {
      localStorage.setItem(PENDING_PLACEMENT_STORAGE_KEY, serialized);
    } catch {}
  }
}

/**
 * Retrieves an unexpired pending placement result if present in client storage.
 */
export function getPendingPlacementResult(): IPendingPlacementResult | null {
  let raw: string | null = null;

  if (typeof sessionStorage !== 'undefined') {
    try {
      raw = sessionStorage.getItem(PENDING_PLACEMENT_STORAGE_KEY);
    } catch {}
  }
  if (!raw && typeof localStorage !== 'undefined') {
    try {
      raw = localStorage.getItem(PENDING_PLACEMENT_STORAGE_KEY);
    } catch {}
  }
  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw) as IPendingPlacementResult;
    if (
      !parsed ||
      typeof parsed.submittedAt !== 'number' ||
      Date.now() - parsed.submittedAt > PENDING_PLACEMENT_TTL_MS
    ) {
      clearPendingPlacementResult();
      return null;
    }
    return parsed;
  } catch {
    clearPendingPlacementResult();
    return null;
  }
}

/**
 * Clears any stored pending placement test result from browser storage.
 */
export function clearPendingPlacementResult(): void {
  if (typeof sessionStorage !== 'undefined') {
    try {
      sessionStorage.removeItem(PENDING_PLACEMENT_STORAGE_KEY);
    } catch {}
  }
  if (typeof localStorage !== 'undefined') {
    try {
      localStorage.removeItem(PENDING_PLACEMENT_STORAGE_KEY);
    } catch {}
  }
}
