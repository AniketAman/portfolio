import { useEffect, useState } from 'react';
import type { ResumeData } from '../content/types';

type ResumeState = {
  data: ResumeData | null;
  loading: boolean;
  error: string | null;
};

export function useResumeData() {
  const [state, setState] = useState<ResumeState>({
    data: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    let cancelled = false;

    async function loadResume() {
      try {
        const response = await fetch('/resume.json');
        if (!response.ok) {
          throw new Error(`Failed to load resume.json (${response.status})`);
        }

        const json = (await response.json()) as ResumeData;
        if (!cancelled) {
          setState({
            data: json,
            loading: false,
            error: null,
          });
        }
      } catch (error) {
        if (!cancelled) {
          setState({
            data: null,
            loading: false,
            error:
              error instanceof Error
                ? error.message
                : 'Failed to load resume data.',
          });
        }
      }
    }

    void loadResume();

    return () => {
      cancelled = true;
    };
  }, []);

  return state;
}
