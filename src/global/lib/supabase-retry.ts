/* Wraps a Supabase auth call so transient rate-limit errors don't surface
   as user-facing failures. Supabase enforces aggressive rate limits on
   anon-key auth operations; impatient users clicking submit multiple
   times trip these limits even when the underlying credentials are fine.
   We retry with backoff and only bubble the error up after exhausting
   attempts. */

interface SupabaseLikeResult {
  // Supabase responses union null on error, so anything assignable to
  // unknown is fine here — the caller already knows the real shape.
  data: unknown;
  error: { message?: string; status?: number } | null;
}

function isRateLimitError(err: { message?: string; status?: number } | null) {
  if (!err) return false;
  if (err.status === 429) return true;
  const m = (err.message || "").toLowerCase();
  return (
    m.includes("rate limit") ||
    m.includes("too many") ||
    m.includes("for security purposes") ||
    m.includes("try again")
  );
}

export async function withRateLimitRetry<T extends SupabaseLikeResult>(
  call: () => Promise<T>,
  options: { attempts?: number; baseDelayMs?: number } = {}
): Promise<T> {
  const attempts = options.attempts ?? 4;
  const baseDelay = options.baseDelayMs ?? 800;

  let last: T | null = null;
  for (let i = 0; i < attempts; i++) {
    const result = await call();
    if (!result.error || !isRateLimitError(result.error)) {
      return result;
    }
    last = result;
    if (i < attempts - 1) {
      await new Promise((r) => setTimeout(r, baseDelay * Math.pow(2, i)));
    }
  }
  return last!;
}
