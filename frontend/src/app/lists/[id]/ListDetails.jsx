'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Trash2, Pencil, X, Send, ListX, MessageSquare } from 'lucide-react';
import PageShell from '@/components/ui/PageShell';
import SectionHeader from '@/components/ui/SectionHeader';
import Avatar from '@/components/ui/Avatar';
import EmptyState from '@/components/ui/EmptyState';
import ErrorState from '@/components/ui/ErrorState';
import { ProfileSkeleton } from '@/components/ui/Skeleton';
import EditListModal from '@/components/EditListModal';
import ConfirmModal from '@/components/ConfirmModal';
import GameCard from '@/components/GameCard';
import useApi from '@/hooks/useApi';
import api from '@/utils/api';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';

export default function ListDetails({ id }) {
    const { user } = useAuth();
    const toast = useToast();
    const router = useRouter();

    const listReq = useApi(`/lists/${id}`);
    const commentsReq = useApi(`/comments/list/${id}`);

    const [isEditOpen, setIsEditOpen] = useState(false);
    const [confirmDeleteList, setConfirmDeleteList] = useState(false);
    const [removeGameId, setRemoveGameId] = useState(null);
    const [deleteCommentId, setDeleteCommentId] = useState(null);
    const [newComment, setNewComment] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const list = listReq.data;

    if (listReq.loading) return <PageShell><ProfileSkeleton /></PageShell>;

    if (listReq.error || !list) {
        const missing = [400, 404].includes(listReq.error?.response?.status);
        return (
            <PageShell>
                {missing ? (
                    <EmptyState icon={ListX} title="List not found" action={<Link href="/lists" className="btn-primary">Browse lists</Link>}>
                        It may have been deleted.
                    </EmptyState>
                ) : (
                    <ErrorState message="Failed to load this list." onRetry={listReq.reload} />
                )}
            </PageShell>
        );
    }

    const ownerId = list.user?._id || list.user;
    const isOwner = Boolean(user && ownerId && String(ownerId) === String(user._id || user.id));
    const comments = commentsReq.data ?? [];

    const deleteList = async () => {
        try {
            await api.delete(`/lists/${id}`);
            toast.success('List deleted');
            router.push('/profile');
        } catch {
            toast.error('Failed to delete list');
        }
    };

    const removeGame = async (gameId) => {
        try {
            await api.delete(`/lists/${id}/game/${gameId}`);
            toast.success('Game removed from list');
            listReq.reload();
        } catch {
            toast.error('Failed to remove game');
        }
    };

    const addComment = async (e) => {
        e.preventDefault();
        const text = newComment.trim();
        if (!text) return;
        setSubmitting(true);
        try {
            await api.post(`/comments/list/${id}`, { text });
            setNewComment('');
            commentsReq.reload();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to add comment');
        } finally {
            setSubmitting(false);
        }
    };

    const deleteComment = async (commentId) => {
        try {
            await api.delete(`/comments/${commentId}`);
            toast.success('Comment deleted');
            commentsReq.reload();
        } catch {
            toast.error('Failed to delete comment');
        }
    };

    return (
        <PageShell bare>
            <header className="border-b border-line bg-panel/40">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 flex flex-col md:flex-row justify-between gap-8">
                    <div className="min-w-0">
                        <p className="label text-neon">List / {list.games.length} {list.games.length === 1 ? 'game' : 'games'}</p>
                        <h1 className="display text-4xl sm:text-6xl mt-2 break-words animate-fade-in-up">{list.name}</h1>
                        {list.description && <p className="mt-4 text-lg text-muted max-w-2xl whitespace-pre-line">{list.description}</p>}

                        <Link href={`/users/${list.user.username}`} className="mt-6 inline-flex items-center gap-3 panel panel-hover px-3 py-2 min-h-[44px]">
                            <Avatar user={list.user} size={28} />
                            <span className="min-w-0">
                                <span className="label block">Curated by</span>
                                <span className="font-bold">{list.user.username}</span>
                            </span>
                        </Link>
                    </div>

                    {isOwner && (
                        <div className="flex gap-2 md:self-start">
                            <button onClick={() => setIsEditOpen(true)} className="btn-ghost">
                                <Pencil className="w-4 h-4" aria-hidden="true" /> Edit
                            </button>
                            <button onClick={() => setConfirmDeleteList(true)} className="btn-ghost hover:!border-hot hover:!text-hot">
                                <Trash2 className="w-4 h-4" aria-hidden="true" /> Delete
                            </button>
                        </div>
                    )}
                </div>
                <div className="stripes" aria-hidden="true" />
            </header>

            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-16">
                <section aria-labelledby="games-heading">
                    <SectionHeader tag="Games" title="In this list" />
                    <span id="games-heading" className="sr-only">Games in this list</span>
                    {list.games.length === 0 ? (
                        <EmptyState
                            icon={ListX}
                            title="This list is empty"
                            action={isOwner && <Link href="/games" className="btn-primary">Browse games to add</Link>}
                        >
                            {isOwner ? 'Add games from any game page.' : 'Nothing has been added yet.'}
                        </EmptyState>
                    ) : (
                        <ul className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                            {list.games.map((game) => (
                                <li key={game._id} className="relative">
                                    <GameCard game={game} />
                                    {isOwner && (
                                        <button
                                            onClick={() => setRemoveGameId(game._id)}
                                            aria-label={`Remove ${game.title} from this list`}
                                            className="absolute top-0 right-0 w-11 h-11 flex items-center justify-center bg-ink/90 border border-line-strong text-muted hover:text-hot hover:border-hot"
                                        >
                                            <X className="w-4 h-4" aria-hidden="true" />
                                        </button>
                                    )}
                                </li>
                            ))}
                        </ul>
                    )}
                </section>

                <section aria-labelledby="comments-heading">
                    <SectionHeader tag={`${comments.length} ${comments.length === 1 ? 'comment' : 'comments'}`} title="Discussion" />
                    <span id="comments-heading" className="sr-only">Discussion</span>

                    {user ? (
                        <form onSubmit={addComment} className="mb-6">
                            <label htmlFor="new-comment" className="label block mb-1">Add a comment</label>
                            <textarea
                                id="new-comment"
                                value={newComment}
                                onChange={(e) => setNewComment(e.target.value)}
                                maxLength={1000}
                                rows={3}
                                placeholder="What do you think of this list?"
                                className="field resize-none"
                            />
                            <div className="mt-2 flex items-center justify-between">
                                <span className="label">{newComment.length} / 1000</span>
                                <button type="submit" disabled={submitting || !newComment.trim()} className="btn-primary">
                                    <Send className="w-4 h-4" aria-hidden="true" /> Post
                                </button>
                            </div>
                        </form>
                    ) : (
                        <div className="panel p-4 mb-6 flex flex-wrap items-center justify-between gap-3">
                            <p className="text-muted">Log in to join the discussion.</p>
                            <Link href="/login" className="btn-ghost">Log in</Link>
                        </div>
                    )}

                    {commentsReq.error ? (
                        <ErrorState message="Could not load comments." onRetry={commentsReq.reload} />
                    ) : comments.length === 0 ? (
                        <EmptyState icon={MessageSquare} title="No comments yet" />
                    ) : (
                        <ul className="space-y-3">
                            {comments.map((comment) => {
                                const mine = user && String(comment.user?._id) === String(user._id);
                                return (
                                    <li key={comment._id} className="panel p-4 flex gap-4">
                                        <Link href={`/users/${comment.user?.username}`} aria-hidden="true" tabIndex={-1}>
                                            <Avatar user={comment.user} size={40} />
                                        </Link>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between gap-3">
                                                <Link href={`/users/${comment.user?.username}`} className="font-bold hover:text-neon truncate">
                                                    {comment.user?.username || 'Unknown'}
                                                </Link>
                                                <div className="flex items-center gap-1 shrink-0">
                                                    <time dateTime={comment.createdAt} className="label">
                                                        {new Date(comment.createdAt).toLocaleDateString()}
                                                    </time>
                                                    {mine && (
                                                        <button
                                                            onClick={() => setDeleteCommentId(comment._id)}
                                                            aria-label="Delete your comment"
                                                            className="w-11 h-11 -my-2 flex items-center justify-center text-muted hover:text-hot"
                                                        >
                                                            <Trash2 className="w-4 h-4" aria-hidden="true" />
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                            <p className="mt-1 text-muted whitespace-pre-line break-words">{comment.text}</p>
                                        </div>
                                    </li>
                                );
                            })}
                        </ul>
                    )}
                </section>
            </div>

            <EditListModal
                isOpen={isEditOpen}
                onClose={() => setIsEditOpen(false)}
                list={list}
                onUpdate={listReq.reload}
            />
            <ConfirmModal
                isOpen={confirmDeleteList}
                onClose={() => setConfirmDeleteList(false)}
                onConfirm={deleteList}
                title="Delete list"
                message="This permanently deletes the list and its comments."
                confirmText="Delete"
            />
            <ConfirmModal
                isOpen={removeGameId !== null}
                onClose={() => setRemoveGameId(null)}
                onConfirm={() => removeGame(removeGameId)}
                title="Remove game"
                message="Remove this game from the list?"
                confirmText="Remove"
            />
            <ConfirmModal
                isOpen={deleteCommentId !== null}
                onClose={() => setDeleteCommentId(null)}
                onConfirm={() => deleteComment(deleteCommentId)}
                title="Delete comment"
                message="Delete this comment?"
                confirmText="Delete"
            />
        </PageShell>
    );
}
