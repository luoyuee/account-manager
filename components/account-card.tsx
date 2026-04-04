import type { AccountItem } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import { Copy, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

const maskMiddle = (str: string, visibleChars: number = 2): string => {
  if (!str || str.length <= visibleChars * 2) return str;
  const start = str.slice(0, visibleChars);
  const end = str.slice(-visibleChars);
  const middleLength = str.length - visibleChars * 2;
  const masked = "*".repeat(Math.min(middleLength, 4));
  return `${start}${masked}${end}`;
};

const copyText = async (text: string) => {
  try {
    await navigator.clipboard.writeText(text);
    toast.success("已复制", {
      position: "top-center",
    });
  } catch {
    toast.error("复制失败", {
      position: "top-center",
    });
  }
};

export type AccountCardProps = {
  item: AccountItem;
  isRevealed: boolean;
  onToggleReveal: (id: string) => void;
  onClick?: () => void;
};

export function AccountCard({
  item,
  isRevealed,
  onToggleReveal,
  onClick,
}: AccountCardProps) {
  const maskedUsername = maskMiddle(item.username, 2);

  return (
    <Card
      className="mb-3 cursor-pointer hover:ring-1 hover:ring-primary/20 transition-shadow"
      onClick={onClick}
    >
      <CardContent className=" space-y-3">
        <div className="flex items-center justify-between">
          <span className="font-medium text-base">{item.title}</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onToggleReveal(item.id);
            }}
          >
            {isRevealed ? (
              <EyeOff className="w-4 h-4" />
            ) : (
              <Eye className="w-4 h-4" />
            )}
          </Button>
        </div>

        <div className="flex items-center">
          <span className="text-muted-foreground mr-2">账号：</span>
          <span>{isRevealed ? item.username : maskedUsername}</span>
          <Button
            variant="ghost"
            size="sm"
            className="ml-2 h-6 w-6 p-0"
            onClick={(e) => {
              e.stopPropagation();
              copyText(item.username);
            }}
          >
            <Copy className="w-3 h-3" />
          </Button>
        </div>

        <div className="flex items-center">
          <span className="text-muted-foreground mr-2">密码：</span>
          <span>{isRevealed ? item.password : "••••••••"}</span>
          <Button
            variant="ghost"
            size="sm"
            className="ml-2 h-6 w-6 p-0"
            onClick={(e) => {
              e.stopPropagation();
              copyText(item.password);
            }}
          >
            <Copy className="w-3 h-3" />
          </Button>
        </div>

        {item.remark && (
          <div className="flex items-start">
            <span className="text-muted-foreground mr-2">备注：</span>
            <span>{item.remark}</span>
          </div>
        )}

        {item.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {item.tags.map((tag) => (
              <Badge key={tag} variant="secondary">
                {tag}
              </Badge>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
