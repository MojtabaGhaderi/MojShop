import Link from 'next/link';
import { SITE_NAME, NAV_LINKS } from '@/lib/constants';

export default function Footer() {
  return (
    <footer className="mt-auto border-t border-border-default bg-surface-elevated">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {/* Brand */}
          <div>
            <h2 className="text-lg font-bold text-primary">{SITE_NAME}</h2>
            <p className="mt-2 text-sm leading-relaxed text-primary-muted">
              فروشگاه آنلاین جواهرات و اکسسوری با ضمانت اصالت کالا و بهترین قیمت
              روز.
            </p>
          </div>

          {/* Quick links */}
          <div>
            <h3 className="text-sm font-semibold text-primary">دسترسی سریع</h3>
            <ul className="mt-3 space-y-2">
              {NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-primary-muted transition-colors hover:text-accent"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
              <li>
                <Link
                  href="/cart"
                  className="text-sm text-primary-muted transition-colors hover:text-accent"
                >
                  سبد خرید
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-sm font-semibold text-primary">ارتباط با ما</h3>
            <ul className="mt-3 space-y-2 text-sm text-primary-muted">
              <li>پشتیبانی: ۰۲۱-۱۲۳۴۵۶۷۸</li>
              <li>واتساپ: ۰۹۱۲-۱۲۳۴۵۶۷</li>
              <li>ایمیل: info@mojgallery.ir</li>
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t border-border-default pt-6 text-center text-xs text-primary-subtle">
 تمامی حقوق محفوظ است &copy; {new Date().getFullYear()} {SITE_NAME}
        </div>
      </div>
    </footer>
  );
}
