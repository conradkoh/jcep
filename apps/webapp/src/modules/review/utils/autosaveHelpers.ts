import type React from 'react';
import { useEffect, useRef, useState, useMemo } from 'react';

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
 * Hook to create a state object with built-in refs.
 * Automatically keeps refs in sync with state values.
 *
 * @param initialState - The initial state object
 * @returns A tuple of [state, setState, stateRefs]
 *
 * @example
 * ```tsx
 * const [state, setState, stateRefs] = useStateWithRefs({
 *   name: '',
 *   email: '',
 *   age: 0,
 * });
 *
 * const autosave = useAutosave(async () => {
 *   await save({
 *     name: stateRefs.name.current,
 *     email: stateRefs.email.current,
 *     age: stateRefs.age.current,
 *   });
 * }, 1500);
 *
 * // Update state normally
 * setState({ ...state, name: 'John' });
 * ```
 */
export function useStateWithRefs<T extends Record<string, unknown>>(
  initialState: T
): [T, React.Dispatch<React.SetStateAction<T>>, { [K in keyof T]: React.RefObject<T[K]> }] {
  const [state, setState] = useState(initialState);

  const refs = useMemo(() => {
    const result: Record<string, React.RefObject<unknown>> = {};
    for (const key in initialState) {
      result[key] = { current: initialState[key] };
    }
    return result as { [K in keyof T]: React.RefObject<T[K]> };
  }, []);

  useEffect(() => {
    for (const key in state) {
      refs[key].current = state[key];
    }
  }, [state, refs]);

  return [state, setState, refs];
}

/**
 * Type-safe payload validator for development.
 * Logs warnings if expected fields are missing from the payload.
 * Only runs in development mode to avoid production overhead.
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
 *   // Validate in development
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
  if (process.env.NODE_ENV !== 'development') return;

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
    console.warn(
      `[${context}] Fields are null in payload (may be intentional):`,
      nullFields
    );
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
  TStatic extends Record<string, unknown>
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
