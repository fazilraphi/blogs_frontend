import Link from "next/link";
import BlogCard from "@/components/BlogCard";
import RequireAuth from "@/components/RequireAuth";

export const metadata = {
  title: "Blig. - The Future of Blogging",
  description: "Join the next generation of content creators on Blig.",
};

async function getBlogs() {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/blogs`, {
      cache: "no-store",
    });
    if (!res.ok) return [];
    const data = await res.json();
    return data.blogs || [];
  } catch (e) {
    console.error("Failed to fetch blogs", e);
    return [];
  }
}

export default async function Home() {
  const blogs = await getBlogs();

  return (
    <RequireAuth>
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-6 text-center overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--color-apple-green)_0%,_transparent_70%)] opacity-10 blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-4xl mx-auto space-y-6">
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-white mb-6">
            Share your thoughts <br />
            <span className="text-gradient">with the world.</span>
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed">
            Blig is a modern platform for writers, thinkers, and creators.
            Experience a new way of blogging with a design that inspires.
          </p>

          <div className="flex justify-center gap-4 pt-8">
            <Link href="/create" className="px-8 py-3 bg-[var(--color-apple-green)] text-black font-bold rounded-full hover:scale-105 transition-transform shadow-[0_0_20px_rgba(76,201,54,0.3)]">
              Start Writing
            </Link>
            <Link href="/feed" className="px-8 py-3 glass text-white font-medium rounded-full hover:bg-white/10 transition-colors border border-white/10">
              Read Feed
            </Link>
          </div>
        </div>
      </section>

      {/* Blog Grid */}
      <section className="max-w-7xl mx-auto px-6 py-16">
        <div className="flex justify-between items-end mb-12">
          <h2 className="text-3xl font-bold text-white">Trending Posts</h2>
          <Link href="/feed" className="text-[var(--color-apple-green)] hover:underline text-sm font-medium">
            View all &rarr;
          </Link>
        </div>

        {blogs.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {blogs.map((blog) => (
              <BlogCard key={blog.id} blog={blog} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 text-gray-500">
            <p>No blogs found. Be the first to write one!</p>
          </div>
        )}
      </section>
    </div>
    </RequireAuth>
  );
}
