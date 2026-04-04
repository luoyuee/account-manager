"use client";

import { AccountCard } from "@/components/account-card";
import { useAccountsStore } from "@/stores/accounts";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { useState } from "react";

export default function SearchPage() {
  const router = useRouter();
  const { items } = useAccountsStore();
  const [keyword, setKeyword] = useState("");
  const [revealed, setRevealed] = useState<Record<string, boolean>>({});

  const toggleReveal = (id: string) => {
    setRevealed((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleEditAccount = (id: string) => {
    router.push(`/account/${id}`);
  };

  const filteredItems = items.filter((item) => {
    if (!keyword) return true;
    const lowerKeyword = keyword.toLowerCase();
    return (
      item.title.toLowerCase().includes(lowerKeyword) ||
      item.username.toLowerCase().includes(lowerKeyword) ||
      item.remark?.toLowerCase().includes(lowerKeyword) ||
      item.tags.some((tag) => tag.toLowerCase().includes(lowerKeyword))
    );
  });

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60 border-b">
        <div className="max-w-4xl mx-auto flex h-14 items-center gap-3 px-4">
          <Button variant="ghost" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <Input
            type="search"
            placeholder="搜索账号、标题、标签..."
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            className="flex-1"
            autoFocus
          />
        </div>
      </header>

      <div className="p-4 max-w-4xl mx-auto">
        {filteredItems.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">
            {keyword ? "未找到匹配的账号" : "暂无账号数据"}
          </p>
        ) : (
          <div className="space-y-2">
            {filteredItems.map((item) => (
              <AccountCard
                key={item.id}
                item={item}
                isRevealed={!!revealed[item.id]}
                onToggleReveal={toggleReveal}
                onClick={() => handleEditAccount(item.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
