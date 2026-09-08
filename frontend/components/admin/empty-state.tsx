// frontend/components/admin/empty-state.tsx
import type { LucideIcon } from 'lucide-react';

export function EmptyState({ icon: Icon, title, description }: { icon: LucideIcon; title: string; description?: string }) {
    return (
        <div className="flex flex-col items-center justify-center gap-2 py-12 text-center text-muted-foreground">
            <Icon className="h-8 w-8" />
            <p className="font-medium">{title}</p>
            {description && <p className="text-sm">{description}</p>}
        </div>
    );
}