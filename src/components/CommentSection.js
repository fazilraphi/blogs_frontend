"use client";

import { useEffect, useState } from "react";
import { apiRequest } from "@/lib/api";
import Link from "next/link";

export default function CommentSection({ blogId }) {
    const [comments, setComments] = useState([]);
    const [text, setText] = useState("");
    const [loading, setLoading] = useState(true);
    const [me, setMe] = useState(null);

    useEffect(() => {
        async function fetchComments() {
            try {
                const res = await fetch(
                    `${process.env.NEXT_PUBLIC_API_URL}/blogs/${blogId}/comments`,
                );
                if (res.ok) {
                    const data = await res.json();
                    setComments(Array.isArray(data) ? data : data.comments || []);
                }
            } catch (e) {
                console.error("Failed to fetch comments");
            } finally {
                setLoading(false);
            }
        }
        async function loadMe() {
            try {
                const r = await apiRequest("/me");
                if (r?.ok) {
                    const u = await r.json();
                    setMe(u);
                }
            } catch {}
        }
        if (blogId) {
            fetchComments();
            loadMe();
        }
    }, [blogId]);

    const handleComment = async () => {
        if (!text.trim()) return;

        try {
            const res = await apiRequest(`/blogs/${blogId}/comments`, {
                method: "POST",
                body: JSON.stringify({ content: text }),
            });

            if (res.ok) {
                setText("");
                // Refresh comments
                const newRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/blogs/${blogId}/comments`);
                const newData = await newRes.json();
                setComments(Array.isArray(newData) ? newData : newData.comments || []);
            }
        } catch (e) {
            console.error("Failed to post comment", e);
        }
    };

    const handleDelete = async (commentId) => {
        try {
            const res = await apiRequest(`/comments/${commentId}`, { method: "DELETE" });
            if (res.ok) {
                setComments(prev => prev.filter(c => c.id !== commentId));
            }
        } catch (e) {
            console.error("Failed to delete comment", e);
        }
    };

    return (
        <div className="mt-12">
            <h3 className="text-2xl font-bold mb-6 text-white flex items-center">
                Comments <span className="ml-2 text-sm font-normal text-gray-500">({comments.length})</span>
            </h3>

            <div className="glass p-6 rounded-2xl border border-white/5 mb-8">
                <textarea
                    className="w-full bg-black/30 border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:border-[var(--color-apple-green)] focus:ring-1 focus:ring-[var(--color-apple-green)] transition-all resize-y min-h-[100px]"
                    placeholder="Share your thoughts..."
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                />
                <div className="flex justify-end mt-4">
                    <button
                        onClick={handleComment}
                        disabled={!text.trim()}
                        className="px-6 py-2 bg-[var(--color-apple-green)] text-black font-semibold rounded-full hover:bg-[var(--color-apple-green-hover)] disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-105 shadow-[0_0_15px_rgba(76,201,54,0.3)]"
                    >
                        Post Comment
                    </button>
                </div>
            </div>

            <div className="space-y-4">
                {loading ? (
                    <p className="text-gray-500">Loading comments...</p>
                ) : comments.length > 0 ? (
                    comments.map((c) => {
                        const author = c.author || c.user;
                        const canDelete = me?.id && (author?.id === me.id || c.author_id === me.id);
                        return (
                        <div key={c.id} className="glass p-5 rounded-xl border border-white/5 hover:border-white/10 transition-colors">
                            <div className="flex justify-between items-start mb-2">
                                <Link href={`/profile/${author?.id || c.author_id}`} className="font-semibold text-[var(--color-apple-green)] hover:underline">
                                    @{author?.username || "Anonymous"}
                                </Link>
                                <div className="flex items-center space-x-3">
                                    <span className="text-xs text-gray-500">{new Date(c.created_at).toLocaleDateString()}</span>
                                    {canDelete && (
                                        <button
                                            onClick={() => handleDelete(c.id)}
                                            className="text-xs text-red-400 border border-red-500/30 rounded-full px-2 py-1 hover:bg-red-500/10"
                                        >
                                            Delete
                                        </button>
                                    )}
                                </div>
                            </div>
                            <p className="text-gray-300 leading-relaxed">{c.content}</p>
                        </div>);
                    })
                ) : (
                    <p className="text-gray-500 italic">No comments yet. Be the first to share your thoughts!</p>
                )}
            </div>
        </div>
    );
}
