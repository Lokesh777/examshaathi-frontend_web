import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { ApiError } from "@/lib/api";
import { formatApiError, fieldErrorsFrom } from "@/utils/formatError";

/**
 * One shared submit wrapper for every auth form:
 * loading state, field-level errors, toast + typed error passthrough.
 */
export function useApiAction<TArgs extends unknown[], TResult>(
  action: (...args: TArgs) => Promise<TResult>,
  options: {
    onSuccess?: (result: TResult) => void;
    onError?: (error: ApiError | Error) => boolean | void;
    successMessage?: string;
  } = {},
) {
  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // Keep callbacks fresh: `run` is memoized, so a captured `options` closure
  // would otherwise see stale form state (e.g. an empty email).
  const optionsRef = useRef(options);
  useEffect(() => {
    optionsRef.current = options;
  });

  const run = useCallback(
    async (...args: TArgs) => {
      const opts = optionsRef.current;
      setLoading(true);
      setFieldErrors({});
      try {
        const result = await action(...args);
        if (opts.successMessage) toast.success(opts.successMessage);
        opts.onSuccess?.(result);
        return result;
      } catch (error) {
        const err = error instanceof Error ? error : new Error("Unknown error");
        setFieldErrors(fieldErrorsFrom(err));
        const handled = opts.onError?.(err as ApiError);
        if (handled !== true) toast.error(formatApiError(err));
        return undefined;
      } finally {
        setLoading(false);
      }
    },
    [action],
  );

  return { run, loading, fieldErrors, setFieldErrors };
}