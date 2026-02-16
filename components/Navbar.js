"use client";

import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="flex justify-between items-center p-4 shadow">
      <Link href="/" className="text-xl font-bold">
        Blig
      </Link>

      <div className="space-x-4">
        <Link href="/create">Create</Link>
        <Link href="/login">Login</Link>
        <Link href="/register">Register</Link>
      </div>
    </nav>
  );
}
