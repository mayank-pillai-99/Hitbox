import { Calendar } from 'lucide-react';
import Avatar from '@/components/ui/Avatar';

// Avatar, name, member-since and bio on a flat hero, with `actions` (follow, settings) and `children` (stat tiles).
export default function ProfileHeader({ profile, actions, children }) {
    return (
        <header className="border-b border-line bg-panel/40">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 sm:pt-14 pb-8">
                <div className="flex flex-col sm:flex-row sm:items-end gap-6">
                    <div className="brackets w-28 h-28 sm:w-36 sm:h-36 shrink-0">
                        <Avatar user={profile} size={144} label={profile.username} className="!w-full !h-full" />
                    </div>

                    <div className="flex-1 min-w-0">
                        <p className="label text-neon flex items-center gap-2">
                            <Calendar className="w-3.5 h-3.5" aria-hidden="true" />
                            Member since {new Date(profile.createdAt).getFullYear()}
                        </p>
                        <h1 className="display text-4xl sm:text-6xl mt-2 break-words animate-fade-in-up">{profile.username}</h1>
                        {profile.bio && <p className="mt-3 text-muted max-w-2xl whitespace-pre-line">{profile.bio}</p>}
                    </div>

                    {actions && <div className="flex flex-wrap gap-2 sm:pb-2">{actions}</div>}
                </div>

                {children && <div className="mt-8 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">{children}</div>}
            </div>
            <div className="stripes" aria-hidden="true" />
        </header>
    );
}
