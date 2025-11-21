import type React from 'react';
import { useEffect, useRef } from 'react';

/**
 * Hook to keep a ref in sync with a state value.
 * Use this when you need to access the latest state value in a callback
 * that might capture stale closures.
 *
 * @param value - The value to keep in sync with the ref
 * @returns A ref object that always contains the latest value
 *
 * @example
 * ```tsx
 * const [name, setName] = useState('');
 * const [email, setEmail] = useState('');
 *
 * const nameRef = useLatestValue(name);
 * const emailRef = useLatestValue(email);
 *
 * const autosave = useAutosave(async () => {
 *   await save({
 *     name: nameRef.current,  // ✅ Always fresh
 *     email: emailRef.current, // ✅ Always fresh
 *   });
 * }, 1500);
 * ```
 */
export function useLatestValue<T>(value: T): React.RefObject<T> {
  const ref = useRef(value);

  useEffect(() => {
    ref.current = value;
  }, [value]);

  return ref;
}

/**
 * Type-safe payload validator.
 * Logs warnings if expected fields are missing from the payload.
 * Useful for catching bugs during development and debugging issues in production.
 *
 * @param payload - The payload object to validate
 * @param requiredFields - Array of field names that must be present
 * @param context - Context string for error messages (e.g., component name)
 *
 * @example
 * ```tsx
 * const autosave = useAutosave(async () => {
 *   const payload = {
 *     formId: form._id,
 *     nextRotationPreference: nextRotationPreferenceRef.current,
 *     activitiesParticipated: activitiesParticipatedRef.current,
 *   };
 *
 *   // Validate payload structure
 *   validatePayload(payload, [
 *     'formId',
 *     'nextRotationPreference',
 *     'activitiesParticipated',
 *   ], 'JCReflectionSection autosave');
 *
 *   await onUpdate(payload);
 * }, 1500);
 * ```
 */
export function validatePayload<T extends Record<string, unknown>>(
  payload: T,
  requiredFields: (keyof T)[],
  context: string
): void {
  const missingFields: string[] = [];
  const undefinedFields: string[] = [];
  const nullFields: string[] = [];

  for (const field of requiredFields) {
    if (!(field in payload)) {
      missingFields.push(String(field));
    } else if (payload[field] === undefined) {
      undefinedFields.push(String(field));
    } else if (payload[field] === null) {
      nullFields.push(String(field));
    }
  }

  if (missingFields.length > 0) {
    console.error(
      `[${context}] Missing required fields in payload:`,
      missingFields,
      '\nPayload keys:',
      Object.keys(payload)
    );
  }

  if (undefinedFields.length > 0) {
    console.warn(`[${context}] Fields are undefined in payload:`, undefinedFields);
  }

  if (nullFields.length > 0) {
    console.warn(`[${context}] Fields are null in payload (may be intentional):`, nullFields);
  }
}

/**
 * Creates a ref-based autosave payload builder.
 * Ensures all fields use refs to get latest values.
 *
 * @param refs - Object mapping field names to React refs
 * @param staticFields - Static fields to include in every payload
 * @returns A function that builds payloads from specified field names
 *
 * @example
 * ```tsx
 * const refs = {
 *   name: useLatestValue(name),
 *   email: useLatestValue(email),
 *   age: useLatestValue(age),
 * };
 *
 * const buildPayload = createPayloadBuilder(refs, {
 *   formId: form._id,
 * });
 *
 * const autosave = useAutosave(async () => {
 *   const payload = buildPayload(['name', 'email', 'age']);
 *   await save(payload);
 * }, 1500);
 * ```
 */
export function createPayloadBuilder<
  TRefs extends Record<string, React.RefObject<unknown>>,
  TStatic extends Record<string, unknown>,
>(refs: TRefs, staticFields: TStatic = {} as TStatic) {
  return <TKeys extends (keyof TRefs)[]>(
    fieldNames: TKeys
  ): TStatic & { [K in TKeys[number]]: TRefs[K] extends React.RefObject<infer U> ? U : never } => {
    const payload: Record<string, unknown> = { ...staticFields };

    for (const fieldName of fieldNames) {
      payload[fieldName as string] = refs[fieldName].current;
    }

    return payload as TStatic & {
      [K in TKeys[number]]: TRefs[K] extends React.RefObject<infer U> ? U : never;
    };
  };
}
