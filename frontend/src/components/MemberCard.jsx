import Link from 'next/link';
import Avatar from '@/components/ui/Avatar';
import GameCover from '@/components/ui/GameCover';

// A member with their counts and the last few games they reviewed. The name is a stretched link.
export default function MemberCard({ member }) {
    return (
        <article className="panel panel-hover relative p-4 flex flex-col gap-4 h-full">
            <div className="flex items-center gap-4">
                <Avatar user={member} size={56} />
                <div className="min-w-0">
                    <h3 className="display text-lg truncate">
                        <Link href={`/users/${member.username}`} className="after:absolute after:inset-0 hover:text-neon">
                            {member.username}
                        </Link>
                    </h3>
                    {member.bio && <p className="text-sm text-muted line-clamp-1">{member.bio}</p>}
                </div>
            </div>

            <dl className="grid grid-cols-3 gap-2 text-center">
                {[
                    ['Reviews', member.stats?.reviews ?? 0],
                    ['Lists', member.stats?.lists ?? 0],
                    ['Played', member.stats?.gamesPlayed ?? 0],
                ].map(([label, value]) => (
                    // Term first in the markup, shown below the number.
                    <div key={label} className="border border-line py-2 flex flex-col-reverse">
                        <dt className="label mt-1">{label}</dt>
                        <dd className="numeral text-2xl">{value}</dd>
                    </div>
                ))}
            </dl>

            {member.recentGames?.length > 0 && (
                <ul className="flex gap-1 mt-auto" aria-label="Recently reviewed">
                    {member.recentGames.slice(0, 4).map((game, i) => (
                        <li key={i} className="w-12 aspect-[3/4] border border-line overflow-hidden">
                            <GameCover src={game.coverImage} title={game.title} className="w-full h-full" />
                        </li>
                    ))}
                </ul>
            )}
        </article>
    );
}
