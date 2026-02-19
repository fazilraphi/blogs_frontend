"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiRequest } from "@/lib/api";
import RequireAuth from "@/components/RequireAuth";
import Image from "next/image";

export default function ProfileSettingsContent() {
  const router = useRouter();

  const [onboarding, setOnboarding] = useState(false);

  const [form, setForm] = useState({
    username: "",
    bio: "",
  });

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [uploading, setUploading] = useState(false);
  const [avatar, setAvatar] = useState("");

  // ✅ Read query param safely on client
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setOnboarding(params.get("onboarding") === "1");
  }, []);

  // ✅ Load user data
  useEffect(() => {
    async function loadMe() {
      setLoading(true);
      try {
        const res = await apiRequest("/me");
        if (res.ok) {
          const data = await res.json();
          setForm({
            username: data.username || "",
            bio: data.bio || "",
          });
          setAvatar(data.profile_image_url || data.avatar_url || "");
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }

    loadMe();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const res = await apiRequest(`/me`, {
        method: "PATCH",
        body: JSON.stringify(form),
      });

      if (res.ok) {
        setSuccess("Profile updated");
        window.dispatchEvent(new CustomEvent("me-updated"));

        if (onboarding) {
          router.push("/feed");
        }
      } else {
        const data = await res.json().catch(() => ({}));
        setError(data.error || "Failed to update profile");
      }
    } catch {
      setError("Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const handleImage = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError("");

    try {
      const token = localStorage.getItem("access_token");
      const fd = new FormData();
      fd.append("file", file);

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/profile/image`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: fd,
        },
      );

      if (res.ok) {
        const data = await res.json().catch(() => ({}));
        const url = data.profile_image_url || data.url;
        if (url) setAvatar(url);

        setSuccess("Profile image updated");
        window.dispatchEvent(new CustomEvent("me-updated"));
      } else {
        setError("Failed to upload image");
      }
    } catch {
      setError("Failed to upload image");
    } finally {
      setUploading(false);
    }
  };

  return (
    <RequireAuth>
      <div className="max-w-2xl mx-auto mt-24 px-6 pb-20">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-white">
            {onboarding ? "Set up your profile" : "Profile settings"}
          </h1>
          <p className="text-gray-400 mt-2">
            Personalize how your profile appears across Blig.
          </p>
        </div>

        <form
          onSubmit={handleSave}
          className="glass p-6 md:p-8 rounded-2xl border border-white/10 space-y-6"
        >
          {loading ? (
            <div className="text-gray-400">Loading...</div>
          ) : (
            <>
              {error && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-3 rounded-lg text-sm">
                  {error}
                </div>
              )}

              {success && (
                <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-3 rounded-lg text-sm">
                  {success}
                </div>
              )}

              <div className="flex items-center space-x-4">
                <div className="w-20 h-20 rounded-full overflow-hidden border border-white/10 bg-white/5 flex items-center justify-center">
                  {avatar ? (
                    <Image
                      src={avatar}
                      alt="avatar"
                      width={80}
                      height={80}
                      unoptimized
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-white/60 text-xl">
                      {form.username?.charAt(0)?.toUpperCase() || "U"}
                    </span>
                  )}
                </div>

                <label className="cursor-pointer bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 px-4 py-2 rounded-lg transition-colors inline-flex items-center">
                  <span>{uploading ? "Uploading..." : "Change Photo"}</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImage}
                    className="hidden"
                    disabled={uploading}
                  />
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Username
                </label>
                <input
                  value={form.username}
                  onChange={(e) =>
                    setForm({ ...form, username: e.target.value })
                  }
                  className="w-full bg-black/30 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-[var(--color-apple-green)] focus:ring-1 focus:ring-[var(--color-apple-green)]"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Bio
                </label>
                <textarea
                  value={form.bio}
                  onChange={(e) => setForm({ ...form, bio: e.target.value })}
                  className="w-full min-h-[120px] bg-black/30 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-[var(--color-apple-green)] focus:ring-1 focus:ring-[var(--color-apple-green)] resize-y"
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-3 bg-[var(--color-apple-green)] text-black font-semibold rounded-xl disabled:opacity-60"
                >
                  {onboarding ? "Continue" : "Save changes"}
                </button>

                {!onboarding && (
                  <button
                    type="button"
                    onClick={() => router.back()}
                    className="px-6 py-3 border border-white/15 text-white rounded-xl"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </>
          )}
        </form>
      </div>
    </RequireAuth>
  );
}
