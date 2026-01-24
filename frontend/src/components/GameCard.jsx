import Link from 'next/link';
import { Star } from 'lucide-react';

const GameCard = ({ game }) => {
    return (
        <Link href={`/games/${game._id || game.id}`} className="group block cursor-pointer">
            <div className="card-hover img-hover-zoom relative aspect-[3/4] overflow-hidden rounded-lg bg-zinc-800 shadow-lg border border-zinc-800 group-hover:border-lime-400/50">
                <img
                    src={game.coverImage || "https://placehold.co/300x400/222/888?text=Game+Cover"}
                    alt={game.title}
                    className="object-cover w-full h-full"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
                    <p className="text-white font-bold truncate">{game.title}</p>
                    <div className="flex items-center gap-1 text-lime-300">
                        <Star className="w-4 h-4 fill-current" />
                        <span className="text-sm font-medium">{game.rating || 'N/A'}</span>
                    </div>
                </div>
            </div>
            <div className="mt-2">
                <h3 className="text-sm font-medium text-zinc-200 group-hover:text-lime-300 transition-colors truncate">
                    {game.title}
                </h3>
                <p className="text-xs text-zinc-500 truncate">
                    {game.releaseYear || (game.releaseDate ? new Date(game.releaseDate).getFullYear() : 'TBA')}
                </p>
            </div>
        </Link>
    );
};

export default GameCard;
