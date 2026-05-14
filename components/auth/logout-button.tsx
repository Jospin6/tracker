"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function LogoutButton() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLogout = async () => {
    setIsSubmitting(true);
    await fetch("/api/auth/logout", {
      credentials: "include",
      method: "POST",
    }).catch(() => null);
    router.replace("/login");
  };

  return (
    <button
      type="button"
      onClick={handleLogout}
      disabled={isSubmitting}
      className="inline-flex items-center justify-center rounded-xl bg-black px-4 py-2.5 text-sm font-medium text-white ring-1 ring-white/10 transition hover:bg-white/6 disabled:cursor-not-allowed disabled:opacity-50"
    >
      {isSubmitting ? "Deconnexion..." : "Se deconnecter"}
    </button>
  );
}
