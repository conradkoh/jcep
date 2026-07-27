export const DEFAULT_DOCUMENT_TITLE = 'JCEP';

export function formatReviewTokenPageTitle(buddyName: string, juniorCommanderName: string): string {
  const buddy = buddyName.trim();
  const jc = juniorCommanderName.trim();
  return `${buddy} · ${jc} | ${DEFAULT_DOCUMENT_TITLE}`;
}

export const INVALID_REVIEW_LINK_TITLE = `Invalid Review Link | ${DEFAULT_DOCUMENT_TITLE}`;
