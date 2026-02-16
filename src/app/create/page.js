"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { apiRequest } from "@/lib/api";
import RequireAuth from "@/components/RequireAuth";
import Image from "next/image";

export default function CreateBlog() {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [files, setFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleFileChange = (e) => {
    const selected = Array.from(e.target.files || []);
    setFiles(selected);
    const urls = selected.map(f => ({ url: URL.createObjectURL(f), type: f.type }));
    setPreviews(urls);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title.trim() || !body.trim()) {
      setError("Title and body are required.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      // 1️⃣ Create blog (JSON)
      const blogRes = await apiRequest("/blogs", {
        method: "POST",
        body: JSON.stringify({
          title,
          body_text: body,
        }),
      });

      if (!blogRes.ok) {
        const err = await blogRes.json();
        throw new Error(err.error || "Failed to create blog");
      }

      const blogData = await blogRes.json();
      const blogId = blogData.blog_id;

      // Upload media if any
      if (files.length > 0) {
        const token = localStorage.getItem("access_token");
        for (const f of files) {
          const formData = new FormData();
          formData.append("file", f);
          const mediaRes = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/blogs/${blogId}/media`,
            {
              method: "POST",
              headers: { Authorization: `Bearer ${token}` },
              body: formData,
            },
          );
          if (!mediaRes.ok) {
            console.error("Media upload failed");
          }
        }
      }

      router.push("/");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };


  return (
    <RequireAuth>
    <div className="max-w-4xl mx-auto mt-20 p-6">
      <h1 className="text-4xl font-bold mb-8 text-white">Create New Story</h1>

      <div className="glass p-8 rounded-3xl border border-white/10">
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && <p className="text-red-500">{error}</p>}

          <div>
            <input
              type="text"
              placeholder="Title"
              className="w-full bg-transparent text-5xl font-bold text-white placeholder-gray-600 focus:outline-none border-b border-transparent focus:border-[var(--color-apple-green)] transition-all pb-2"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Media (Images or Videos)</label>
            <div className="space-y-3">
              <label className="cursor-pointer bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 px-4 py-2 rounded-lg transition-colors inline-flex items-center">
                <span>Select Files</span>
                <input
                  type="file"
                  accept="image/*,video/*"
                  multiple
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
              {previews.length > 0 && (
                <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
                  {previews.map((p, i) => {
                    const isVideo = (p.type || "").startsWith("video/");
                    return (
                      <div key={i} className="relative">
                        {isVideo ? (
                          <video className="h-20 w-full object-cover rounded-lg border border-white/20" muted>
                            <source src={p.url} />
                          </video>
                        ) : (
                          <Image src={p.url} alt="" width={80} height={80} unoptimized className="h-20 w-full object-cover rounded-lg border border-white/20" />
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          <div>
            <textarea
              placeholder="Tell your story..."
              className="w-full bg-transparent text-lg text-gray-300 placeholder-gray-600 focus:outline-none min-h-[400px] resize-y leading-relaxed"
              value={body}
              onChange={(e) => setBody(e.target.value)}
            />
          </div>

          <div className="flex justify-end pt-6 border-t border-white/5">
            <button
              type="submit"
              disabled={loading}
              className="bg-[var(--color-apple-green)] text-black font-bold px-8 py-3 rounded-full hover:bg-[var(--color-apple-green-hover)] transition-all transform hover:scale-105 shadow-[0_0_20px_rgba(76,201,54,0.3)] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Publishing..." : "Publish Story"}
            </button>
          </div>
        </form>
      </div>
    </div>
    </RequireAuth>
  );
}
