// utils/searchHistoryStorage.ts

const STORAGE_KEY = 'recent_searches';
const MAX_ITEMS = 8;

// In-memory fallback if localStorage is blocked or unavailable
let memoryFallback: string[] = [];

function isStorageAvailable(): boolean {
    if (typeof window === 'undefined') return false;
    try {
        const testKey = '__storage_test__';
        window.localStorage.setItem(testKey, testKey);
        window.localStorage.removeItem(testKey);
        return true;
    } catch {
        return false;
    }
}

const hasStorage = isStorageAvailable();

export const searchHistoryStorage = {
    get: (): string[] => {
        if (!hasStorage) return [...memoryFallback];

        try {
            const raw = window.localStorage.getItem(STORAGE_KEY);
            return raw ? (JSON.parse(raw) as string[]) : [];
        } catch {
            return [...memoryFallback];
        }
    },

    add: (query: string): string[] => {
        const cleanQuery = query.trim();
        if (!cleanQuery) return searchHistoryStorage.get();

        const existing = searchHistoryStorage.get();
        // Deduplicate and keep newest at the beginning
        const updated = [cleanQuery, ...existing.filter((item) => item !== cleanQuery)].slice(0, MAX_ITEMS);

        if (!hasStorage) {
            memoryFallback = updated;
            return updated;
        }

        try {
            window.localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        } catch {
            // Quota exceeded or restricted mid-session; switch to memory
            memoryFallback = updated;
        }

        return updated;
    },

    remove: (query: string): string[] => {
        const existing = searchHistoryStorage.get();
        const updated = existing.filter((item) => item !== query);

        if (!hasStorage) {
            memoryFallback = updated;
            return updated;
        }

        try {
            window.localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        } catch {
            memoryFallback = updated;
        }

        return updated;
    },

    clear: (): void => {
        memoryFallback = [];
        if (hasStorage) {
            try {
                window.localStorage.removeItem(STORAGE_KEY);
            } catch {
                // No-op
            }
        }
    },
};