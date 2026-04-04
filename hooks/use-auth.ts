"use client";

import { useEffect } from "react";
import { useUserStore } from "@/stores/user";

export function useAuth() {
  const user = useUserStore((state) => state.user);
  const isLoading = useUserStore((state) => state.isLoading);
  const hasHydrated = useUserStore((state) => state._hasHydrated);
  const fetchUser = useUserStore((state) => state.fetchUser);

  useEffect(() => {
    if (hasHydrated && !user && !isLoading) {
      fetchUser();
    }
  }, [hasHydrated, user, isLoading, fetchUser]);

  return {
    user,
    isLoading: isLoading || !hasHydrated,
    isAuthenticated: !!user,
  };
}
