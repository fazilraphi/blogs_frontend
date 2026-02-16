import LikeButton from "@/components/LikeButton";
import CommentSection from "@/components/CommentSection";
import FollowButton from "@/components/FollowButton";
import Image from "next/image";

async function getBlog(id) {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/blogs/${id}`, {
      cache: "no-store",
    });
    if (!res.ok) return null;
    return res.json();
  } catch (e) {
    return null;
  }
}

export default async function BlogDetail({ params }) {
  const { id } = await params; // Await params in newer Next.js versions if needed, or just params.id depending on version. safe to await.
  const blog = await getBlog(id);

  if (!blog) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        Blog not found.
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto mt-24 px-6 pb-20">
      <div className="mb-8">
        <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">{blog.title}</h1>

        <div className="flex items-center justify-between py-6 border-y border-white/10">
          <div className="flex items-center space-x-4">
            <div className="h-12 w-12 rounded-full bg-gradient-to-tr from-[var(--color-apple-green)] to-blue-500 flex items-center justify-center text-black font-bold text-xl">
              {blog.author?.username?.charAt(0).toUpperCase() || "U"}
            </div>
            <div>
              <p className="text-white font-medium text-lg">{blog.author?.username}</p>
              {blog.created_at && (
                <p className="text-gray-500 text-sm">{new Date(blog.created_at).toLocaleDateString()}</p>
              )}
            </div>
          </div>

          <FollowButton userId={blog.author?.id} />
        </div>
      </div>

      {Array.isArray(blog.media) && blog.media.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
          {blog.media.map((m) => (
            <div key={m.id} className="overflow-hidden rounded-2xl border border-white/10">
              {m.type === "image" ? (
                <Image src={m.url} alt="" width={800} height={256} unoptimized className="w-full h-64 object-cover" />
              ) : (
                <video controls className="w-full h-64 object-cover">
                  <source src={m.url} />
                </video>
              )}
            </div>
          ))}
        </div>
      )}

      <article className="prose prose-invert prose-lg max-w-none mb-12 text-gray-300 leading-relaxed">
        {blog.body_text?.split('\n').map((paragraph, idx) => (
          paragraph ? <p key={idx} className="mb-4">{paragraph}</p> : <br key={idx} />
        ))}
      </article>

      <div className="flex items-center space-x-6 py-8 border-t border-white/10">
        <LikeButton blogId={blog.id} initialLikes={blog.likes_count} />
      </div>

      <CommentSection blogId={blog.id} />
    </div>
  );
}
