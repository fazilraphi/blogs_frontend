"use client";

import { useEffect, useState } from "react";
import { apiRequest } from "@/lib/api";

export default function FollowButton({ userId, initialIsFollowing = false }) {
    const [isFollowing, setIsFollowing] = useState(initialIsFollowing);
    const [isLoading, setIsLoading] = useState(false);
    const [initialized, setInitialized] = useState(!!initialIsFollowing);

    useEffect(() => {
        async function detect() {
            if (initialized) return;
            try {
                const meRes = await apiRequest("/me");
                if (!meRes.ok) return;
                const me = await meRes.json();
                if (!me?.id) return;
                const followersRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/${userId}/followers`);
                if (!followersRes.ok) return;
                const followers = await followersRes.json();
                const following = Array.isArray(followers) && followers.some(f => f.id === me.id);
                setIsFollowing(!!following);
            } finally {
                setInitialized(true);
            }
        }
        if (userId) detect();
    }, [userId, initialized]);

    const handleFollow = async () => {
        if (isLoading) return;
        setIsLoading(true);

        // Optimistic update
        const previousState = isFollowing;
        setIsFollowing(!isFollowing);

        try {
            const method = isFollowing ? "DELETE" : "POST";
            const res = await apiRequest(`/users/${userId}/follow`, { method });

            if (!res.ok) {
                throw new Error("Failed to follow/unfollow");
            }
        } catch (error) {
            console.error(error);
            setIsFollowing(previousState); // Revert
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <button
            onClick={handleFollow}
            disabled={isLoading}
            className={`px-6 py-2 rounded-full font-medium transition-all duration-300 transform hover:scale-105 ${isFollowing
                    ? "bg-transparent border border-white/20 text-gray-300 hover:border-white hover:text-white"
                    : "bg-[var(--color-apple-green)] text-black shadow-[0_0_15px_rgba(76,201,54,0.3)] hover:shadow-[0_0_25px_rgba(76,201,54,0.5)]"
                }`}
        >
            {isLoading ? "..." : isFollowing ? "Following" : "Follow"}
        </button>
    );
}
