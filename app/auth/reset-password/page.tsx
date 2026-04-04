"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useRouter, useSearchParams } from "next/navigation";
import { Spinner } from "@/components/ui/spinner";
import { Button } from "@/components/ui/button";
import { useForm } from "@tanstack/react-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { resetPassword } from "@/apis/user";
import { useState, useEffect } from "react";
import { KeyRound } from "lucide-react";
import { z } from "zod";

const schema = z.object({
  password: z.string().min(6, "密码至少 6 位"),
  confirmPassword: z.string().min(6, "请确认密码"),
});

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [countdown, setCountdown] = useState(10);

  useEffect(() => {
    if (!success) return;

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          router.replace("/auth/login");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [success, router]);

  const form = useForm({
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
    onSubmit: async ({ value }) => {
      if (value.password !== value.confirmPassword) {
        setError("两次输入的密码不一致");
        return;
      }

      if (!token) {
        setError("重置链接无效");
        return;
      }

      setError(null);
      setLoading(true);

      try {
        const res = await resetPassword({
          token,
          password: value.password,
        });

        if (res.success) {
          setSuccess(true);
        } else {
          setError(res.message || "重置失败");
        }
      } catch {
        setError("重置失败，请稍后重试");
      } finally {
        setLoading(false);
      }
    },
  });

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle>重置密码</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-lg text-center">
              重置链接无效，请重新获取
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle>重置密码</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <div className="p-3 text-sm text-green-600 bg-green-50 rounded-lg text-center mb-4">
              密码重置成功
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              {countdown} 秒后自动跳转登录页
            </p>
            <Button onClick={() => router.replace("/auth/login")}>
              立即跳转
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle>重置密码</CardTitle>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              e.stopPropagation();
              form.handleSubmit();
            }}
            className="space-y-4"
          >
            {error && (
              <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-lg">
                {error}
              </div>
            )}

            <form.Field
              name="password"
              validators={{
                onChange: ({ value }) => {
                  const result = schema.shape.password.safeParse(value);
                  return result.success
                    ? undefined
                    : result.error.issues[0]?.message;
                },
              }}
            >
              {(field) => (
                <div className="space-y-2">
                  <Label htmlFor={field.name}>新密码</Label>
                  <Input
                    id={field.name}
                    name={field.name}
                    type="password"
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    placeholder="请输入新密码（至少 6 位）"
                    disabled={loading}
                  />
                  {field.state.meta.errors?.[0] && (
                    <p className="text-sm text-destructive">
                      {field.state.meta.errors[0]}
                    </p>
                  )}
                </div>
              )}
            </form.Field>

            <form.Field
              name="confirmPassword"
              validators={{
                onChange: ({ value }) => {
                  const result = schema.shape.confirmPassword.safeParse(value);
                  return result.success
                    ? undefined
                    : result.error.issues[0]?.message;
                },
              }}
            >
              {(field) => (
                <div className="space-y-2">
                  <Label htmlFor={field.name}>确认密码</Label>
                  <Input
                    id={field.name}
                    name={field.name}
                    type="password"
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    placeholder="请再次输入新密码"
                    disabled={loading}
                  />
                  {field.state.meta.errors?.[0] && (
                    <p className="text-sm text-destructive">
                      {field.state.meta.errors[0]}
                    </p>
                  )}
                </div>
              )}
            </form.Field>

            <Button type="submit" disabled={loading} className="w-full mt-6">
              {loading ? (
                <Spinner className="text-current" />
              ) : (
                <KeyRound data-icon="inline-start" />
              )}
              <span>{loading ? "重置中..." : "重置密码"}</span>
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
