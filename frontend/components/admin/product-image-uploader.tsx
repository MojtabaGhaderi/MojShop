// frontend/components/admin/product-image-uploader.tsx
'use client';

import { useRef, useState } from 'react';
import { useUploadProductImage } from '@/hooks/use-admin-products';
import { UploadCloud, Loader2 } from 'lucide-react';

export function ProductImageUploader({ productId }: { productId: number }) {
    const inputRef = useRef<HTMLInputElement>(null);
    const [error, setError] = useState<string | null>(null);
    const upload = useUploadProductImage();

    function handleFiles(files: FileList | null) {
        const file = files?.[0];
        if (!file) return;
        if (!file.type.startsWith('image/')) return setError('فایل باید تصویر باشد');
        if (file.size > 10 * 1024 * 1024) return setError('حجم فایل نباید بیشتر از ۱۰ مگابایت باشد');
        setError(null);
        upload.mutate({ productId, file });
    }

    return (
        <div className="space-y-2">
            <div
                onClick={() => inputRef.current?.click()}
                onDrop={(e) => { e.preventDefault(); handleFiles(e.dataTransfer.files); }}
                onDragOver={(e) => e.preventDefault()}
                className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-md border border-dashed p-6 text-sm text-muted-foreground hover:bg-muted/50"
            >
                {upload.isPending ? <Loader2 className="h-6 w-6 animate-spin" /> : <UploadCloud className="h-6 w-6" />}
                <span>برای آپلود کلیک کنید یا تصویر را بکشید</span>
                <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleFiles(e.target.files)} />
            </div>
            {error && <p className="text-xs text-destructive">{error}</p>}
            {upload.isSuccess && <p className="text-xs text-green-600">تصویر با موفقیت آپلود شد.</p>}
            {upload.isError && <p className="text-xs text-destructive">خطا در آپلود تصویر</p>}
        </div>
    );
}