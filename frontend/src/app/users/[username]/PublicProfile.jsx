'use client';

import { useState } from 'react';
import Link from 'next/link';
import { UserX, ListX, MessageSquare } from 'lucide-react';
import PageShell from '@/components/ui/PageShell';
import StatTile from '@/components/ui/StatTile';
import EmptyState from '@/components/ui/EmptyState';
import ErrorState from '@/components/ui/ErrorState';
import Pager from '@/components/ui/Pager';
import ToggleGroup from '@/components/ui/ToggleGroup';
import { ProfileSkeleton, ListRowsSkeleton, CardGridSkeleton } from '@/components/ui/Skeleton';
import ProfileHeader from '@/components/ProfileHeader';
import FollowButton from '@/components/FollowButton';
import ReviewCard from '@/components/ReviewCard';
import ListCard from '@/components/ListCard';
import useApi from '@/hooks/useApi';

export default function PublicProfile({ username }) {
    const [tab, setTab] = useState('reviews');
    const [page, setPage] = useState(1);
    const [followers, setFollowers] = useState(null); // follower count after following or unfollowing here
    const name = encodeURIComponent(username);

    const profileReq = useApi(`/users/${name}`);
    const reviews = useApi(`/users/${name}/reviews`, { page, limit: 10 });
    const lists = useApi(`/users/${name}/lists`);

    if (profileReq.loading) return <PageShell><ProfileSkeleton /></PageShell>;

    const profile = profileReq.data;
    if (profileReq.error || !profile) {
        const missing = profileReq.error?.response?.status === 404;
        return (
            <PageShell>
                {missing ? (
                    <EmptyState icon={UserX} title="Member not found" action={<Link href="/members" className="btn-primary">Browse members</Link>}>
                        There is no member called {username}.
                    </EmptyState>
                ) : (
                    <ErrorState message="Failed to load this profile." onRetry={profileReq.reload} />
                )}
            </PageShell>
        );
    }

    return (
        <PageShell bare>
            <ProfileHeader
                profile={profile}
                actions={
                    <FollowButton
                        key={profile.username}
                        username={profile.username}
                        initialFollowing={profile.isFollowing}
                        onChange={(_following, count) => setFollowers(count)}
                    />
                }
            >
                <StatTile label="Followers" value={followers ?? profile.followersCount ?? 0} accent />
                <StatTile label="Following" value={profile.followingCount || 0} />
                <StatTile label="Reviews" value={profile.stats.reviews} />
                <StatTile label="Lists" value={profile.stats.lists} />
                <StatTile label="Played" value={profile.stats.gamesPlayed || 0} />
            </ProfileHeader>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                <ToggleGroup
                    label="Profile sections"
                    options={[['reviews', `Reviews (${profile.stats.reviews})`], ['lists', `Lists (${profile.stats.lists})`]]}
                    value={tab}
                    onChange={setTab}
                    className="mb-6"
                />

                {tab === 'reviews' ? (
                    reviews.loading ? (
                        <ListRowsSkeleton count={3} />
                    ) : reviews.error ? (
                        <ErrorState message="Could not load reviews." onRetry={reviews.reload} />
                    ) : reviews.data.reviews.length === 0 ? (
                        <EmptyState icon={MessageSquare} title="No reviews yet">When {profile.username} reviews games, they&apos;ll appear here.</EmptyState>
                    ) : (
                        <>
                            <ul className="space-y-3">
                                {reviews.data.reviews.map((review) => (
                                    <li key={review._id}><ReviewCard review={review} showGame /></li>
                                ))}
                            </ul>
                            <Pager page={page} totalPages={reviews.data.pagination.total} onChange={setPage} />
                        </>
                    )
                ) : lists.loading ? (
                    <CardGridSkeleton count={3} label="Loading lists" />
                ) : lists.error ? (
                    <ErrorState message="Could not load lists." onRetry={lists.reload} />
                ) : lists.data.length === 0 ? (
                    <EmptyState icon={ListX} title="No lists yet">When {profile.username} creates lists, they&apos;ll appear here.</EmptyState>
                ) : (
                    <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {lists.data.map((list) => (
                            <li key={list._id}><ListCard list={list} /></li>
                        ))}
                    </ul>
                )}
            </div>
        </PageShell>
    );
}
