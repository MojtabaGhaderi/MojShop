'use client';

import { useAdminAnalytics } from '@/hooks/use-admin-analytics';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

function toman(n: number) {
  return new Intl.NumberFormat('fa-IR').format(n);
}

export default function AdminDashboardPage() {
  const { data, isLoading } = useAdminAnalytics();

  if (isLoading || !data) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-28 rounded-lg" />)}
      </div>
    );
  }

  const cards = [
    { label: 'درآمد امروز', value: `${toman(data.revenue_today)} تومان` },
    { label: 'درآمد این هفته', value: `${toman(data.revenue_week)} تومان` },
    { label: 'درآمد این ماه', value: `${toman(data.revenue_month)} تومان` },
    { label: 'سفارش‌های در انتظار', value: data.pending_orders },
    { label: 'تعداد مشتریان', value: data.total_customers },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold">داشبورد</h1>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => (
          <Card key={c.label}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-normal text-muted-foreground">{c.label}</CardTitle>
            </CardHeader>
            <CardContent className="text-2xl font-semibold">{c.value}</CardContent>
          </Card>
        ))}
      </div>

      {data.low_stock_products.length > 0 && (
        <Card>
          <CardHeader><CardTitle className="text-base">موجودی کم (کمتر از {data.low_stock_threshold})</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {data.low_stock_products.map((p) => (
              <div key={p.id} className="flex items-center justify-between text-sm">
                <span>{p.name}</span>
                <Badge variant="destructive">{p.stock_quantity} عدد</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

