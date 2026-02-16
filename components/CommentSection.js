"use client";

import { useEffect, useState } from "react";
import { apiRequest } from "@/lib/api";

export default function CommentSection({ blogId }) {
  const [comments, setComments] = useState([]);
  const [text, setText] = useState("");

  useEffect(() => {
    async function fetchComments() {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/blogs/${blogId}/comments`,
      );
      const data = await res.json();
      setComments(data.comments);
    }
    fetchComments();
  }, [blogId]);

  const handleComment = async () => {
    const res = await apiRequest(`/blogs/${blogId}/comments`, {
      method: "POST",
      body: JSON.stringify({ content: text }),
    });

    if (res.ok) {
      setText("");
      location.reload();
    }
  };

  return (
    <div className="mt-10 space-y-4">
      <h3 className="font-bold">Comments</h3>

      {comments.map((c) => (
        <div key={c.id} className="border p-3 rounded">
          <p className="text-sm text-gray-500">@{c.user.username}</p>
          <p>{c.content}</p>
        </div>
      ))}

      <textarea
        className="border p-2 w-full"
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      <button onClick={handleComment} className="bg-black text-white px-4 py-2">
        Comment
      </button>
    </div>
  );
}
