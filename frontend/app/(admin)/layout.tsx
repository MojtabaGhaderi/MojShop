export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-surface-sunken">
      <div className="border-b border-border-default bg-surface px-4 py-3">
        <div className="mx-auto max-w-7xl">
          <a href="/" className="text-sm font-bold text-primary">
            ← موج گالری | پنل مدیریت
          </a>
        </div>
      </div>
      {children}
    </div>
  );
}