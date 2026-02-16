import FollowButton from "@/components/FollowButton";
import BlogCard from "@/components/BlogCard";
import Image from "next/image";
import ProfileSelfPanel from "@/components/ProfileSelfPanel";

async function getUser(id) {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/${id}`, { cache: "no-store" });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

async function getList(url) {
  try {
    const r = await fetch(url, { cache: "no-store" });
    if (!r.ok) return [];
    const j = await r.json();
    return Array.isArray(j) ? j : j.users || j.followers || j.following || [];
  } catch {
    return [];
  }
}

async function getBlogs(id) {
  const urls = [
    `${process.env.NEXT_PUBLIC_API_URL}/users/${id}/blogs`,
    `${process.env.NEXT_PUBLIC_API_URL}/blogs?author_id=${id}`,
  ];
  for (const u of urls) {
    try {
      const r = await fetch(u, { cache: "no-store" });
      if (r.ok) {
        const j = await r.json();
        return Array.isArray(j) ? j : j.blogs || [];
      }
    } catch {}
  }
  return [];
}

export default async function ProfilePage({ params }) {
  const { id } = await params;
  const user = await getUser(id);
  const [followers, following, blogs] = user
    ? await Promise.all([
        getList(`${process.env.NEXT_PUBLIC_API_URL}/users/${id}/followers`),
        getList(`${process.env.NEXT_PUBLIC_API_URL}/users/${id}/following`),
        getBlogs(id),
      ])
    : [[], [], []];

  return (
    <div className="max-w-5xl mx-auto mt-24 px-6 pb-20">
      {user && (
        <div className="glass p-6 md:p-8 rounded-3xl border border-white/10 mb-10">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-5">
              <div className="w-20 h-20 rounded-full overflow-hidden border border-white/10 bg-white/5 flex items-center justify-center">
                {user.profile_image_url ? (
                  <Image src={user.profile_image_url} alt="avatar" width={80} height={80} unoptimized className="w-full h-full object-cover" />
                ) : (
                  <span className="text-2xl text-white/70">
                    {user.username?.charAt(0)?.toUpperCase() || "U"}
                  </span>
                )}
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">{user.username}</h1>
                {user.bio && <p className="text-gray-400 mt-1">{user.bio}</p>}
                <div className="flex items-center space-x-4 mt-3 text-sm text-gray-400">
                  <span>{followers.length} followers</span>
                  <span>•</span>
                  <span>{following.length} following</span>
                </div>
              </div>
            </div>
            <FollowButton userId={user.id} />
          </div>
        </div>
      )}

      <ProfileSelfPanel userId={id} initialUser={user} />

      {user && blogs.length > 0 ? (
        <div>
          <h2 className="text-xl font-semibold text-white mb-4">Posts by {user.username}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {blogs.map((b) => (
              <BlogCard key={b.id} blog={b} />
            ))}
          </div>
        </div>
      ) : user ? (
        <div className="text-gray-500 text-center py-20 bg-white/5 rounded-2xl border border-white/10">
          No posts yet.
        </div>
      ) : null}
    </div>
  );
}
