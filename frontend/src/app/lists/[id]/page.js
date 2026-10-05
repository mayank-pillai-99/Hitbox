import ListDetails from './ListDetails';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

export async function generateMetadata({ params }) {
    const { id } = await params;
    try {
        const res = await fetch(`${API_URL}/lists/${encodeURIComponent(id)}`, {
            next: { revalidate: 600 },
            signal: AbortSignal.timeout(4000),
        });
        if (!res.ok) return { title: 'List' };
        const list = await res.json();
        const description = list.description || `A list of ${list.games?.length ?? 0} games by ${list.user?.username ?? 'a member'} on Hitbox.`;
        return {
            title: list.name,
            description,
            openGraph: { title: list.name, description, type: 'website' },
        };
    } catch {
        return { title: 'List' };
    }
}

export default async function ListPage({ params }) {
    const { id } = await params;
    return <ListDetails key={id} id={id} />;
}
