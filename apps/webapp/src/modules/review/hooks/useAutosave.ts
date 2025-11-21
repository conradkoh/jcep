import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Custom hook for autosaving data with debounce
 *
 * @param saveFn - Async function to save data
 * @param debounceMs - Debounce delay in milliseconds (default: 1000ms)
 * @returns Object with save function, saving state, and error state
 */
export function useAutosave<T>(saveFn: (data: T) => Promise<void>, debounceMs = 1000) {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const saveCountRef = useRef(0);
  const isMountedRef = useRef(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const debouncedSave = useCallback(
    (data: T) => {
      // Clear existing timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      setIsSaving(true);
      setError(null);

      // Set new timeout
      timeoutRef.current = setTimeout(async () => {
        const currentSave = ++saveCountRef.current;

        try {
          await saveFn(data);

          if (isMountedRef.current && currentSave === saveCountRef.current) {
            setIsSaving(false);
            setError(null);
          }
        } catch (err) {
          if (isMountedRef.current) {
            const error = err instanceof Error ? err : new Error('Failed to save');
            setError(error);
            setIsSaving(false);
            console.error('Autosave error:', error);
          }
        }
      }, debounceMs);
    },
    [saveFn, debounceMs]
  );

  const saveImmediately = useCallback(
    async (data: T) => {
      // Clear any pending debounced save
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }

      setIsSaving(true);
      setError(null);

      try {
        await saveFn(data);
        if (isMountedRef.current) {
          setIsSaving(false);
        }
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Failed to save');
        if (isMountedRef.current) {
          setError(error);
          setIsSaving(false);
        }
        console.error('Save error:', error);
        throw error;
      }
    },
    [saveFn]
  );

  const cancelPending = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  return {
    debouncedSave,
    saveImmediately,
    cancelPending,
    isSaving,
    error,
  };
}
