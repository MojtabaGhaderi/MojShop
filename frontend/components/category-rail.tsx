import Image from "next/image";
import Link from "next/link";

import type { Category } from "@/types";

interface CategoryRailProps {
    categories: Category[];
}

export default function CategoryRail({
    categories,
}: CategoryRailProps) {
    if (categories.length === 0) {
        return null;
    }

    return (
        <section
            aria-label="دسته‌بندی محصولات"
            className="overflow-hidden"
        >
            <div className="flex gap-3 overflow-x-auto px-5 pb-2 scrollbar-none sm:px-8 lg:px-10">
                {categories.map((category) => (
                    <Link
                        key={category.id}
                        href={`/products?category=${category.slug}`}
                        className="group w-[140px] shrink-0 sm:w-[170px]"
                    >
                        <div className="relative aspect-[4/5] overflow-hidden rounded-xl bg-[#E7E5DF]">
                            {category.image_url ? (
                                <Image
                                    src={category.image_url}
                                    alt={category.name}
                                    fill
                                    sizes="(min-width: 640px) 170px, 140px"
                                    className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
                                />
                            ) : (
                                <div className="flex h-full items-center justify-center text-primary/20">
                                    —
                                </div>
                            )}

                            <div
                                className="
        absolute inset-x-0 bottom-0
        flex h-8 items-center justify-center
        bg-[#173B57]/10
        backdrop-blur
      "
                            >
                                <span className="text-sm font-medium text-white">
                                    {category.name}
                                </span>
                            </div>
                        </div>
                    </Link>
                ))}
                <Link
                    href="/categories"
                    className="
    flex w-[140px] shrink-0 items-center justify-center
    rounded-xl border border-[#D8D5CE]
    bg-[#F7F6F2]
    text-primary
    transition-colors duration-300
    hover:bg-white
    sm:w-[170px]
  "
                >
                    <span className="text-sm font-medium">
                        مشاهده همه
                    </span>
                </Link>
            </div>
        </section>
    );
}