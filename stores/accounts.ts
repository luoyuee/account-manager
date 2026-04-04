import { decrypt, encrypt } from "@/utils/crypto";
import { AccountItem, AccountBookData } from "@/types";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { updateAccountBook } from "@/apis/account-book";

type AccountsState = {
  items: AccountItem[];
  password?: string;
  accountBookId?: number;
  version: number;
  _hasHydrated: boolean;
  setHasHydrated: (state: boolean) => void;
  setPassword: (password: string) => void;
  setAccountBook: (id: number, version: number) => void;
  setItems: (items: AccountItem[]) => void;
  addItem: (item: AccountItem) => Promise<void>;
  updateItem: (id: string, patch: Partial<AccountItem>) => Promise<void>;
  removeItem: (id: string) => Promise<void>;
  sync: () => Promise<void>;
  encrypt: () => string | undefined;
  decrypt: (data: string) => boolean;
};

const initialItems: AccountItem[] = [];

export const useAccountsStore = create<AccountsState>()(
  persist(
    (set, get) => ({
      items: initialItems,
      password: undefined,
      accountBookId: undefined,
      version: 1,
      _hasHydrated: false,
      setHasHydrated: (state) => set({ _hasHydrated: state }),
      setPassword: (password) => set({ password }),
      setAccountBook: (id, version) => set({ accountBookId: id, version }),
      setItems: (items) => set({ items }),
      addItem: async (item) => {
        set((s) => ({ items: [item, ...s.items] }));
        await get().sync();
      },
      updateItem: async (id, patch) => {
        set((s) => ({
          items: s.items.map((it) => (it.id === id ? { ...it, ...patch } : it)),
        }));
        await get().sync();
      },
      removeItem: async (id) => {
        set((s) => ({ items: s.items.filter((it) => it.id !== id) }));
        await get().sync();
      },
      sync: async () => {
        const { accountBookId, version } = get();
        if (!accountBookId) return;

        const data = get().encrypt();
        if (!data) return;

        try {
          const res = await updateAccountBook({
            id: accountBookId,
            data,
            version,
          });
          if (res.success && res.data) {
            set({ version: res.data.version });
          }
        } catch (error) {
          console.error("同步账本数据失败:", error);
        }
      },
      encrypt: () => {
        const items = get().items;
        const pwd = get().password;

        console.log(items);

        if (!pwd) return undefined;

        return encrypt(
          JSON.stringify({
            accounts: items,
          }),
          pwd,
        );
      },
      decrypt: (data: string) => {
        const pwd = get().password;

        if (!pwd) return false;

        try {
          const decrypted = decrypt(data, pwd);
          console.log(decrypted);

          const decryptedData = JSON.parse(decrypted) as AccountBookData;
          console.log(decryptedData);

          set({ items: decryptedData.accounts });
          return true;
        } catch {
          return false;
        }
      },
    }),
    {
      name: "accounts-storage",
      storage: createJSONStorage(() => sessionStorage),
      partialize: (state) => ({ password: state.password }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    },
  ),
);
