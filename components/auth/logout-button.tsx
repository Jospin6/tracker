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
    router.replace("/auth/login");
  };

  return (
    <button
      type="button"
      onClick={handleLogout}
      disabled={isSubmitting}
      className="app-button-secondary hover:border-white/20 hover:bg-white/8"
    >
      {isSubmitting ? "Deconnexion..." : "Se deconnecter"}
    </button>
  );
}
