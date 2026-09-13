import Link from 'next/link';
import { SITE_NAME, NAV_LINKS } from '@/lib/constants';

export default function Footer() {
  return (
    <footer className="mt-auto bg-primary text-surface">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <h2 className="text-sm font-medium tracking-[0.15em] text-accent">{SITE_NAME}</h2>
            <p className="mt-3 text-sm leading-relaxed text-surface/50">
              فروشگاه آنلاین جواهرات و اکسسوری با ضمانت اصالت کالا و بهترین قیمت روز.
            </p>
          </div>

          <div>
            <h3 className="text-xs font-medium tracking-wide text-surface/70">دسترسی سریع</h3>
            <ul className="mt-3 space-y-2">
              {NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-surface/50 transition-colors hover:text-accent">{link.label}</Link>
                </li>
              ))}
              <li><Link href="/cart" className="text-sm text-surface/50 transition-colors hover:text-accent">سبد خرید</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-xs font-medium tracking-wide text-surface/70">ارتباط با ما</h3>
            <ul className="mt-3 space-y-2 text-sm text-surface/50">
              <li>پشتیبانی: ۰۲۱-۱۲۳۴۵۶۷۸</li>
              <li>واتساپ: ۰۹۱۲-۱۲۳۴۵۶۷</li>
              <li>ایمیل: info@mojgallery.ir</li>
            </ul>
          </div>
        </div>

        <div className="mt-10 border-t border-surface/10 pt-6 text-center text-xs text-surface/35">
          تمامی حقوق محفوظ است &copy; {new Date().getFullYear()} {SITE_NAME}
        </div>
      </div>
    </footer>
  );
}