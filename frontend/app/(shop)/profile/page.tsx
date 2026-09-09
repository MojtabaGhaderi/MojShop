//profile/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { useProfile, useAddresses } from '@/hooks/use-profile';
import type { Address, AddressCreate } from '@/types';
import { AxiosError } from 'axios';
import WishlistSection from '@/components/wishlist-section';

function errorDetail(err: unknown): string {
    if (err instanceof AxiosError) {
        const d = err.response?.data?.detail;
        if (typeof d === 'string') return d;
        if (Array.isArray(d)) return d.map((x) => x.msg ?? JSON.stringify(x)).join(', ');
    }
    if (err instanceof Error) return err.message;
    return 'خطایی رخ داد';
}

const emptyAddress = (): AddressCreate => ({
    label: '',
    line_1: '',
    line_2: '',
    city: '',
    postal_code: '',
    country: 'Iran',
    is_default: false,
});

export default function ProfilePage() {
    const router = useRouter();
    const { isAuthenticated, isLoading: authLoading } = useAuth();
    const { profile, isLoading, updateProfile, isUpdating, updateError } = useProfile();
    const {
        addresses,
        createAddress,
        updateAddress,
        deleteAddress,
        isCreating,
    } = useAddresses();

    const [form, setForm] = useState({ full_name: '', phone: '', email: '' });
    const [passwordForm, setPasswordForm] = useState({
        current_password: '',
        new_password: '',
    });
    const [message, setMessage] = useState<string | null>(null);
    const [showAddressForm, setShowAddressForm] = useState(false);
    const [editingAddress, setEditingAddress] = useState<Address | null>(null);
    const [addressForm, setAddressForm] = useState<AddressCreate>(emptyAddress());
    const [addressError, setAddressError] = useState<string | null>(null);

    useEffect(() => {
        if (!authLoading && !isAuthenticated) {
            router.replace('/login');
        }
    }, [authLoading, isAuthenticated, router]);

    useEffect(() => {
        if (profile) {
            setForm({
                full_name: profile.full_name ?? '',
                phone: profile.phone ?? '',
                email: profile.email,
            });
        }
    }, [profile]);

    if (authLoading || isLoading || !profile) {
        return (
            <div className="mx-auto max-w-2xl px-4 py-12">
                <div className="h-8 w-48 animate-pulse rounded bg-surface-elevated" />
                <div className="mt-6 space-y-4">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="h-10 animate-pulse rounded bg-surface-elevated" />
                    ))}
                </div>
            </div>
        );
    }

    async function handleProfileSubmit(e: React.FormEvent) {
        e.preventDefault();
        setMessage(null);
        try {
            await updateProfile({
                full_name: form.full_name || undefined,
                phone: form.phone || undefined,
                email: form.email !== profile!.email ? form.email : undefined,
            });
            setMessage('اطلاعات با موفقیت ذخیره شد');
        } catch {
            // updateError shown below
        }
    }

    async function handlePasswordSubmit(e: React.FormEvent) {
        e.preventDefault();
        setMessage(null);
        try {
            await updateProfile({
                current_password: passwordForm.current_password,
                new_password: passwordForm.new_password,
            });
            setPasswordForm({ current_password: '', new_password: '' });
            setMessage('رمز عبور با موفقیت تغییر کرد');
        } catch {
            // updateError
        }
    }

    async function handleAddressSubmit(e: React.FormEvent) {
        e.preventDefault();
        setAddressError(null);
        try {
            if (editingAddress) {
                await updateAddress({ id: editingAddress.id, ...addressForm });
            } else {
                await createAddress(addressForm);
            }
            setShowAddressForm(false);
            setEditingAddress(null);
            setAddressForm(emptyAddress());
        } catch (err) {
            setAddressError(errorDetail(err));
        }
    }

    function startEditAddress(addr: Address) {
        setEditingAddress(addr);
        setAddressForm({
            label: addr.label ?? '',
            line_1: addr.line_1,
            line_2: addr.line_2 ?? '',
            city: addr.city,
            postal_code: addr.postal_code,
            country: addr.country,
            is_default: addr.is_default,
        });
        setShowAddressForm(true);
        setAddressError(null);
    }

    return (
        <div className="mx-auto max-w-2xl px-4 py-8 sm:py-12">
            <h1 className="text-2xl font-bold text-primary">پروفایل کاربری</h1>

            {message && (
                <p className="mt-4 rounded-lg bg-green-500/10 px-4 py-2 text-sm text-green-600">
                    {message}
                </p>
            )}
            {updateError && (
                <p className="mt-4 rounded-lg bg-red-500/10 px-4 py-2 text-sm text-red-500">
                    {errorDetail(updateError)}
                </p>
            )}

            {/* Personal info */}
            <section className="mt-8 rounded-xl border border-border-default bg-surface p-5">
                <h2 className="text-lg font-semibold text-primary">اطلاعات شخصی</h2>
                <form onSubmit={handleProfileSubmit} className="mt-4 space-y-4">
                    <div>
                        <label className="block text-sm text-primary-subtle">نام کامل</label>
                        <input
                            type="text"
                            value={form.full_name}
                            onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                            className="mt-1 w-full rounded-lg border border-border-default bg-surface px-3 py-2 text-primary"
                        />
                    </div>
                    <div>
                        <label className="block text-sm text-primary-subtle">ایمیل</label>
                        <input
                            type="email"
                            value={form.email}
                            onChange={(e) => setForm({ ...form, email: e.target.value })}
                            className="mt-1 w-full rounded-lg border border-border-default bg-surface px-3 py-2 text-primary"
                        />
                    </div>
                    <div>
                        <label className="block text-sm text-primary-subtle">شماره موبایل</label>
                        <input
                            type="tel"
                            value={form.phone}
                            onChange={(e) => setForm({ ...form, phone: e.target.value })}
                            className="mt-1 w-full rounded-lg border border-border-default bg-surface px-3 py-2 text-primary"
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={isUpdating}
                        className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
                    >
                        {isUpdating ? 'در حال ذخیره...' : 'ذخیره تغییرات'}
                    </button>
                </form>
            </section>

            {/* Password */}
            <section className="mt-6 rounded-xl border border-border-default bg-surface p-5">
                <h2 className="text-lg font-semibold text-primary">تغییر رمز عبور</h2>
                <form onSubmit={handlePasswordSubmit} className="mt-4 space-y-4">
                    <div>
                        <label className="block text-sm text-primary-subtle">رمز فعلی</label>
                        <input
                            type="password"
                            required
                            value={passwordForm.current_password}
                            onChange={(e) =>
                                setPasswordForm({ ...passwordForm, current_password: e.target.value })
                            }
                            className="mt-1 w-full rounded-lg border border-border-default bg-surface px-3 py-2 text-primary"
                        />
                    </div>
                    <div>
                        <label className="block text-sm text-primary-subtle">رمز جدید</label>
                        <input
                            type="password"
                            required
                            minLength={6}
                            value={passwordForm.new_password}
                            onChange={(e) =>
                                setPasswordForm({ ...passwordForm, new_password: e.target.value })
                            }
                            className="mt-1 w-full rounded-lg border border-border-default bg-surface px-3 py-2 text-primary"
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={isUpdating}
                        className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
                    >
                        تغییر رمز
                    </button>
                </form>
            </section>
            {/* Wishlist */}
            <section className="mt-6 rounded-xl border border-border-default bg-surface p-5">
                <h2 className="text-lg font-semibold text-primary">علاقه‌مندی‌ها</h2>
                <WishlistSection />
            </section>
            {/* Addresses */}
            <section className="mt-6 rounded-xl border border-border-default bg-surface p-5">
                <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-primary">آدرس‌ها</h2>
                    <button
                        type="button"
                        onClick={() => {
                            setEditingAddress(null);
                            setAddressForm(emptyAddress());
                            setShowAddressForm(true);
                            setAddressError(null);
                        }}
                        className="text-sm font-medium text-accent hover:underline"
                    >
                        + افزودن آدرس
                    </button>
                </div>

                {addresses.length === 0 && !showAddressForm && (
                    <p className="mt-4 text-sm text-primary-muted">هنوز آدرسی ثبت نشده است.</p>
                )}

                <ul className="mt-4 space-y-3">
                    {addresses.map((addr) => (
                        <li
                            key={addr.id}
                            className="flex items-start justify-between gap-3 rounded-lg border border-border-default p-3"
                        >
                            <div className="min-w-0">
                                <p className="font-medium text-primary">
                                    {addr.label || 'آدرس'}{' '}
                                    {addr.is_default && (
                                        <span className="ms-2 rounded bg-accent/15 px-1.5 py-0.5 text-xs text-accent">
                                            پیش‌فرض
                                        </span>
                                    )}
                                </p>
                                <p className="mt-1 text-sm text-primary-muted">
                                    {addr.line_1}
                                    {addr.line_2 ? `، ${addr.line_2}` : ''}
                                </p>
                                <p className="text-sm text-primary-muted">
                                    {addr.city} — {addr.postal_code} — {addr.country}
                                </p>
                            </div>
                            <div className="flex shrink-0 flex-col gap-1 text-left sm:flex-row sm:gap-2">
                                <button
                                    type="button"
                                    onClick={() => startEditAddress(addr)}
                                    className="text-xs text-accent hover:underline"
                                >
                                    ویرایش
                                </button>
                                {!addr.is_default && (
                                    <button
                                        type="button"
                                        onClick={() => updateAddress({ id: addr.id, is_default: true })}
                                        className="text-xs text-primary-muted hover:underline"
                                    >
                                        پیش‌فرض
                                    </button>
                                )}
                                <button
                                    type="button"
                                    onClick={() => deleteAddress(addr.id)}
                                    className="text-xs text-red-500 hover:underline"
                                >
                                    حذف
                                </button>
                            </div>
                        </li>
                    ))}
                </ul>

                {showAddressForm && (
                    <form
                        onSubmit={handleAddressSubmit}
                        className="mt-6 space-y-3 border-t border-border-default pt-4"
                    >
                        <h3 className="font-medium text-primary">
                            {editingAddress ? 'ویرایش آدرس' : 'آدرس جدید'}
                        </h3>
                        {addressError && (
                            <p className="text-sm text-red-500">{addressError}</p>
                        )}
                        <input
                            placeholder="برچسب (خانه، محل کار...)"
                            value={addressForm.label ?? ''}
                            onChange={(e) => setAddressForm({ ...addressForm, label: e.target.value })}
                            className="w-full rounded-lg border border-border-default bg-surface px-3 py-2 text-sm text-primary"
                        />
                        <input
                            required
                            placeholder="آدرس خط ۱"
                            value={addressForm.line_1}
                            onChange={(e) => setAddressForm({ ...addressForm, line_1: e.target.value })}
                            className="w-full rounded-lg border border-border-default bg-surface px-3 py-2 text-sm text-primary"
                        />
                        <input
                            placeholder="آدرس خط ۲ (اختیاری)"
                            value={addressForm.line_2 ?? ''}
                            onChange={(e) => setAddressForm({ ...addressForm, line_2: e.target.value })}
                            className="w-full rounded-lg border border-border-default bg-surface px-3 py-2 text-sm text-primary"
                        />
                        <div className="grid grid-cols-2 gap-3">
                            <input
                                required
                                placeholder="شهر"
                                value={addressForm.city}
                                onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                                className="rounded-lg border border-border-default bg-surface px-3 py-2 text-sm text-primary"
                            />
                            <input
                                required
                                placeholder="کد پستی"
                                value={addressForm.postal_code}
                                onChange={(e) =>
                                    setAddressForm({ ...addressForm, postal_code: e.target.value })
                                }
                                className="rounded-lg border border-border-default bg-surface px-3 py-2 text-sm text-primary"
                            />
                        </div>
                        <label className="flex items-center gap-2 text-sm text-primary">
                            <input
                                type="checkbox"
                                checked={!!addressForm.is_default}
                                onChange={(e) =>
                                    setAddressForm({ ...addressForm, is_default: e.target.checked })
                                }
                            />
                            آدرس پیش‌فرض
                        </label>
                        <div className="flex gap-2">
                            <button
                                type="submit"
                                disabled={isCreating}
                                className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
                            >
                                {editingAddress ? 'ذخیره' : 'افزودن'}
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    setShowAddressForm(false);
                                    setEditingAddress(null);
                                }}
                                className="rounded-lg border border-border-default px-4 py-2 text-sm text-primary"
                            >
                                انصراف
                            </button>
                        </div>
                    </form>
                )}
            </section>
        </div>
    );
}