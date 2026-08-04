'use client';

import { useState } from 'react';
import { api } from '@/lib/api'; // Ensure this points to your configured axios instance
import { useRouter } from 'next/navigation';

export default function CheckoutPage() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleMockPayment = async () => {
    setLoading(true);
    try {
      // This request will automatically send the HttpOnly cookie thanks to withCredentials: true
      const response = await api.post('/orders/checkout');
      alert(`Order ${response.data.order_id} completed successfully!`);
      router.push('/'); // Redirect to home or order history page
    } catch (error: any) {
      console.error('Checkout failed:', error);
      alert(error.response?.data?.detail || 'Checkout failed. Is your cart empty?');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Checkout</h1>
      <p className="mb-6 text-gray-600">
        Local mock checkout. No real payment will be processed.
        Ensure you have items in your cart before proceeding.
      </p>
      <button
        onClick={handleMockPayment}
        disabled={loading}
        className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
      >
        {loading ? 'Processing...' : 'Pay Now (Mock)'}
      </button>
    </div>
  );
}