"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { isLoggedIn, logout } from "@/lib/auth";
import { apiRequest } from "@/lib/api";

export default function Navbar() {
  const pathname = usePathname();
  const [loggedIn, setLoggedIn] = useState(false);
  const [me, setMe] = useState(null);

  const isActive = (path) => pathname === path;

  useEffect(() => {
    const check = () => setLoggedIn(isLoggedIn());
    check();
    async function loadMe() {
      try {
        const r = await apiRequest("/me");
        if (r.ok) setMe(await r.json());
      } catch {}
    }
    if (isLoggedIn()) loadMe();
    const onStorage = (e) => {
      if (e.key === "access_token") check();
    };
    const onMeUpdated = () => loadMe();
    window.addEventListener("storage", onStorage);
    window.addEventListener("me-updated", onMeUpdated);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("me-updated", onMeUpdated);
    };
  }, []);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-white/10 px-6 py-4 flex justify-between items-center transition-all duration-300">
      <Link href="/" className="text-2xl font-bold tracking-tighter hover:scale-105 transition-transform">
        <span className="text-white">Blig</span><span className="text-[var(--color-apple-green)]">.</span>
      </Link>

      <div className="hidden md:flex space-x-8 items-center">
        {(
          loggedIn
            ? [
                { name: "Home", path: "/" },
                { name: "Create", path: "/create" },
                { name: "Feed", path: "/feed" },
              { name: "Profile", path: "/profile/me" },
                { name: "My Blogs", path: "/me/blogs" },
                { name: "Profile Setup", path: "/settings/profile" },
              ]
            : [
                { name: "Home", path: "/" },
                { name: "Feed", path: "/feed" },
              ]
        ).map((link) => (
          <Link
            key={link.path}
            href={link.path}
            className={`text-sm font-medium transition-colors hover:text-[var(--color-apple-green)] ${
              isActive(link.path) ? "text-[var(--color-apple-green)]" : "text-gray-400"
            }`}
          >
            {link.name}
          </Link>
        ))}
      </div>

      {loggedIn ? (
        <div className="flex items-center space-x-3">
          <Link href="/settings/profile" className="flex items-center space-x-2 group">
            <div className="w-8 h-8 rounded-full overflow-hidden border border-white/10 bg-white/5 flex items-center justify-center">
              {me?.profile_image_url || me?.avatar_url ? (
                <Image src={me.profile_image_url || me.avatar_url} alt="me" width={32} height={32} unoptimized className="w-full h-full object-cover" />
              ) : (
                <span className="text-xs text-white/70">
                  {me?.username?.charAt(0)?.toUpperCase() || "U"}
                </span>
              )}
            </div>
            <span className="text-sm text-gray-300 group-hover:text-white transition-colors hidden md:inline">
              {me?.username || "Profile"}
            </span>
          </Link>
          <button
            onClick={logout}
            className="px-4 py-2 text-sm text-gray-300 hover:text-white transition-colors border border-white/10 rounded-full hover:bg-white/10"
          >
            Logout
          </button>
        </div>
      ) : (
        <div className="flex items-center space-x-4">
          <Link href="/login" className="px-4 py-2 text-sm text-gray-300 hover:text-white transition-colors">
            Login
          </Link>
          <Link
            href="/register"
            className="px-5 py-2 text-sm font-semibold text-black bg-[var(--color-apple-green)] rounded-full hover:bg-[var(--color-apple-green-hover)] hover:shadow-[0_0_20px_rgba(76,201,54,0.4)] transition-all transform hover:scale-105"
          >
            Get Started
          </Link>
        </div>
      )}
    </nav>
  );
}
