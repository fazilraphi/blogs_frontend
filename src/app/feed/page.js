"use client";

import { useEffect, useState } from "react";
import { apiRequest } from "@/lib/api";
import BlogCard from "@/components/BlogCard";
import RequireAuth from "@/components/RequireAuth";
import Link from "next/link";

export default function Feed() {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchFeed() {
      try {
        const res = await apiRequest("/feed");
        if (res.ok) {
          const data = await res.json();
          setBlogs(data.blogs || []);
        }
      } catch (e) {
        console.error(e);
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
          <p className="text-gray-500 mb-8">Follow some authors to see their stories here!</p>
          <Link href="/" className="px-6 py-3 bg-white/10 rounded-full hover:bg-white/20 transition-colors text-white">Explore Trending</Link>
        </div>
      )}
    </div>
    </RequireAuth>
  );
}
