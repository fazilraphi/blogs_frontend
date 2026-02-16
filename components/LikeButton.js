"use client";

import { useState } from "react";
import { apiRequest } from "@/lib/api";

export default function LikeButton({ blogId }) {
  const [liked, setLiked] = useState(false);
  const [count, setCount] = useState(0);

  const handleLike = async () => {
    setLiked(!liked);
    setCount((prev) => (liked ? prev - 1 : prev + 1));

    await apiRequest(`/blogs/${blogId}/like`, {
      method: "POST",
    });
  };

  return (
    <button
      onClick={handleLike}
      className="bg-pink-500 text-white px-4 py-2 rounded"
    >
      ❤️ {count}
    </button>
  );
}
