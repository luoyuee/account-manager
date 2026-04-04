"use client";

import type { UserListItem, UserListPagination } from "@/apis/user/models";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useState, useEffect, useCallback } from "react";
import { Spinner } from "@/components/ui/spinner";
import { Button } from "@/components/ui/button";
import { USER_ROLE_LABELS } from "@/constants";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  ArrowLeft,
  UserPlus,
  KeyRound,
  Ban,
  CheckCircle,
  Trash2,
} from "lucide-react";
import {
  getUserList,
  updateUserStatus,
  deleteUser,
} from "@/apis/user";
import { CreateUserDialog } from "@/components/create-user-dialog";
import { ChangePasswordDialog } from "@/components/change-password-dialog";

export default function UsersPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<UserListItem[]>([]);
  const [pagination, setPagination] = useState<UserListPagination>({
    page: 1,
    pageSize: 10,
    total: 0,
    totalPages: 0,
  });
  const [createOpen, setCreateOpen] = useState(false);
  const [passwordOpen, setPasswordOpen] = useState(false);
  const [targetUser, setTargetUser] = useState<UserListItem | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchUsers = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const res = await getUserList({ page, pageSize: 10 });
      if (res.success) {
        setUsers(res.data.list);
        setPagination(res.data.pagination);
      } else {
        toast.error("获取用户列表失败");
      }
    } catch {
      toast.error("获取用户列表失败");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers(1);
  }, [fetchUsers]);

  const handleToggleStatus = async (user: UserListItem) => {
    const newStatus = user.status === 1 ? 0 : 1;
    setActionLoading(true);
    try {
      const res = await updateUserStatus(user.id, { status: newStatus });
      if (res.success) {
        toast.success(res.message || "操作成功");
        fetchUsers(pagination.page);
      } else {
        toast.error(res.message || "操作失败");
      }
    } catch {
      toast.error("操作失败");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (user: UserListItem) => {
    setActionLoading(true);
    try {
      const res = await deleteUser(user.id);
      if (res.success) {
        toast.success("删除成功");
        fetchUsers(pagination.page);
      } else {
        toast.error(res.message || "删除失败");
      }
    } catch {
      toast.error("删除失败");
    } finally {
      setActionLoading(false);
    }
  };

  const handleOpenPasswordDialog = (user: UserListItem) => {
    setTargetUser(user);
    setPasswordOpen(true);
  };

  const handleClosePasswordDialog = () => {
    setPasswordOpen(false);
    setTargetUser(null);
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60 border-b">
        <div className="max-w-4xl mx-auto flex h-14 items-center justify-between px-4">
          <Button variant="ghost" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="font-medium">用户管理</h1>
          <Button variant="ghost" size="sm" onClick={() => setCreateOpen(true)}>
            <UserPlus className="w-5 h-5" />
          </Button>
        </div>
      </header>

      <div className="p-4 max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>用户列表</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Spinner className="size-8" />
              </div>
            ) : users.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                暂无用户
              </div>
            ) : (
              <>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>用户名</TableHead>
                      <TableHead>邮箱</TableHead>
                      <TableHead>角色</TableHead>
                      <TableHead>状态</TableHead>
                      <TableHead>注册时间</TableHead>
                      <TableHead className="text-right">操作</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>{user.id}</TableCell>
                        <TableCell className="font-medium">
                          {user.nickname}
                        </TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>
                          {USER_ROLE_LABELS[user.role] ?? "未知"}
                        </TableCell>
                        <TableCell>
                          <span
                            className={
                              user.status === 1
                                ? "text-green-600"
                                : "text-destructive"
                            }
                          >
                            {user.status === 1 ? "正常" : "已禁用"}
                          </span>
                        </TableCell>
                        <TableCell>
                          {new Date(user.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              disabled={actionLoading}
                              onClick={() => handleOpenPasswordDialog(user)}
                            >
                              <KeyRound className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              disabled={actionLoading}
                              onClick={() => handleToggleStatus(user)}
                            >
                              {user.status === 1 ? (
                                <Ban className="w-4 h-4" />
                              ) : (
                                <CheckCircle className="w-4 h-4" />
                              )}
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  disabled={actionLoading}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>确认删除</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    确定要删除用户 &quot;{user.nickname}&quot;
                                    吗？此操作不可恢复。
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>取消</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleDelete(user)}
                                  >
                                    删除
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                <div className="flex items-center justify-between mt-4 pt-4 border-t">
                  <span className="text-sm text-muted-foreground">
                    共 {pagination.total} 条记录
                  </span>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={pagination.page <= 1 || loading}
                      onClick={() =>
                        fetchUsers(Math.max(1, pagination.page - 1))
                      }
                    >
                      上一页
                    </Button>
                    <span className="flex items-center px-3 text-sm">
                      {pagination.page}/{pagination.totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={
                        pagination.page >= pagination.totalPages || loading
                      }
                      onClick={() =>
                        fetchUsers(
                          Math.min(pagination.totalPages, pagination.page + 1),
                        )
                      }
                    >
                      下一页
                    </Button>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <CreateUserDialog
          open={createOpen}
          onOpenChange={setCreateOpen}
          onSuccess={() => fetchUsers(pagination.page)}
        />

        <ChangePasswordDialog
          open={passwordOpen}
          onOpenChange={handleClosePasswordDialog}
          user={targetUser}
        />
      </div>
    </div>
  );
}
