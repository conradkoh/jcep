'use client';

import { useEffect } from 'react';

import type { ReviewForm } from '../types';
import {
  DEFAULT_DOCUMENT_TITLE,
  formatReviewTokenPageTitle,
  INVALID_REVIEW_LINK_TITLE,
} from '../utils/reviewFormDocumentTitle';

export function useReviewFormDocumentTitle(
  form: ReviewForm | null | undefined,
  isLoading: boolean
): void {
  useEffect(() => {
    if (isLoading) return;

    if (!form) {
      document.title = INVALID_REVIEW_LINK_TITLE;
      return () => {
        document.title = DEFAULT_DOCUMENT_TITLE;
      };
    }

    document.title = formatReviewTokenPageTitle(form.buddyName, form.juniorCommanderName);
    return () => {
      document.title = DEFAULT_DOCUMENT_TITLE;
    };
  }, [form, isLoading]);
}
