"use client";

import { useEffect, useMemo, useState } from "react";
import { apiRequest } from "@/lib/api";
import Image from "next/image";
import BlogCard from "./BlogCard";
import CommentSection from "./CommentSection";
import Link from "next/link";

export default function ProfileSelfPanel({ userId, initialUser }) {
  const [me, setMe] = useState(null);
  const [blogs, setBlogs] = useState([]);
  const [loadingBlogs, setLoadingBlogs] = useState(true);
  const [avatar, setAvatar] = useState(initialUser?.profile_image_url || "");
  const [uploading, setUploading] = useState(false);
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);
  const [loadingFollows, setLoadingFollows] = useState(false);
  const [showFollowers, setShowFollowers] = useState(false);
  const [showFollowing, setShowFollowing] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const r = await apiRequest("/me");
        if (r.ok) {
          const j = await r.json();
          setMe(j);
          if (!avatar && (j?.profile_image_url || j?.avatar_url)) {
            setAvatar(j.profile_image_url || j.avatar_url);
          }
        }
      } catch {}
    })();
  }, [avatar]);

  const isSelf = useMemo(() => !!(me?.id && String(me.id) === String(userId)), [me, userId]);

  useEffect(() => {
    if (!isSelf || !me?.id) return;
    (async () => {
      setLoadingFollows(true);
      try {
        const fs = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/${me.id}/followers`, { cache: "no-store" }).catch(() => null);
        const fg = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/${me.id}/following`, { cache: "no-store" }).catch(() => null);
        let f1 = [];
        let f2 = [];
        if (fs?.ok) {
          const j = await fs.json();
          f1 = Array.isArray(j) ? j : j.followers || j.users || [];
        }
        if (fg?.ok) {
          const j = await fg.json();
          f2 = Array.isArray(j) ? j : j.following || j.users || [];
        }
        setFollowers(f1);
        setFollowing(f2);
        setFollowersCount(f1.length || 0);
        setFollowingCount(f2.length || 0);
      } finally {
        setLoadingFollows(false);
      }
    })();
  }, [isSelf, me?.id]);

  useEffect(() => {
    if (!isSelf) return;
    (async () => {
      setLoadingBlogs(true);
      try {
        const uid = me?.id || userId || initialUser?.id;
        const filterMine = (arr) => {
          if (!Array.isArray(arr)) return [];
          return arr.filter((b) => {
            const aid = b?.author?.id ?? b?.user_id ?? b?.author_id ?? b?.userId;
            return uid ? String(aid) === String(uid) : true;
          });
        };
        let ok = false;
        try {
          const r1 = await apiRequest("/me/blogs");
          if (r1.ok) {
            const j1 = await r1.json();
            const arr1 = Array.isArray(j1) ? j1 : j1.blogs || [];
            setBlogs(filterMine(arr1));
            ok = true;
          }
        } catch {}
        if (!ok && me?.id) {
          try {
            const r2 = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/${me.id}/blogs`, { cache: "no-store" });
            if (r2.ok) {
              const j2 = await r2.json();
              const arr2 = Array.isArray(j2) ? j2 : j2.blogs || [];
              setBlogs(filterMine(arr2));
              ok = true;
            }
          } catch {}
        }
        if (!ok && me?.id) {
          try {
            const r3 = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/blogs?author_id=${me.id}`, { cache: "no-store" });
            if (r3.ok) {
              const j3 = await r3.json();
              const arr3 = Array.isArray(j3) ? j3 : j3.blogs || [];
              setBlogs(filterMine(arr3));
              ok = true;
            }
          } catch {}
        }
      } finally {
        setLoadingBlogs(false);
      }
    })();
  }, [isSelf, me?.id, userId, initialUser?.id]);

  const handleAvatar = async (e) => {
    if (!isSelf) return;
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const token = localStorage.getItem("access_token");
      const fd = new FormData();
      fd.append("file", file);
      const r = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/profile/image`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: fd,
      });
      if (r.ok) {
        const j = await r.json().catch(() => ({}));
        const url = j.profile_image_url || j.url;
        if (url) setAvatar(url);
        try {
          window.dispatchEvent(new CustomEvent("me-updated"));
        } catch {}
      }
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!isSelf) return;
    if (!confirm("Delete this post? This cannot be undone.")) return;
    try {
      const r = await apiRequest(`/blogs/${id}`, { method: "DELETE" });
      if (r.ok) {
        setBlogs((prev) => prev.filter((b) => b.id !== id));
      }
    } catch {}
  };

  const [openComments, setOpenComments] = useState({});
  const toggleComments = (id) =>
    setOpenComments((prev) => ({ ...prev, [id]: !prev[id] }));

  if (!isSelf) return null;

  return (
    <div className="space-y-8">
      <div className="glass p-6 rounded-2xl border border-white/10">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">Profile Setup</h3>
          {me?.username && <span className="text-sm text-gray-400">Signed in as {me.username}</span>}
        </div>
        <div className="flex items-center space-x-4">
          <div className="w-20 h-20 rounded-full overflow-hidden border border-white/10 bg-white/5 flex items-center justify-center">
            {avatar ? (
              <Image src={avatar} alt="avatar" width={80} height={80} unoptimized className="w-full h-full object-cover" />
            ) : (
              <span className="text-white/60 text-xl">{me?.username?.charAt(0)?.toUpperCase() || "U"}</span>
            )}
          </div>
          <label className="cursor-pointer bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 px-4 py-2 rounded-lg transition-colors inline-flex items-center">
            <span>{uploading ? "Uploading..." : "Change Photo"}</span>
            <input type="file" accept="image/*" onChange={handleAvatar} className="hidden" disabled={uploading} />
          </label>
        </div>
        <div className="flex items-center gap-3 mt-4 text-sm text-gray-400">
          <button
            type="button"
            onClick={() => setShowFollowers(true)}
            className="hover:text-white transition-colors"
            disabled={loadingFollows}
            aria-label="Followers"
          >
            {followersCount} Followers
          </button>
          <span>•</span>
          <button
            type="button"
            onClick={() => setShowFollowing(true)}
            className="hover:text-white transition-colors"
            disabled={loadingFollows}
            aria-label="Following"
          >
            {followingCount} Following
          </button>
        </div>
        <p className="text-sm text-gray-500 mt-2">Changing your photo updates immediately.</p>
      </div>

      <div className="glass p-6 rounded-2xl border border-white/10">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">My Blogs</h3>
        </div>
        {loadingBlogs ? (
          <div className="flex justify-center py-10">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-[var(--color-apple-green)]"></div>
          </div>
        ) : blogs.length === 0 ? (
          <div className="text-center text-gray-400 py-12">You haven’t written anything yet.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {blogs.map((b) => (
              <div key={b.id} className="space-y-3">
                <BlogCard blog={b} />
                <div className="flex items-center justify-between">
                  <button
                    onClick={() => toggleComments(b.id)}
                    className="text-sm text-gray-300 hover:text-white transition-colors px-3 py-1 rounded-full border border-white/10 hover:bg-white/10"
                  >
                    {openComments[b.id] ? "Hide Comments" : "Show Comments"}
                  </button>
                  <button
                    onClick={() => handleDelete(b.id)}
                    className="px-3 py-1.5 text-sm rounded-full border border-red-500/30 text-red-400 hover:bg-red-500/10"
                  >
                    Delete
                  </button>
                </div>
                {openComments[b.id] && (
                  <div className="glass p-4 rounded-xl border border-white/10">
                    <CommentSection blogId={b.id} />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {showFollowers && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="glass w-full max-w-md p-6 rounded-2xl border border-white/10">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-white font-semibold">Followers ({followersCount})</h4>
              <button onClick={() => setShowFollowers(false)} className="text-gray-400 hover:text-white text-sm">Close</button>
            </div>
            <div className="space-y-2 max-h-80 overflow-auto">
              {followers.length === 0 ? (
                <div className="text-gray-500 text-sm">No followers yet.</div>
              ) : (
                followers.map((u) => (
                  <Link key={u.id || u.user_id} href={`/profile/${u.id || u.user_id}`} className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 transition-colors">
                    <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-xs text-white/80">
                      {(u.username || u.name || "U").charAt(0).toUpperCase()}
                    </div>
                    <span className="text-gray-200 text-sm">{u.username || u.name || "Unknown"}</span>
                  </Link>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {showFollowing && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="glass w-full max-w-md p-6 rounded-2xl border border-white/10">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-white font-semibold">Following ({followingCount})</h4>
              <button onClick={() => setShowFollowing(false)} className="text-gray-400 hover:text-white text-sm">Close</button>
            </div>
            <div className="space-y-2 max-h-80 overflow-auto">
              {following.length === 0 ? (
                <div className="text-gray-500 text-sm">Not following anyone yet.</div>
              ) : (
                following.map((u) => (
                  <Link key={u.id || u.user_id} href={`/profile/${u.id || u.user_id}`} className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 transition-colors">
                    <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-xs text-white/80">
                      {(u.username || u.name || "U").charAt(0).toUpperCase()}
                    </div>
                    <span className="text-gray-200 text-sm">{u.username || u.name || "Unknown"}</span>
                  </Link>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
