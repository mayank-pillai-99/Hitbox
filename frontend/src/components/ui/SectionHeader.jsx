import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

// Section title with a mono index ("02 / LISTS") and an optional link on the right.
export default function SectionHeader({ index, tag, title, href, linkLabel, as: Heading = 'h2', className = '' }) {
    return (
        <div className={`flex items-end justify-between gap-4 border-b border-line pb-3 mb-6 ${className}`}>
            <div>
                {(index || tag) && (
                    <div className="label text-neon mb-1">
                        {index && <span>{index}</span>}
                        {index && tag && <span className="text-dim"> / </span>}
                        {tag && <span>{tag}</span>}
                    </div>
                )}
                <Heading className="display text-2xl sm:text-3xl text-fg">{title}</Heading>
            </div>
            {href && (
                <Link href={href} className="group label hover:text-neon flex items-center gap-2 min-h-[44px]">
                    {linkLabel}
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
                </Link>
            )}
        </div>
    );
}
