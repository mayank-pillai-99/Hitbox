'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

// For pages that need a signed-in member. Once auth has loaded, an anonymous visitor is sent to the
// login page, which sends them back here afterwards. `ready` is true when it is safe to render the page.
export default function useRequireAuth() {
    const { user, loading } = useAuth();
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        if (!loading && !user) router.replace(`/login?next=${encodeURIComponent(pathname)}`);
    }, [loading, user, router, pathname]);

    return { user, ready: !loading && Boolean(user) };
}
