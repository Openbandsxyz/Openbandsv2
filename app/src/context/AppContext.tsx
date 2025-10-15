"use client";
import React, { createContext, useContext, useState, useCallback, type PropsWithChildren } from 'react';

interface AppState {
  isAuthenticated: boolean;
  anonymousId: string | null;
  companyDomain: string | null;
}

interface AppContextValue extends AppState {
  signIn: (domain: string) => void;
  signOut: () => void;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: PropsWithChildren) {
  const [state, setState] = useState<AppState>(() => {
    // Initialize state from localStorage if available
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('app-auth-state');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {
          // If parsing fails, use default state
        }
      }
    }
    return {
      isAuthenticated: false,
      anonymousId: null,
      companyDomain: null,
    };
  });

  const signIn = useCallback((domain: string) => {
    // Generate a random 6-character anonymous ID
    const anonymousId = Math.random().toString(36).substring(2, 8).toUpperCase();
    
    // For now, we'll use a placeholder company domain
    // Later this will be replaced with ZK proof verification
    const companyDomain = domain;

    const newState = {
      isAuthenticated: true,
      anonymousId,
      companyDomain,
    };

    setState(newState);
    
    // Persist to localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('app-auth-state', JSON.stringify(newState));
    }
  }, []);

  const signOut = useCallback(() => {
    const newState = {
      isAuthenticated: false,
      anonymousId: null,
      companyDomain: null,
    };

    setState(newState);
    
    // Clear from localStorage
    if (typeof window !== 'undefined') {
      localStorage.removeItem('app-auth-state');
    }
  }, []);

  const value: AppContextValue = {
    ...state,
    signIn,
    signOut,
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp(): AppContextValue {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
