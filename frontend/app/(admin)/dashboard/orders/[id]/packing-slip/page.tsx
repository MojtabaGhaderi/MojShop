'use client';

import { useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useAdminOrder } from '@/hooks/use-admin-orders';

export default function PackingSlipPage() {
    const { id } = useParams<{ id: string }>();
    const { data: order, isLoading } = useAdminOrder(Number(id));

    useEffect(() => {
        if (order) {
            const timer = setTimeout(() => window.print(), 300);
            return () => clearTimeout(timer);
        }
    }, [order]);

    if (isLoading || !order) return <div className="p-8 text-center">در حال بارگذاری...</div>;

    return (
        <div className="mx-auto max-w-2xl p-8">
            <style jsx global>{`@media print { nav, aside, header, footer { display: none !important; } }`}</style>
            <h1 className="mb-1 text-lg font-bold">موج گالری — برگه بسته‌بندی</h1>
            <p className="mb-6 text-sm text-muted-foreground">سفارش #{order.id}</p>
            <div className="mb-6">
                <p className="font-medium">ارسال به:</p>
                <p>{order.address.line_1}{order.address.line_2 ? `، ${order.address.line_2}` : ''}</p>
                <p>{order.address.city}، {order.address.postal_code}</p>
            </div>
            <table className="w-full border-collapse text-sm">
                <thead><tr className="border-b text-right"><th className="py-2">کالا</th><th className="py-2">تعداد</th></tr></thead>
                <tbody>
                    {order.items.map((item) => (
                        <tr key={item.id} className="border-b"><td className="py-2">{item.product_name}</td><td className="py-2">{item.quantity}</td></tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}