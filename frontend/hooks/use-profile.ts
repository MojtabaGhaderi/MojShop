'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { AuthUser, UserUpdate, Address, AddressCreate, AddressUpdate } from '@/types';

const PROFILE_KEY = 'profile';
const ADDRESSES_KEY = 'addresses';

export function useProfile() {
    const queryClient = useQueryClient();

    const profileQuery = useQuery<AuthUser>({
        queryKey: [PROFILE_KEY],
        queryFn: async () => {
            const { data } = await api.get<AuthUser>('/profile/');
            return data;
        },
        staleTime: 60_000,
        enabled: typeof window !== 'undefined' && !!localStorage.getItem('auth_token'),
    });

    const updateMutation = useMutation({
        mutationFn: async (payload: UserUpdate) => {
            const { data } = await api.put<AuthUser>('/profile/', payload);
            return data;
        },
        onSuccess: (data) => {
            queryClient.setQueryData([PROFILE_KEY], data);
            // Keep header / useAuth in sync
            queryClient.setQueryData(['auth', 'me'], data);
            queryClient.invalidateQueries({ queryKey: ['auth'] });
        },
    });

    return {
        profile: profileQuery.data,
        isLoading: profileQuery.isLoading,
        error: profileQuery.error,
        updateProfile: updateMutation.mutateAsync,
        isUpdating: updateMutation.isPending,
        updateError: updateMutation.error,
    };
}

export function useAddresses() {
    const queryClient = useQueryClient();

    const listQuery = useQuery<Address[]>({
        queryKey: [ADDRESSES_KEY],
        queryFn: async () => {
            const { data } = await api.get<Address[]>('/profile/addresses/');
            return data;
        },
        enabled: typeof window !== 'undefined' && !!localStorage.getItem('auth_token'),
    });

    const createMutation = useMutation({
        mutationFn: async (payload: AddressCreate) => {
            const { data } = await api.post<Address>('/profile/addresses/', payload);
            return data;
        },
        onSuccess: () => queryClient.invalidateQueries({ queryKey: [ADDRESSES_KEY] }),
    });

    const updateMutation = useMutation({
        mutationFn: async ({ id, ...payload }: AddressUpdate & { id: number }) => {
            const { data } = await api.put<Address>(`/profile/addresses/${id}`, payload);
            return data;
        },
        onSuccess: () => queryClient.invalidateQueries({ queryKey: [ADDRESSES_KEY] }),
    });

    const deleteMutation = useMutation({
        mutationFn: async (id: number) => {
            await api.delete(`/profile/addresses/${id}`);
        },
        onSuccess: () => queryClient.invalidateQueries({ queryKey: [ADDRESSES_KEY] }),
    });

    return {
        addresses: listQuery.data ?? [],
        isLoading: listQuery.isLoading,
        createAddress: createMutation.mutateAsync,
        updateAddress: updateMutation.mutateAsync,
        deleteAddress: deleteMutation.mutateAsync,
        isCreating: createMutation.isPending,
        isUpdating: updateMutation.isPending,
        isDeleting: deleteMutation.isPending,
    };
}