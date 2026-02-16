"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { apiRequest } from "@/lib/api";

export default function MyProfileRedirect() {
  const router = useRouter();
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const r = await apiRequest("/me");
        if (r.ok) {
          const me = await r.json();
          if (!cancelled && me?.id) {
            router.replace(`/profile/${me.id}`);
          }
        } else {
          router.replace("/login");
        }
      } catch {
        router.replace("/login");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[var(--color-apple-green)]"></div>
    </div>
  );
}
