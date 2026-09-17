// hooks/useSearchHistory.ts
'use client';

import { useState, useEffect } from 'react';
import { searchHistoryStorage } from '@/lib/search-history';
export function useSearchHistory() {
    const [history, setHistory] = useState<string[]>([]);

    // Hydrate on mount to avoid Next.js SSR hydration mismatches
    useEffect(() => {
        setHistory(searchHistoryStorage.get());
    }, []);

    const addSearch = (term: string) => {
        const updated = searchHistoryStorage.add(term);
        setHistory(updated);
    };

    const removeSearch = (term: string) => {
        const updated = searchHistoryStorage.remove(term);
        setHistory(updated);
    };

    const clearAll = () => {
        searchHistoryStorage.clear();
        setHistory([]);
    };

    return { history, addSearch, removeSearch, clearAll };
}