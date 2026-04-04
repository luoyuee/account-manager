import { Button } from "@/components/ui/button";
import { Menu, Search } from "lucide-react";

export type HeaderProps = {
  onMenuClick: () => void;
  onSearchClick: () => void;
};

export function Header({ onMenuClick, onSearchClick }: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60 border-b">
      <div className="max-w-4xl mx-auto flex h-14 items-center justify-between px-4">
        <Button variant="ghost" size="sm" onClick={onMenuClick}>
          <Menu className="w-5 h-5" />
        </Button>
        <h1 className="font-medium">账户管理</h1>
        <Button variant="ghost" size="sm" onClick={onSearchClick}>
          <Search className="w-5 h-5" />
        </Button>
      </div>
    </header>
  );
}
