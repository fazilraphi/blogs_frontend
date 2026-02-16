"use client";
 
import { useEffect, useState } from "react";
 import { useRouter } from "next/navigation";
 
 export default function RequireAuth({ children }) {
   const router = useRouter();
  const [allowed] = useState(() => {
    try {
      if (typeof window === "undefined") return null;
      const token = localStorage.getItem("access_token");
      return !!token;
    } catch {
      return false;
    }
  });
 
   useEffect(() => {
    if (allowed === false) {
      router.replace("/login");
    }
  }, [router, allowed]);
 
  if (allowed === null) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[var(--color-apple-green)]"></div>
      </div>
    );
  }

  if (!allowed) return null;

  return children;
 }
