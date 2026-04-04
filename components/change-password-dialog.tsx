"use client";

import type { UserListItem } from "@/apis/user/models";
import { Spinner } from "@/components/ui/spinner";
import { updateUserPassword } from "@/apis/user";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { KeyRound } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

export type ChangePasswordDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: UserListItem | null;
};

export function ChangePasswordDialog({
  open,
  onOpenChange,
  user,
}: ChangePasswordDialogProps) {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    password: "",
    confirmPassword: "",
  });

  const handleSubmit = async () => {
    if (!form.password.trim()) {
      toast.error("请输入新密码", {
        position: "top-center",
      });
      return;
    }
    if (form.password !== form.confirmPassword) {
      toast.error("两次输入的密码不一致", {
        position: "top-center",
      });
      return;
    }

    if (!user) return;

    setLoading(true);
    try {
      const res = await updateUserPassword(user.id, {
        password: form.password,
      });
      if (res.success) {
        toast.success("密码修改成功");
        setForm({ password: "", confirmPassword: "" });
        onOpenChange(false);
      } else {
        toast.error(res.message || "修改失败");
      }
    } catch {
      toast.error("修改失败");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      setForm({ password: "", confirmPassword: "" });
    }
    onOpenChange(isOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>修改密码 - {user?.nickname}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="new-password">新密码</Label>
            <Input
              id="new-password"
              type="password"
              value={form.password}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, password: e.target.value }))
              }
              placeholder="至少 6 位密码"
              disabled={loading}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirm-password">确认密码</Label>
            <Input
              id="confirm-password"
              type="password"
              value={form.confirmPassword}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  confirmPassword: e.target.value,
                }))
              }
              placeholder="再次输入新密码"
              disabled={loading}
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => handleOpenChange(false)}
            disabled={loading}
          >
            取消
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? (
              <Spinner className="text-current" />
            ) : (
              <KeyRound data-icon="inline-start" />
            )}
            确认修改
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
