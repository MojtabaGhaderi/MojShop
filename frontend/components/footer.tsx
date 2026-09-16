import Link from 'next/link';
import { serverFetch } from '@/lib/api';
import type { FooterConfig } from '@/types';

export default async function Footer() {
  let footerData: FooterConfig | null = null;

  try {
    footerData = await serverFetch<FooterConfig>('/site-settings/footer');
  } catch {
    footerData = null;
  }

  const info = footerData?.info ?? {
    site_title: 'موج',
    tagline: 'گالری نقره دست‌ساز',
    bio: 'طراحی و ساخت زیورآلات معاصر نقره با تضمین عیار ۹۲۵ استرلینگ و ضمانت همیشگی اصالت.',
    phone: '۰۲۱-۱۲۳۴۵۶۷۸',
    whatsapp: '۰۹۱۲۱۲۳۴۵۶۷',
    email: 'info@mowjgallery.com',
    instagram: 'mowj.silver',
    copyright_text: 'تمامی حقوق برای گالری موج محفوظ است.',
  };

  const sections = footerData?.sections ?? [];

  return (
    <footer className="mt-auto border-t border-primary/20 bg-primary text-white selection:bg-white/20 selection:text-white">
      <div className="mx-auto max-w-[1440px] px-5 py-16 sm:px-8 sm:py-20 lg:px-10">
        <div className="grid grid-cols-1 gap-12 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 lg:gap-8">

          {/* Brand & Narrative Statement */}
          <div className="sm:col-span-2">
            <h2 className="text-xl font-light tracking-widest text-white">
              {info.site_title}
            </h2>
            {info.tagline && (
              <p className="mt-1.5 font-mono text-[11px] uppercase tracking-widest text-white/50">
                {info.tagline}
              </p>
            )}
            {info.bio && (
              <p className="mt-5 max-w-sm text-xs leading-relaxed text-white/70 sm:text-sm">
                {info.bio}
              </p>
            )}
          </div>

          {/* Dynamic Admin Link Columns */}
          {sections.map((section) => (
            <div key={section.id}>
              <h3 className="font-mono text-[11px] uppercase tracking-widest text-white/90">
                {section.title}
              </h3>
              <ul className="mt-5 space-y-3">
                {section.links.map((link) => (
                  <li key={link.id}>
                    <Link
                      href={link.href}
                      target={link.is_external ? '_blank' : undefined}
                      rel={link.is_external ? 'noopener noreferrer' : undefined}
                      className="text-xs text-white/60 transition-colors duration-200 hover:text-white"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Contact & Studio Channels */}
          <div>
            <h3 className="font-mono text-[11px] uppercase tracking-widest text-white/90">
              ارتباط و همراهی
            </h3>
            <ul className="mt-5 space-y-3 text-xs text-white/60">
              {info.phone && (
                <li className="flex items-center gap-2.5">
                  <span className="text-white/40">تلفن:</span>
                  <a
                    href={`tel:${info.phone}`}
                    className="font-mono text-white/80 transition-colors hover:text-white"
                  >
                    {info.phone}
                  </a>
                </li>
              )}
              {info.whatsapp && (
                <li className="flex items-center gap-2.5">
                  <span className="text-white/40">واتساپ:</span>
                  <a
                    href={`https://wa.me/${info.whatsapp.replace(/[^0-9]/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-mono text-white/80 transition-colors hover:text-white"
                  >
                    {info.whatsapp}
                  </a>
                </li>
              )}
              {info.email && (
                <li className="flex items-center gap-2.5">
                  <span className="text-white/40">ایمیل:</span>
                  <a
                    href={`mailto:${info.email}`}
                    className="font-mono text-white/80 transition-colors hover:text-white"
                  >
                    {info.email}
                  </a>
                </li>
              )}
              {info.instagram && (
                <li className="flex items-center gap-2.5">
                  <span className="text-white/40">اینستاگرام:</span>
                  <a
                    href={`https://instagram.com/${info.instagram}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-mono text-white/80 transition-colors hover:text-white"
                  >
                    @{info.instagram}
                  </a>
                </li>
              )}
            </ul>
          </div>

        </div>

        {/* Bottom Editorial Accent Bar */}
        <div className="mt-16 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-8 text-[11px] text-white/40 sm:flex-row">
          <p>
            {info.copyright_text || `تمامی حقوق محفوظ است © ${new Date().getFullYear()} ${info.site_title}`}
          </p>
          <div className="flex items-center gap-6 font-mono text-[10px] uppercase tracking-widest text-white/50">
            <span>تهران • عیار ۹۲۵</span>
            <span className="h-1 w-1 rounded-full bg-white/20" />
            <span>ارسال سراسری بیمه‌شده</span>
          </div>
        </div>
      </div>
    </footer>
  );
}