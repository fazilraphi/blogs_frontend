"use client";

import { useEffect, useState } from "react";
import { apiRequest } from "@/lib/api";
import BlogCard from "@/components/BlogCard";
import RequireAuth from "@/components/RequireAuth";
import Link from "next/link";

export default function Feed() {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [emptyReason, setEmptyReason] = useState("");

  useEffect(() => {
    async function fetchFeed() {
      try {
        // Try backend /feed endpoint first
        const res = await apiRequest("/feed");
        if (res.ok) {
          const data = await res.json();
          const arr = Array.isArray(data) ? data : data.blogs || [];
          if (arr.length > 0) {
            setBlogs(arr);
            return;
          }
        }

        // Fallback: build feed from following list
        const meRes = await apiRequest("/me");
        if (!meRes.ok) {
          setEmptyReason("Unable to load your account details.");
          return;
        }
        const me = await meRes.json();
        const uid = me?.id;
        if (!uid) {
          setEmptyReason("No user id found for your session.");
          return;
        }

        // Get following list
        let following = [];
        try {
          const rf = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/${uid}/following`, { cache: "no-store" });
          if (rf.ok) {
            const jf = await rf.json();
            following = Array.isArray(jf) ? jf : jf.following || jf.users || [];
          }
        } catch {}

        if (!following || following.length === 0) {
          setEmptyReason("You’re not following anyone yet.");
          setBlogs([]);
          return;
        }

        // Fetch posts for each followed user
        const ids = following
          .map((u) => u?.id ?? u?.user_id ?? u?.following_id ?? u?.followed_id)
          .filter(Boolean);

        const perAuthorPromises = ids.map(async (id) => {
          // Try user-specific blogs, then query by author_id
          const urls = [
            `${process.env.NEXT_PUBLIC_API_URL}/users/${id}/blogs`,
            `${process.env.NEXT_PUBLIC_API_URL}/blogs?author_id=${id}`,
          ];
          for (const url of urls) {
            try {
              const r = await fetch(url, { cache: "no-store" });
              if (r.ok) {
                const j = await r.json();
                const arr = Array.isArray(j) ? j : j.blogs || [];
                if (arr.length > 0) return arr;
              }
            } catch {}
          }
          return [];
        });

        const results = await Promise.all(perAuthorPromises);
        const combined = results.flat().filter(Boolean);

        // Deduplicate and sort by created_at desc
        const dedupMap = new Map();
        for (const b of combined) {
          if (b?.id && !dedupMap.has(b.id)) dedupMap.set(b.id, b);
        }
        const final = Array.from(dedupMap.values()).sort((a, b) => {
          const ta = new Date(a.created_at || 0).getTime();
          const tb = new Date(b.created_at || 0).getTime();
          return tb - ta;
        });

        setBlogs(final);
        if (final.length === 0) setEmptyReason("No recent posts from people you follow.");
      } catch (e) {
        console.error(e);
        setEmptyReason("Failed to load feed.");
      } finally {
        setLoading(false);
      }
    }

    fetchFeed();
  }, []);

  return (
    <RequireAuth>
    <div className="max-w-7xl mx-auto mt-20 px-6 py-10">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-white mb-4">Your Feed</h1>
        <p className="text-gray-400">Latest stories from people you follow.</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[var(--color-apple-green)]"></div>
        </div>
      ) : blogs.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {blogs.map((blog) => (
            <BlogCard key={blog.id} blog={blog} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-white/5 rounded-3xl border border-white/5">
          <p className="text-xl text-gray-400 mb-4">Your feed is empty.</p>
          <p className="text-gray-500 mb-2">{emptyReason || "Follow some authors to see their stories here!"}</p>
          <p className="text-gray-500 mb-8">Explore trending posts and start following creators you like.</p>
          <Link href="/" className="px-6 py-3 bg-white/10 rounded-full hover:bg-white/20 transition-colors text-white">Explore Trending</Link>
        </div>
      )}
    </div>
    </RequireAuth>
  );
}
