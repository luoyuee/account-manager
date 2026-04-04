"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { LogIn } from "lucide-react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { hasAdmin, login } from "@/apis/user";
import { useUserStore } from "@/stores/user";
import { useForm } from "@tanstack/react-form";
import { z } from "zod";

const schema = z.object({
  email: z.email("邮箱格式不正确"),
  password: z.string().min(1, "请输入密码"),
});

export default function LoginPage() {
  const router = useRouter();
  const fetchUser = useUserStore((state) => state.fetchUser);
  const [checking, setChecking] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkUser = async () => {
      try {
        const res = await hasAdmin();
        if (!res.data.hasAdmin) {
          router.replace("/auth/register");
        }
      } catch {
        setError("检查用户状态失败");
      } finally {
        setChecking(false);
      }
    };

    checkUser();
  }, [router]);

  const form = useForm({
    defaultValues: {
      email: "",
      password: "",
    },
    onSubmit: async ({ value }) => {
      setError(null);
      setLoading(true);

      try {
        const res = await login({
          email: value.email,
          password: value.password,
        });

        if (res.success) {
          await fetchUser();
          router.replace("/");
        } else {
          setError(res.message || "登录失败");
        }
      } catch {
        setError("登录失败，请稍后重试");
      } finally {
        setLoading(false);
      }
    },
  });

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Spinner className="size-8" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle>登录</CardTitle>
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
              name="email"
              validators={{
                onChange: ({ value }) => {
                  const result = schema.shape.email.safeParse(value);
                  return result.success
                    ? undefined
                    : result.error.issues[0]?.message;
                },
              }}
            >
              {(field) => (
                <div className="space-y-2">
                  <Label htmlFor={field.name}>邮箱</Label>
                  <Input
                    id={field.name}
                    name={field.name}
                    type="email"
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    placeholder="请输入邮箱"
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
                  <Label htmlFor={field.name}>密码</Label>
                  <Input
                    id={field.name}
                    name={field.name}
                    type="password"
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    placeholder="请输入密码"
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
                <LogIn data-icon="inline-start" />
              )}
              <span>{loading ? "登录中..." : "登录"}</span>
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
