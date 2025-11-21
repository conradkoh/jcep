/**
 * Hook for managing token-based authentication for review forms.
 * Stores and retrieves access tokens from localStorage.
 */

import { useCallback, useEffect, useState } from 'react';

const TOKEN_STORAGE_KEY = 'jcep_review_token';

export interface TokenAuthState {
  token: string | null;
  isLoading: boolean;
}

export function useTokenAuth() {
  const [state, setState] = useState<TokenAuthState>({
    token: null,
    isLoading: true,
  });

  // Load token from localStorage on mount
  useEffect(() => {
    const storedToken = localStorage.getItem(TOKEN_STORAGE_KEY);
    setState({
      token: storedToken,
      isLoading: false,
    });
  }, []);

  // Store token in localStorage
  const setToken = useCallback((token: string | null) => {
    if (token) {
      localStorage.setItem(TOKEN_STORAGE_KEY, token);
    } else {
      localStorage.removeItem(TOKEN_STORAGE_KEY);
    }
    setState({
      token,
      isLoading: false,
    });
  }, []);

  // Clear token from localStorage
  const clearToken = useCallback(() => {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    setState({
      token: null,
      isLoading: false,
    });
  }, []);

  return {
    token: state.token,
    isLoading: state.isLoading,
    setToken,
    clearToken,
  };
}
