import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { getProfile } from "@/apis/user";

export interface UserInfo {
  id: string;
  username: string;
  nickname: string | null;
  email: string;
  avatar: string | null;
  role: number;
}

type UserState = {
  user: UserInfo | null;
  _hasHydrated: boolean;
  isLoading: boolean;
  setUser: (user: UserInfo | null) => void;
  clearUser: () => void;
  setHasHydrated: (state: boolean) => void;
  fetchUser: () => Promise<void>;
};

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      user: null,
      _hasHydrated: false,
      isLoading: false,
      setUser: (user) => set({ user }),
      clearUser: () => set({ user: null }),
      setHasHydrated: (state) => set({ _hasHydrated: state }),
      fetchUser: async () => {
        set({ isLoading: true });
        try {
          const res = await getProfile();
          if (res.success && res.data) {
            set({
              user: {
                id: res.data.id,
                username: res.data.username,
                nickname: res.data.nickname,
                email: res.data.email,
                avatar: res.data.avatar,
                role: Number(res.data.role),
              },
            });
          } else {
            set({ user: null });
          }
        } catch {
          set({ user: null });
        } finally {
          set({ isLoading: false });
        }
      },
    }),
    {
      name: "user-storage",
      storage: createJSONStorage(() => sessionStorage),
      partialize: (state) => ({ user: state.user }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    },
  ),
);
