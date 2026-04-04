import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { LogOut, Users, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { UserRoleEnum } from "@/enums";
import { useUserStore } from "@/stores/user";

export type UserSidebarProps = {
  isOpen: boolean;
  onClose: () => void;
  onSignOut: () => void;
};

export function UserSidebar({ isOpen, onClose, onSignOut }: UserSidebarProps) {
  const router = useRouter();
  const { user } = useUserStore();
  const isAdmin = user?.role === UserRoleEnum.ADMIN;

  const handleUserManage = () => {
    onClose();
    router.push("/admin/users");
  };

  return (
    <Drawer
      open={isOpen}
      onOpenChange={(open) => !open && onClose()}
      direction="left"
    >
      <DrawerContent className="h-full top-0 right-auto left-0 bottom-0 mt-0 rounded-r-xl">
        <DrawerHeader className="flex flex-row items-center justify-between border-b pb-4">
          <DrawerTitle>用户信息</DrawerTitle>
          <DrawerClose asChild>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <X className="w-4 h-4" />
            </Button>
          </DrawerClose>
        </DrawerHeader>
        <div className="flex-1 p-4 flex flex-col space-y-4">
          <div className="flex flex-col space-y-1">
            <span className="text-muted-foreground text-sm">用户名</span>
            <span>{user?.username ?? "未登录"}</span>
          </div>

          <div className="flex flex-col space-y-1">
            <span className="text-muted-foreground text-sm">邮箱</span>
            <span>{user?.email ?? "未登录"}</span>
          </div>

          <div className="flex flex-col space-y-1">
            <span className="text-muted-foreground text-sm">User ID</span>
            <span className="text-sm truncate">{user?.id ?? "-"}</span>
          </div>
        </div>
        <DrawerFooter>
          {isAdmin && (
            <Button
              variant="outline"
              className="w-full"
              onClick={handleUserManage}
            >
              <Users className="w-4 h-4 mr-2" />
              用户管理
            </Button>
          )}
          <Button variant="outline" onClick={onSignOut} className="w-full">
            <LogOut className="w-4 h-4 mr-2" />
            退出登录
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
