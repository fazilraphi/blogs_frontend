import Link from "next/link";
import Image from "next/image";

export default function BlogCard({ blog }) {
    const media = Array.isArray(blog.media) ? blog.media : [];
    const hero = media[0];
    return (
        <div className="group relative glass rounded-2xl border border-white/5 hover:border-[var(--color-apple-green)]/50 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_10px_30px_-10px_rgba(76,201,54,0.15)] overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-apple-green)]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
            {hero?.type === "image" && hero?.url && (
                <Link href={`/blog/${blog.id}`}>
                    <Image
                        src={hero.url}
                        alt={blog.title}
                        width={800}
                        height={192}
                        unoptimized
                        className="w-full h-48 object-cover"
                    />
                </Link>
            )}
            {hero?.type === "video" && (
                <div className="w-full h-48 bg-black/60 flex items-center justify-center text-gray-400 text-sm">
                    <span>Video</span>
                </div>
            )}

            <div className="relative z-10 p-6">
                <div className="flex justify-between items-start mb-4">
                    <span className="text-xs font-medium text-[var(--color-apple-green)] bg-[var(--color-apple-green)]/10 px-2 py-1 rounded-full border border-[var(--color-apple-green)]/20">
                        Article
                    </span>
                    {blog.created_at && (
                        <span className="text-xs text-gray-500">
                            {new Date(blog.created_at).toLocaleDateString()}
                        </span>
                    )}
                </div>

                <Link href={`/blog/${blog.id}`}>
                    <h2 className="text-2xl font-bold mb-3 text-white group-hover:text-[var(--color-apple-green)] transition-colors line-clamp-2">
                        {blog.title}
                    </h2>
                </Link>

                <p className="text-gray-400 mb-6 line-clamp-3 text-sm leading-relaxed">
                    {blog.description || blog.body_text?.substring(0, 150) || "No description available."}...
                </p>

                <div className="flex items-center justify-between border-t border-white/5 pt-4 mt-auto">
                    <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 rounded-full overflow-hidden border border-white/10 bg-white/5 flex items-center justify-center">
                            {(
                                blog.author?.profile_image_url ||
                                blog.author?.avatar_url ||
                                blog.author_image_url ||
                                blog.authorAvatarUrl ||
                                blog.user?.profile_image_url
                            ) ? (
                                <Image
                                    src={
                                        blog.author?.profile_image_url ||
                                        blog.author?.avatar_url ||
                                        blog.author_image_url ||
                                        blog.authorAvatarUrl ||
                                        blog.user?.profile_image_url
                                    }
                                    alt="author"
                                    width={32}
                                    height={32}
                                    unoptimized
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <span className="text-xs font-bold text-white bg-gradient-to-tr from-gray-700 to-gray-600 w-full h-full flex items-center justify-center">
                                    {blog.author?.username?.charAt(0).toUpperCase() || "U"}
                                </span>
                            )}
                        </div>
                        <span className="text-sm text-gray-300 group-hover:text-white transition-colors">
                            {blog.author?.username || "Anonymous"}
                        </span>
                    </div>

                    <div className="flex items-center space-x-4 text-xs font-medium text-gray-500">
                        <span className="flex items-center hover:text-[var(--color-apple-green)] transition-colors">
                            ❤️ {blog.likes_count || 0}
                        </span>
                        <span className="flex items-center hover:text-blue-400 transition-colors">
                            💬 {blog.comments_count || 0}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}
