// frontend/hooks/use-admin-storefront.ts
'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { TrustBadgeItem } from '@/types';

// ── 1. Home Sections Types & Hooks ──
export interface AdminHomeSection {
    id: number;
    title: string;
    subtitle?: string | null;
    section_type: string;
    category_id?: number | null;
    tag_id?: number | null;
    sort_order: number;
    is_active: boolean;
    view_all_href: string;
}

export function useAdminHomeSections() {
    return useQuery({
        queryKey: ['admin-home-sections'],
        queryFn: async () => {
            const { data } = await api.get<AdminHomeSection[]>('/home-sections/');
            return data;
        },
    });
}

export function useCreateHomeSection() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: async (payload: Partial<AdminHomeSection>) => {
            const { data } = await api.post<AdminHomeSection>('/home-sections/', payload);
            return data;
        },
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['admin-home-sections'] });
            qc.invalidateQueries({ queryKey: ['home-sections-feed'] });
        },
    });
}

export function useUpdateHomeSection() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, payload }: { id: number; payload: Partial<AdminHomeSection> }) => {
            const { data } = await api.patch<AdminHomeSection>(`/home-sections/${id}`, payload);
            return data;
        },
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['admin-home-sections'] });
            qc.invalidateQueries({ queryKey: ['home-sections-feed'] });
        },
    });
}

export function useDeleteHomeSection() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: async (id: number) => {
            await api.delete(`/home-sections/${id}`);
        },
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['admin-home-sections'] });
            qc.invalidateQueries({ queryKey: ['home-sections-feed'] });
        },
    });
}

// ── 2. Trust Badges Hooks ──
export function useAdminTrustBadges() {
    return useQuery({
        queryKey: ['admin-trust-badges'],
        queryFn: async () => {
            const { data } = await api.get<TrustBadgeItem[]>('/trust-badges/');
            return data;
        },
    });
}

export function useCreateTrustBadge() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: async (payload: Partial<TrustBadgeItem>) => {
            const { data } = await api.post<TrustBadgeItem>('/trust-badges/', payload);
            return data;
        },
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['admin-trust-badges'] });
        },
    });
}

export function useUpdateTrustBadge() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, payload }: { id: number; payload: Partial<TrustBadgeItem> }) => {
            const { data } = await api.patch<TrustBadgeItem>(`/trust-badges/${id}`, payload);
            return data;
        },
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['admin-trust-badges'] });
        },
    });
}

export function useDeleteTrustBadge() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: async (id: number) => {
            await api.delete(`/trust-badges/${id}`);
        },
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['admin-trust-badges'] });
        },
    });
}

// ── 3. Site Settings Hooks ──
export interface SiteSettingsData {
    site_title?: string;
    tagline?: string;
    bio?: string;
    phone?: string;
    email?: string;
    instagram_handle?: string;
    telegram_handle?: string;
    address?: string;
    support_hours?: string;
}

export function useAdminSiteSettings() {
    return useQuery({
        queryKey: ['admin-site-settings'],
        queryFn: async () => {
            const { data } = await api.get<SiteSettingsData>('/settings/');
            return data;
        },
    });
}

export function useUpdateSiteSettings() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: async (payload: SiteSettingsData) => {
            const { data } = await api.put<SiteSettingsData>('/settings/', payload);
            return data;
        },
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['admin-site-settings'] });
        },
    });
}