"use client";

import type { PasswordDialogMode } from "@/components/password-dialog";
import { getAccountBook, createAccountBook } from "@/apis/account-book";
import { PasswordDialog } from "@/components/password-dialog";
import { AccountCard } from "@/components/account-card";
import { UserSidebar } from "@/components/user-sidebar";
import { useAccountsStore } from "@/stores/accounts";
import { Button } from "@/components/ui/button";
import { hash, encrypt } from "@/utils/crypto";
import { Header } from "@/components/header";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { logout } from "@/apis/user";
import { Plus } from "lucide-react";

export default function HomePage() {
  const router = useRouter();
  const {
    items,
    password,
    decrypt,
    setPassword,
    setAccountBook,
    _hasHydrated,
  } = useAccountsStore();
  const [revealed, setRevealed] = useState<Record<string, boolean>>({});
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
  const [passwordDialogMode, setPasswordDialogMode] =
    useState<PasswordDialogMode>("setup");
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [encryptedData, setEncryptedData] = useState<string | null>(null);

  useEffect(() => {
    if (!_hasHydrated) return;

    const checkAccountBook = async () => {
      try {
        const res = await getAccountBook();

        if (res.success && res.data) {
          const data = res.data.data;
          setEncryptedData(data);
          setAccountBook(res.data.id, res.data.version);
          setPasswordDialogMode("unlock");
          if (password && data) {
            decrypt(data);
          } else {
            setPasswordDialogOpen(true);
          }
        } else {
          setPasswordDialogMode("setup");
          setPasswordDialogOpen(true);
        }
      } catch (e) {
        console.error("Failed to check account book:", e);
      }
    };

    checkAccountBook();
  }, [_hasHydrated, decrypt, password, setAccountBook]);

  const handlePasswordConfirm = async (password: string) => {
    setPasswordLoading(true);
    try {
      setPassword(password);
      if (passwordDialogMode === "setup") {
        const hashedPassword = await hash(password);
        const encryptedData = encrypt(
          JSON.stringify({
            accounts: [],
          }),
          password,
        );
        await createAccountBook({
          password: hashedPassword,
          data: encryptedData,
        });
        setPasswordDialogOpen(false);
      } else if (passwordDialogMode === "unlock" && encryptedData) {
        const success = decrypt(encryptedData);
        if (!success) {
          throw new Error("密码错误，解密失败");
        }
        setPasswordDialogOpen(false);
      }
    } catch (e) {
      throw e;
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      setSidebarOpen(false);
      router.replace("/auth/login");
    } catch (e) {
      console.error("Logout failed:", e);
    }
  };

  const toggleReveal = (id: string) => {
    setRevealed((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleSearch = () => {
    router.push("/search");
  };

  const handleEditAccount = (id: string) => {
    router.push(`/account/${id}/edit`);
  };

  const handleNewAccount = () => {
    router.push("/account/new");
  };

  return (
    <div className="min-h-screen bg-background">
      <Header
        onMenuClick={() => setSidebarOpen(true)}
        onSearchClick={handleSearch}
      />

      <div className="p-4 max-w-4xl mx-auto pb-20">
        <div className="space-y-2">
          {items.map((item) => (
            <AccountCard
              key={item.id}
              item={item}
              isRevealed={!!revealed[item.id]}
              onToggleReveal={toggleReveal}
              onClick={() => handleEditAccount(item.id)}
            />
          ))}
        </div>
      </div>

      <Button
        className="fixed bottom-6 right-6 rounded-full w-14 h-14 shadow-lg"
        size="lg"
        onClick={handleNewAccount}
      >
        <Plus className="w-6 h-6" />
      </Button>

      <UserSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onSignOut={handleLogout}
      />

      <PasswordDialog
        open={passwordDialogOpen}
        mode={passwordDialogMode}
        onConfirm={handlePasswordConfirm}
        loading={passwordLoading}
      />
    </div>
  );
}
