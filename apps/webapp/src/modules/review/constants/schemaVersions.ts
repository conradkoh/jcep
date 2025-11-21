/**
 * Schema version constants for JCEP Review Forms
 *
 * Version management:
 * - Increment CURRENT_REVIEW_FORM_SCHEMA_VERSION for breaking changes only
 * - Add new version to SUPPORTED_SCHEMA_VERSIONS array
 * - Create new v{N}/ folder in components for new version
 * - Question text changes do NOT require version increments
 */

export const CURRENT_REVIEW_FORM_SCHEMA_VERSION = 1;
export const SUPPORTED_SCHEMA_VERSIONS = [1] as const;
