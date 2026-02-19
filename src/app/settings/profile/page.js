"use client";

export const dynamic = "force-dynamic";

import { Suspense } from "react";
import ProfileSettingsContent from "./ProfileSettingsContent";

export default function ProfileSettingsPage() {
  return (
    <Suspense fallback={<div className="text-white p-10">Loading...</div>}>
      <ProfileSettingsContent />
    </Suspense>
  );
}
