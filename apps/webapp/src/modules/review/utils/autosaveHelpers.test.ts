import { renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createPayloadBuilder, useLatestValue, validatePayload } from './autosaveHelpers';

describe('autosaveHelpers', () => {
  describe('useLatestValue', () => {
    it('should keep ref in sync with value', () => {
      const { result, rerender } = renderHook(({ value }) => useLatestValue(value), {
        initialProps: { value: 'initial' },
      });

      expect(result.current.current).toBe('initial');

      // Update value
      rerender({ value: 'updated' });
      expect(result.current.current).toBe('updated');

      // Update again
      rerender({ value: 'final' });
      expect(result.current.current).toBe('final');
    });

    it('should work with objects', () => {
      const { result, rerender } = renderHook(({ value }) => useLatestValue(value), {
        initialProps: { value: { name: 'John', age: 30 } },
      });

      expect(result.current.current).toEqual({ name: 'John', age: 30 });

      rerender({ value: { name: 'Jane', age: 25 } });
      expect(result.current.current).toEqual({ name: 'Jane', age: 25 });
    });
  });

  describe('validatePayload', () => {
    beforeEach(() => {
      // Set NODE_ENV to 'development' so validatePayload runs
      vi.stubEnv('NODE_ENV', 'development');
      vi.spyOn(console, 'error').mockImplementation(() => {});
      vi.spyOn(console, 'warn').mockImplementation(() => {});
    });

    afterEach(() => {
      vi.restoreAllMocks();
      vi.unstubAllEnvs();
    });

    it('should not log errors when all fields are present', () => {
      const payload = {
        formId: '123',
        name: 'John',
        email: 'john@example.com',
      };

      validatePayload(payload, ['formId', 'name', 'email'], 'test');

      expect(console.error).not.toHaveBeenCalled();
      expect(console.warn).not.toHaveBeenCalled();
    });

    it('should log error for missing fields', () => {
      // biome-ignore lint/suspicious/noExplicitAny: Test requires intentionally incomplete payload
      const payload = {
        formId: '123',
        name: 'John',
      } as any;

      validatePayload(payload, ['formId', 'name', 'email'], 'test');

      expect(console.error).toHaveBeenCalledWith(
        expect.stringContaining('[test] Missing required fields'),
        ['email'],
        expect.any(String),
        expect.any(Array)
      );
    });

    it('should log warning for undefined fields', () => {
      const payload = {
        formId: '123',
        name: 'John',
        email: undefined,
      };

      validatePayload(payload, ['formId', 'name', 'email'], 'test');

      expect(console.warn).toHaveBeenCalledWith(
        expect.stringContaining('[test] Fields are undefined'),
        ['email']
      );
    });

    it('should log warning for null fields', () => {
      const payload = {
        formId: '123',
        name: 'John',
        email: null,
      };

      validatePayload(payload, ['formId', 'name', 'email'], 'test');

      expect(console.warn).toHaveBeenCalledWith(expect.stringContaining('[test] Fields are null'), [
        'email',
      ]);
    });
  });

  describe('createPayloadBuilder', () => {
    it('should build payload from refs', () => {
      const nameRef = { current: 'John' };
      const emailRef = { current: 'john@example.com' };
      const ageRef = { current: 30 };

      const refs = { name: nameRef, email: emailRef, age: ageRef };
      const buildPayload = createPayloadBuilder(refs, { formId: '123' });

      const payload = buildPayload(['name', 'email', 'age']);

      expect(payload).toEqual({
        formId: '123',
        name: 'John',
        email: 'john@example.com',
        age: 30,
      });
    });

    it('should only include specified fields', () => {
      const nameRef = { current: 'John' };
      const emailRef = { current: 'john@example.com' };
      const ageRef = { current: 30 };

      const refs = { name: nameRef, email: emailRef, age: ageRef };
      const buildPayload = createPayloadBuilder(refs, { formId: '123' });

      const payload = buildPayload(['name', 'email']);

      expect(payload).toEqual({
        formId: '123',
        name: 'John',
        email: 'john@example.com',
      });
      expect(payload).not.toHaveProperty('age');
    });

    it('should work with updated ref values', () => {
      const nameRef = { current: 'John' };
      const emailRef = { current: 'john@example.com' };

      const refs = { name: nameRef, email: emailRef };
      const buildPayload = createPayloadBuilder(refs, { formId: '123' });

      // First call
      let payload = buildPayload(['name', 'email']);
      expect(payload.name).toBe('John');

      // Update ref
      nameRef.current = 'Jane';

      // Second call should use updated value
      payload = buildPayload(['name', 'email']);
      expect(payload.name).toBe('Jane');
    });
  });
});
