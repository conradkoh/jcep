import { describe, expect, it } from 'vitest';

import {
  DEFAULT_DOCUMENT_TITLE,
  formatReviewTokenPageTitle,
  INVALID_REVIEW_LINK_TITLE,
} from './reviewFormDocumentTitle';

describe('formatReviewTokenPageTitle', () => {
  it('formats buddy and JC names into a title', () => {
    const result = formatReviewTokenPageTitle('Alex Tan', 'Jordan Lee');
    expect(result).toBe('Alex Tan · Jordan Lee | JCEP');
  });

  it('trims whitespace from names', () => {
    const result = formatReviewTokenPageTitle('  Alex Tan  ', '  Jordan Lee  ');
    expect(result).toBe('Alex Tan · Jordan Lee | JCEP');
  });
});

describe('constants', () => {
  it('has the correct default title', () => {
    expect(DEFAULT_DOCUMENT_TITLE).toBe('JCEP');
  });

  it('formats the invalid review link title', () => {
    expect(INVALID_REVIEW_LINK_TITLE).toBe('Invalid Review Link | JCEP');
  });
});
