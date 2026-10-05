import PublicProfile from './PublicProfile';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

export async function generateMetadata({ params }) {
    const { username } = await params;
    try {
        const res = await fetch(`${API_URL}/users/${encodeURIComponent(username)}`, {
            next: { revalidate: 600 },
            signal: AbortSignal.timeout(4000),
        });
        if (!res.ok) return { title: 'Member' };
        const profile = await res.json();
        const description = profile.bio || `${profile.username} on Hitbox: ${profile.stats?.reviews ?? 0} reviews and ${profile.stats?.lists ?? 0} lists.`;
        return {
            title: profile.username,
            description,
            openGraph: { title: `${profile.username} on Hitbox`, description, type: 'profile' },
        };
    } catch {
        return { title: 'Member' };
    }
}

export default async function UserPage({ params }) {
    const { username } = await params;
    return <PublicProfile key={username} username={username} />;
}
