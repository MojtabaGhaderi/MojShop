import Image from "next/image";
import Link from "next/link";
import type { Category } from "@/types";

interface CategoryRailProps {
    categories: Category[];
}

export default function CategoryRail({ categories }: CategoryRailProps) {
    if (categories.length === 0) {
        return null;
    }

    return (
        <section aria-label="دسته‌بندی محصولات" className="overflow-hidden" dir="rtl">
            <div className="mx-auto max-w-[1440px]">
                <div className="flex items-center gap-4 overflow-x-auto px-5 pb-3 scrollbar-none sm:gap-5 sm:px-8 lg:gap-6 lg:px-10">
                    {categories.map((category) => (
                        <Link
                            key={category.id}
                            href={`/products?category=${category.slug}`}
                            className="group w-[140px] shrink-0 sm:w-[170px] md:w-[210px] lg:w-[240px]"
                        >
                            <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-[#E7E5DF] border border-[#E8E2D1] shadow-2xs transition-all duration-500 group-hover:border-accent group-hover:shadow-md">
                                {category.image_url ? (
                                    <Image
                                        src={category.image_url}
                                        alt={category.name}
                                        fill
                                        sizes="(min-width: 1024px) 240px, (min-width: 640px) 170px, 140px"
                                        className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
                                    />
                                ) : (
                                    <div className="flex h-full items-center justify-center text-primary/20">
                                        —
                                    </div>
                                )}

                                <div
                                    className="
                    absolute inset-x-0 bottom-0
                    flex h-10 items-center justify-center
                    bg-gradient-to-t from-[#173B57]/80 via-[#173B57]/40 to-transparent
                    backdrop-blur-[2px]
                  "
                                >
                                    <span className="text-xs font-medium text-white sm:text-sm">
                                        {category.name}
                                    </span>
                                </div>
                            </div>
                        </Link>
                    ))}

                    {/* Signature Arrow Link */}
                    <Link
                        href="/categories"
                        className="group flex min-w-[140px] shrink-0 items-center justify-center sm:min-w-[170px] md:min-w-[200px]"
                        aria-label="مشاهده همه دسته‌بندی‌ها"
                    >
                        <Image
                            src="/signature-arrow.png"
                            alt="مشاهده همه"
                            width={320}
                            height={90}
                            className="!h-10 !w-auto max-w-none transition-transform duration-500 ease-out group-hover:-translate-x-3 sm:!h-16 lg:!h-20"
                        />
                    </Link>
                </div>
            </div>
        </section>
    );
}