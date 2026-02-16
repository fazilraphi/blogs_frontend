import Link from "next/link";

export default function BlogCard({ blog }) {
  return (
    <div className="border p-5 mb-4 rounded-lg shadow">
      <Link href={`/blog/${blog.id}`}>
        <h2 className="text-xl font-semibold hover:underline">{blog.title}</h2>
      </Link>

      <p className="text-gray-600 mb-2">{blog.body_text}</p>

      <p className="text-sm text-gray-400">By {blog.author.username}</p>

      <p className="text-sm text-gray-400">❤️ {blog.likes_count}</p>
    </div>
  );
}
