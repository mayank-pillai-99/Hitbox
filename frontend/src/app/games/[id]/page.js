import GameDetails from './GameDetails';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

// The page title and share preview come from the game itself. If the API is slow or down
// the page still renders with a generic title and the client component loads the game itself.
export async function generateMetadata({ params }) {
    const { id } = await params;
    try {
        const res = await fetch(`${API_URL}/games/${encodeURIComponent(id)}`, {
            next: { revalidate: 3600 },
            signal: AbortSignal.timeout(4000),
        });
        if (!res.ok) return { title: 'Game' };
        const game = await res.json();

        const description = game.description
            ? game.description.slice(0, 200)
            : `Ratings, reviews and lists for ${game.title} on Hitbox.`;
        return {
            title: game.title,
            description,
            openGraph: {
                title: game.title,
                description,
                type: 'website',
                ...(game.coverImage && { images: [{ url: game.coverImage }] }),
            },
            twitter: { card: game.coverImage ? 'summary_large_image' : 'summary', title: game.title, description },
        };
    } catch {
        return { title: 'Game' };
    }
}

export default async function GamePage({ params }) {
    const { id } = await params;
    // Keyed by id so following a "more like this" link starts from a clean slate.
    return <GameDetails key={id} id={id} />;
}
