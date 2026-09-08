import Header from '@/components/header';
import Footer from '@/components/footer';
import CartDrawer from '@/components/cart-drawer';
import { CartDrawerProvider } from '@/context/cart-drawer-context';

export default function ShopLayout({ children }: { children: React.ReactNode }) {
  return (
    <CartDrawerProvider>
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
        <CartDrawer />
      </div>
    </CartDrawerProvider>
  );
}