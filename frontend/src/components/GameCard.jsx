import Link from 'next/link';
import { Star } from 'lucide-react';

const GameCard = ({ game }) => {
    return (
        <Link href={`/games/${game.id}`} className="group block cursor-pointer">
            <div className="relative aspect-[3/4] overflow-hidden rounded-lg bg-zinc-800 shadow-lg transition-transform duration-300 group-hover:-translate-y-1 group-hover:shadow-xl border border-zinc-800 group-hover:border-emerald-500/50">
                {/* Image Placeholder */}
                <img
                    src={game.coverImage || "https://placehold.co/300x400/222/888?text=Game+Cover"}
                    alt={game.title}
                    className="object-cover w-full h-full transition-opacity duration-300 group-hover:opacity-80"
                />

                {/* Overlay Gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
                    <p className="text-white font-bold truncate">{game.title}</p>
                    <div className="flex items-center gap-1 text-emerald-400">
                        <Star className="w-4 h-4 fill-current" />
                        <span className="text-sm font-medium">{game.rating || 'N/A'}</span>
                    </div>
                </div>
            </div>
            <div className="mt-2">
                <h3 className="text-sm font-medium text-zinc-200 group-hover:text-emerald-400 transition-colors truncate">
                    {game.title}
                </h3>
                <p className="text-xs text-zinc-500 truncate">{game.releaseYear}</p>
            </div>
        </Link>
    );
};

export default GameCard;
