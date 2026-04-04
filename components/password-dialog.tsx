"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export type PasswordDialogMode = "setup" | "unlock";

interface PasswordDialogProps {
  open: boolean;
  mode: PasswordDialogMode;
  onConfirm: (password: string) => Promise<void> | void;
  onCancel?: () => void;
  loading?: boolean;
}

export function PasswordDialog({
  open,
  mode,
  onConfirm,
  onCancel,
  loading = false,
}: PasswordDialogProps) {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");

  const isSetupMode = mode === "setup";

  const handleSubmit = async () => {
    setError("");

    if (!password.trim()) {
      setError("请输入密码");
      return;
    }

    if (isSetupMode) {
      if (password.length < 6) {
        setError("密码长度至少6位");
        return;
      }
      if (password !== confirmPassword) {
        setError("两次输入的密码不一致");
        return;
      }
    }

    try {
      await onConfirm(password);
      setPassword("");
      setConfirmPassword("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "操作失败");
    }
  };

  const handleCancel = () => {
    setPassword("");
    setConfirmPassword("");
    setError("");
    onCancel?.();
  };

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      handleCancel();
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent showCloseButton={false}>
        <DialogHeader>
          <DialogTitle>{isSetupMode ? "设置密码" : "输入密码"}</DialogTitle>
          <DialogDescription>
            {isSetupMode
              ? "首次使用需要设置一个密码来加密您的账号数据"
              : "请输入密码以解密您的账号数据"}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="password">
              {isSetupMode ? "设置密码" : "密码"}
            </Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={isSetupMode ? "请输入密码（至少6位）" : "请输入密码"}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !isSetupMode) {
                  handleSubmit();
                }
              }}
            />
          </div>

          {isSetupMode && (
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">确认密码</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="请再次输入密码"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleSubmit();
                  }
                }}
              />
            </div>
          )}

          {error && <p className="text-sm text-destructive">{error}</p>}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleCancel} disabled={loading}>
            取消
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? "处理中..." : isSetupMode ? "确认设置" : "解锁"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
