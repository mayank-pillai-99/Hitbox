import Link from 'next/link';
import { Star } from 'lucide-react';
import GameCover from '@/components/ui/GameCover';

// A cover with the title and release year. The community rating is a lime tag in the corner.
const GameCard = ({ game }) => {
    const year = game.releaseYear || (game.releaseDate ? new Date(game.releaseDate).getFullYear() : 'TBA');
    const rating = game.rating || game.averageRating;

    return (
        <Link href={`/games/${game._id || game.id}`} className="group block card-hover">
            <div className="img-hover-zoom relative aspect-[3/4] panel panel-hover group-hover:border-neon group-focus-visible:border-neon">
                <GameCover src={game.coverImage} title={game.title} className="w-full h-full" />
                {rating > 0 && (
                    <span className="absolute top-0 left-0 bg-neon text-black label !text-black px-2 py-1 flex items-center gap-1 font-bold">
                        <Star className="w-3 h-3 fill-current" aria-hidden="true" />
                        <span className="sr-only">Rated </span>
                        {Number(rating).toFixed(1)}
                    </span>
                )}
            </div>
            <div className="mt-2">
                <h3 className="text-sm font-bold text-fg group-hover:text-neon truncate">{game.title}</h3>
                <p className="label mt-0.5">{year}</p>
            </div>
        </Link>
    );
};

export default GameCard;
