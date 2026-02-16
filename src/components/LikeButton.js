"use client";

import { useEffect, useState } from "react";
import { apiRequest } from "@/lib/api";

export default function LikeButton({ blogId, initialLikes = 0 }) {
    const [liked, setLiked] = useState(false);
    const [count, setCount] = useState(initialLikes);
    const [isAnimating, setIsAnimating] = useState(false);
    const [initialized, setInitialized] = useState(false);

    useEffect(() => {
        async function detect() {
            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/blogs/${blogId}`);
                if (res.ok) {
                    const data = await res.json();
                    if (typeof data.likes_count === "number") {
                        setCount(data.likes_count);
                    }
                }
            } finally {
                setInitialized(true);
            }
        }
        if (blogId && !initialized) detect();
    }, [blogId, initialized]);

    const handleLike = async () => {
        const next = !liked;

        setLiked(next);
        setCount((prev) => (next ? prev + 1 : Math.max(0, prev - 1)));
        setIsAnimating(true);
        setTimeout(() => setIsAnimating(false), 1000);

        try {
            const method = next ? "POST" : "DELETE";
            await apiRequest(`/blogs/${blogId}/like`, { method });
        } catch (error) {
            console.error("Failed to like:", error);
            setLiked(!next);
            setCount((prev) => (!next ? prev + 1 : Math.max(0, prev - 1)));
        }
    };

    return (
        <button
            onClick={handleLike}
            className={`group relative flex items-center space-x-2 px-6 py-2 rounded-full overflow-hidden transition-all duration-300 ${liked
                    ? "bg-[var(--color-apple-green)] text-black shadow-[0_0_20px_rgba(76,201,54,0.4)]"
                    : "bg-white/5 text-gray-300 hover:bg-white/10 hover:text-white border border-white/10"
                }`}
        >
            <span className={`transform transition-transform duration-300 ${liked ? "scale-110" : "group-hover:scale-110"}`}>
                {liked ? "❤️" : "🤍"}
            </span>
            <span className="font-medium">{count}</span>

            {isAnimating && (
                <span className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--color-apple-green)] opacity-20"></span>
                </span>
            )}
        </button>
    );
}
