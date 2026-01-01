'use client';

import React, { createContext, useContext, ReactNode, useMemo, useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { User, Session } from '@supabase/supabase-js';

interface SupabaseContextState {
    user: User | null;
    session: Session | null;
    isUserLoading: boolean;
    userError: Error | null;
}

export const SupabaseContext = createContext<SupabaseContextState | undefined>(undefined);

export const SupabaseProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [state, setState] = useState<SupabaseContextState>({
        user: null,
        session: null,
        isUserLoading: true,
        userError: null,
    });

    useEffect(() => {
        // Initial fetch
        supabase.auth.getSession().then(({ data: { session }, error }) => {
            setState(prev => ({
                ...prev,
                session,
                user: session?.user ?? null,
                isUserLoading: false,
                userError: error as Error | null,
            }));
        });

        // Listen for changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setState(prev => ({
                ...prev,
                session,
                user: session?.user ?? null,
                isUserLoading: false,
            }));
        });

        return () => {
            subscription.unsubscribe();
        };
    }, []);

    const value = useMemo(() => state, [state]);

    return (
        <SupabaseContext.Provider value={value}>
            {children}
        </SupabaseContext.Provider>
    );
};

export const useSupabaseUser = () => {
    const context = useContext(SupabaseContext);
    if (context === undefined) {
        throw new Error('useSupabaseUser must be used within a SupabaseProvider.');
    }
    return context;
};

// For backward compatibility during migration
export const useUser = useSupabaseUser;
