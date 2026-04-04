"use client";

import { exportPlainJson, exportEncryptedJson } from "@/utils/account-data";
import { LogOut, Users, X, Download, Upload } from "lucide-react";
import { useAccountsStore } from "@/stores/accounts";
import { Button } from "@/components/ui/button";
import { useUserStore } from "@/stores/user";
import { useRouter } from "next/navigation";
import { UserRoleEnum } from "@/enums";
import { useState } from "react";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export type UserSidebarProps = {
  isOpen: boolean;
  onClose: () => void;
  onSignOut: () => void;
};

export function UserSidebar({ isOpen, onClose, onSignOut }: UserSidebarProps) {
  const router = useRouter();
  const { user } = useUserStore();
  const { items, password } = useAccountsStore();
  const isAdmin = user?.role === UserRoleEnum.ADMIN;
  const [exportDialogOpen, setExportDialogOpen] = useState(false);

  const handleUserManage = () => {
    onClose();
    router.push("/admin/users");
  };

  const handleImport = () => {
    onClose();
    router.push("/import");
  };

  const handleExportPlain = () => {
    exportPlainJson(items);
    setExportDialogOpen(false);
  };

  const handleExportEncrypted = () => {
    if (!password) {
      alert("无法导出密文：未设置加密密码");
      return;
    }
    const success = exportEncryptedJson(items, password);
    if (!success) {
      alert("加密失败");
      return;
    }
    setExportDialogOpen(false);
  };

  return (
    <>
      <Drawer
        open={isOpen}
        onOpenChange={(open) => !open && onClose()}
        direction="left"
      >
        <DrawerContent className="h-full top-0 right-auto left-0 bottom-0 mt-0 rounded-r-xl">
          <DrawerHeader
            className="flex flex-row items-center justify-between border-b pb-4"
            inert={!isOpen}
          >
            <DrawerTitle>用户信息</DrawerTitle>
            <DrawerDescription className="sr-only">
              查看用户信息和操作
            </DrawerDescription>
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
          <DrawerFooter inert={!isOpen}>
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
            <Button variant="outline" className="w-full" onClick={handleImport}>
              <Upload className="w-4 h-4 mr-2" />
              导入数据
            </Button>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => setExportDialogOpen(true)}
            >
              <Download className="w-4 h-4 mr-2" />
              导出数据
            </Button>
            <Button variant="outline" onClick={onSignOut} className="w-full">
              <LogOut className="w-4 h-4 mr-2" />
              退出登录
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>

      <Dialog open={exportDialogOpen} onOpenChange={setExportDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>导出数据</DialogTitle>
            <DialogDescription>
              选择导出格式。明文 JSON 可直接查看，加密 JSON
              需要使用当前密码解密。
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex-row gap-2 justify-center">
            <Button variant="outline" onClick={handleExportPlain}>
              导出明文
            </Button>
            <Button onClick={handleExportEncrypted}>导出密文</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
