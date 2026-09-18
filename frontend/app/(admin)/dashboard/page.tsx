// frontend/app/(admin)/dashboard/page.tsx
'use client';

import Link from 'next/link';
import { useAdminAnalytics } from '@/hooks/use-admin-analytics';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { TrendingUp, Clock, Users, ArrowUpLeft } from 'lucide-react';

function formatToman(n: number) {
  return new Intl.NumberFormat('fa-IR').format(n);
}

export default function AdminDashboardPage() {
  const { data, isLoading } = useAdminAnalytics();

  if (isLoading || !data) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-40 animate-pulse rounded-lg bg-muted/60" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-2xl bg-white/60 border border-[#E8E2D1]" />
          ))}
        </div>
      </div>
    );
  }

  const kpis = [
    {
      label: 'درآمد فروش امروز',
      value: `${formatToman(data.revenue_today)} تومان`,
      icon: TrendingUp,
      accent: true,
    },
    {
      label: 'درآمد هفت روز گذشته',
      value: `${formatToman(data.revenue_week)} تومان`,
      icon: TrendingUp,
      accent: false,
    },
    {
      label: 'درآمد ۳۰ روز اخیر',
      value: `${formatToman(data.revenue_month)} تومان`,
      icon: TrendingUp,
      accent: false,
    },
    {
      label: 'سفارش‌های در انتظار بررسی',
      value: `${data.pending_orders} سفارش`,
      icon: Clock,
      highlight: data.pending_orders > 0,
      accent: false,
    },
    {
      label: 'مشتریان ثبت‌شده',
      value: `${data.total_customers} حساب کاربری`,
      icon: Users,
      accent: false,
    },
  ];

  return (
    <div className="space-y-8 select-none">
      {/* Title Banner */}
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <span className="text-[10px] font-semibold uppercase tracking-widest text-accent">
            مرکز کنترل و فروش
          </span>
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            داشبورد مدیریت آتلیه
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/dashboard/orders"
            className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-accent/40 bg-accent/10 px-3.5 text-xs font-semibold text-accent transition-all hover:bg-accent/20"
          >
            <span>بررسی سفارش‌ها</span>
            <ArrowUpLeft className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>

      {/* Metric KPI Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {kpis.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <Card
              key={kpi.label}
              className={`relative overflow-hidden rounded-2xl border transition-all duration-300 hover:shadow-md ${kpi.accent
                  ? 'border-accent/40 bg-gradient-to-b from-white via-white to-accent/5 ring-1 ring-accent/20'
                  : 'border-[#E8E2D1] bg-white/80 backdrop-blur-md'
                }`}
            >
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-xs font-medium text-muted-foreground">
                  {kpi.label}
                </CardTitle>
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-lg ${kpi.accent
                      ? 'bg-accent text-white shadow-2xs'
                      : kpi.highlight
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-muted/60 text-muted-foreground'
                    }`}
                >
                  <Icon className="h-4 w-4" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-xl font-bold tracking-tight text-foreground sm:text-2xl font-mono">
                  {kpi.value}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Quick Administrative Links */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <Link
          href="/dashboard/home-sections"
          className="group flex items-center justify-between rounded-2xl border border-[#E8E2D1] bg-white/70 p-4 transition-all hover:border-accent hover:bg-white hover:shadow-sm"
        >
          <div>
            <h3 className="text-xs font-bold text-foreground group-hover:text-accent">چیدمان ریل‌های صفحه نخست</h3>
            <p className="mt-1 text-[11px] text-muted-foreground">مدیریت اسلایدرها و دسته‌بندی‌های صفحه اول</p>
          </div>
          <ArrowUpLeft className="h-4 w-4 text-muted-foreground group-hover:text-accent" />
        </Link>

        <Link
          href="/dashboard/trust-badges"
          className="group flex items-center justify-between rounded-2xl border border-[#E8E2D1] bg-white/70 p-4 transition-all hover:border-accent hover:bg-white hover:shadow-sm"
        >
          <div>
            <h3 className="text-xs font-bold text-foreground group-hover:text-accent">ستون‌های اعتماد و اصالت</h3>
            <p className="mt-1 text-[11px] text-muted-foreground">تغییر نشان‌ها، گارانتی و ارسال سراسری</p>
          </div>
          <ArrowUpLeft className="h-4 w-4 text-muted-foreground group-hover:text-accent" />
        </Link>

        <Link
          href="/dashboard/settings"
          className="group flex items-center justify-between rounded-2xl border border-[#E8E2D1] bg-white/70 p-4 transition-all hover:border-accent hover:bg-white hover:shadow-sm"
        >
          <div>
            <h3 className="text-xs font-bold text-foreground group-hover:text-accent">تنظیمات فروشگاه و فوتر</h3>
            <p className="mt-1 text-[11px] text-muted-foreground">ویرایش اطلاعات تماس، بایو و متن‌های پایانی</p>
          </div>
          <ArrowUpLeft className="h-4 w-4 text-muted-foreground group-hover:text-accent" />
        </Link>
      </div>
    </div>
  );
}