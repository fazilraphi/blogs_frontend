"use client";
 
import { useEffect } from "react";
 import { useRouter } from "next/navigation";
 
 export default function RequireAuth({ children }) {
   const router = useRouter();
 
   useEffect(() => {
    try {
      if (typeof window === "undefined") return;
      const token = window.localStorage?.getItem("access_token");
      if (!token) {
        router.replace("/login");
      }
    } catch {
      router.replace("/login");
    }
  }, [router]);

  return children;
 }
