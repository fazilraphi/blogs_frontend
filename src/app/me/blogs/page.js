 "use client";
 
 import { useEffect, useState } from "react";
 import Link from "next/link";
 import { apiRequest } from "@/lib/api";
 import RequireAuth from "@/components/RequireAuth";
 
 export default function MyBlogs() {
   const [blogs, setBlogs] = useState([]);
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState("");
   const [deleting, setDeleting] = useState(null);
 
   useEffect(() => {
     async function load() {
       setLoading(true);
       try {
        let uid = null;
        try {
          const meRes = await apiRequest("/me");
          if (meRes.ok) {
            const me = await meRes.json();
            uid = me?.id ?? null;
          }
        } catch {}
        const res = await apiRequest("/me/blogs");
        if (res.ok) {
          const data = await res.json();
          const arr = Array.isArray(data) ? data : data.blogs || [];
          const filtered = uid
            ? arr.filter((b) => {
                const aid = b?.author?.id ?? b?.user_id ?? b?.author_id ?? b?.userId;
                return String(aid) === String(uid);
              })
            : arr;
          setBlogs(filtered);
        } else {
          setError("Failed to load your blogs");
        }
       } catch (e) {
         setError("Failed to load your blogs");
       } finally {
         setLoading(false);
       }
     }
     load();
   }, []);
 
   const handleDelete = async (id) => {
     if (!confirm("Delete this blog? This action cannot be undone.")) return;
     setDeleting(id);
     try {
       const res = await apiRequest(`/blogs/${id}`, { method: "DELETE" });
       if (res.ok) {
         setBlogs((prev) => prev.filter((b) => b.id !== id));
       } else {
         alert("Failed to delete");
       }
     } catch {
       alert("Failed to delete");
     } finally {
       setDeleting(null);
     }
   };
 
  return (
    <RequireAuth>
    <div className="max-w-7xl mx-auto mt-24 px-6 pb-20">
       <div className="flex items-end justify-between mb-8">
         <div>
           <h1 className="text-3xl md:text-4xl font-bold text-white">My Blogs</h1>
           <p className="text-gray-400 mt-2">Manage posts you have published.</p>
         </div>
         <Link href="/create" className="px-5 py-2 bg-[var(--color-apple-green)] text-black rounded-full font-semibold hover:bg-[var(--color-apple-green-hover)] transition-all">
           Create New
         </Link>
       </div>
 
       {loading ? (
         <div className="flex justify-center py-20">
           <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[var(--color-apple-green)]"></div>
         </div>
       ) : error ? (
         <div className="text-red-400">{error}</div>
       ) : blogs.length === 0 ? (
         <div className="text-center py-20 bg-white/5 rounded-3xl border border-white/5">
           <p className="text-xl text-gray-400 mb-4">You haven’t written anything yet.</p>
           <Link href="/create" className="px-6 py-3 bg-white/10 rounded-full hover:bg-white/20 transition-colors text-white">Start Writing</Link>
         </div>
       ) : (
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
           {blogs.map((blog) => (
             <div key={blog.id} className="group glass p-6 rounded-2xl border border-white/5 hover:border-[var(--color-apple-green)]/40 transition-all">
               <Link href={`/blog/${blog.id}`}>
                 <h2 className="text-xl font-semibold text-white group-hover:text-[var(--color-apple-green)] transition-colors line-clamp-2">
                   {blog.title}
                 </h2>
               </Link>
               <p className="text-gray-400 mt-2 line-clamp-3">{blog.description || blog.body_text}</p>
               <div className="flex justify-between items-center pt-4 mt-4 border-t border-white/10">
                 <span className="text-xs text-gray-500">{new Date(blog.created_at).toLocaleDateString()}</span>
                 <button
                   onClick={() => handleDelete(blog.id)}
                   disabled={deleting === blog.id}
                   className="px-3 py-1.5 text-sm rounded-full border border-red-500/30 text-red-400 hover:bg-red-500/10 transition-colors disabled:opacity-60"
                 >
                   {deleting === blog.id ? "Deleting..." : "Delete"}
                 </button>
               </div>
             </div>
           ))}
         </div>
       )}
    </div>
    </RequireAuth>
   );
 }
