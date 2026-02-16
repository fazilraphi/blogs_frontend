"use client";

import { useRef, useState } from "react";
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
  const [coverIndex, setCoverIndex] = useState(0);
  const [dragActive, setDragActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef(null);

  const ingestFiles = (list) => {
    const selected = Array.from(list || []);
    if (selected.length === 0) return;
    const next = [...files, ...selected];
    setFiles(next);
    const urls = next.map((f) => ({ url: URL.createObjectURL(f), type: f.type }));
    setPreviews(urls);
    if (coverIndex >= next.length) setCoverIndex(0);
  };

  const handleFileChange = (e) => ingestFiles(e.target.files);
  const handleDragOver = (e) => {
    e.preventDefault();
    setDragActive(true);
  };
  const handleDragLeave = () => setDragActive(false);
  const handleDrop = (e) => {
    e.preventDefault();
    setDragActive(false);
    ingestFiles(e.dataTransfer.files);
  };
  const removeFile = (idx) => {
    const next = files.filter((_, i) => i !== idx);
    setFiles(next);
    const urls = next.map((f) => ({ url: URL.createObjectURL(f), type: f.type }));
    setPreviews(urls);
    if (coverIndex === idx) setCoverIndex(0);
    else if (coverIndex > idx) setCoverIndex((c) => c - 1);
  };
  const setAsCover = (idx) => setCoverIndex(idx);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (title.trim().length < 3) {
      setError("Title must be at least 3 characters.");
      return;
    }
    if (body.trim().length < 20) {
      setError("Body must be at least 20 characters.");
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

      // 2️⃣ Upload media in the chosen order (cover first)
      if (files.length > 0) {
        const token = localStorage.getItem("access_token");
        const ordered = [...files];
        if (coverIndex > 0 && coverIndex < ordered.length) {
          const [cover] = ordered.splice(coverIndex, 1);
          ordered.unshift(cover);
        }
        for (const f of ordered) {
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
      <div className="flex items-end justify-between mb-6">
        <h1 className="text-4xl font-bold text-white">Create New Story</h1>
        <span className="text-xs text-gray-500">{files.length} media selected</span>
      </div>

      <div className="glass p-8 rounded-3xl border border-white/10">
        <form onSubmit={handleSubmit} className="space-y-8">
          {error && (
            <div className="p-3 rounded-lg border border-red-500/30 bg-red-500/10 text-red-300 text-sm">
              {error}
            </div>
          )}

          <div>
            <input
              type="text"
              placeholder="Title"
              className="w-full bg-transparent text-5xl font-bold text-white placeholder-gray-600 focus:outline-none border-b border-transparent focus:border-[var(--color-apple-green)] transition-all pb-2"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            <div className="flex justify-end text-xs text-gray-500 mt-1">
              {title.trim().length} / 120
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Media</label>
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`rounded-2xl border-2 border-dashed ${
                dragActive ? "border-[var(--color-apple-green)] bg-[var(--color-apple-green)]/5" : "border-white/15"
              } p-6 text-center transition-colors`}
            >
              <p className="text-gray-400 mb-3">Drag & drop images/videos here</p>
              <div className="flex items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => inputRef.current?.click()}
                  className="px-4 py-2 bg-white/5 hover:bg-white/10 text-gray-300 border border-white/10 rounded-lg transition-colors"
                >
                  Select Files
                </button>
                {previews.length > 0 && (
                  <span className="text-xs text-gray-500">Click a thumbnail to set as cover</span>
                )}
              </div>
              <input
                ref={inputRef}
                type="file"
                accept="image/*,video/*"
                multiple
                onChange={handleFileChange}
                className="hidden"
              />
            </div>

            {previews.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mt-4">
                {previews.map((p, i) => {
                  const isVideo = (p.type || "").startsWith("video/");
                  const isCover = i === coverIndex;
                  return (
                    <div key={i} className="relative group">
                      {isVideo ? (
                        <video className="h-24 w-full object-cover rounded-lg border border-white/20" muted>
                          <source src={p.url} />
                        </video>
                      ) : (
                        <Image src={p.url} alt="" width={120} height={96} unoptimized className="h-24 w-full object-cover rounded-lg border border-white/20" />
                      )}
                      <div className="absolute inset-0 rounded-lg bg-black/0 group-hover:bg-black/30 transition-colors" />
                      <div className="absolute top-2 right-2 flex gap-2">
                        <button
                          type="button"
                          onClick={() => removeFile(i)}
                          className="text-xs px-2 py-1 rounded-full border border-white/20 bg-black/40 text-gray-200 hover:bg-black/60"
                          aria-label="Remove"
                        >
                          Remove
                        </button>
                      </div>
                      <button
                        type="button"
                        onClick={() => setAsCover(i)}
                        className="absolute left-2 bottom-2 text-[10px] px-2 py-1 rounded-full border border-white/20 bg-black/50 text-gray-200 hover:bg-black/70"
                        aria-label="Set as cover"
                      >
                        {isCover ? "Cover" : "Set Cover"}
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div>
            <textarea
              placeholder="Tell your story..."
              className="w-full bg-transparent text-lg text-gray-300 placeholder-gray-600 focus:outline-none min-h-[400px] resize-y leading-relaxed"
              value={body}
              onChange={(e) => setBody(e.target.value)}
            />
            <div className="flex justify-end text-xs text-gray-500 mt-1">
              {body.trim().split(/\s+/).filter(Boolean).length} words
            </div>
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
