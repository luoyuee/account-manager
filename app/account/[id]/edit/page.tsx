"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { TagInput } from "@/components/tag-input";
import { useAccountsStore } from "@/stores/accounts";
import { ArrowLeft, Save, Trash2 } from "lucide-react";
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { toast } from "sonner";
import { useForm } from "@tanstack/react-form";
import { z } from "zod";

const schema = z.object({
  title: z.string().min(1, "请输入标题").max(100, "标题最多100个字符"),
  username: z.string().min(1, "请输入账号").max(100, "账号最多100个字符"),
  password: z.string().min(1, "请输入密码").max(100, "密码最多100个字符"),
  remark: z.string().max(500, "备注最多500个字符").optional(),
});

export default function AccountEditPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const { items, updateItem, removeItem } = useAccountsStore();
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [tags, setTags] = useState<string[]>([]);

  const existingItem = items.find((item) => item.id === id);

  const form = useForm({
    defaultValues: {
      title: "",
      username: "",
      password: "",
      remark: "",
    },
    onSubmit: async ({ value }) => {
      if (!existingItem) return;

      setSaving(true);
      try {
        updateItem(existingItem.id, {
          title: value.title.trim(),
          username: value.username.trim(),
          password: value.password.trim(),
          remark: value.remark?.trim() || undefined,
          tags,
        });
        toast.success("保存成功");
        router.replace("/");
      } catch (e) {
        console.error(e);
        toast.error("保存失败");
      } finally {
        setSaving(false);
      }
    },
  });

  useEffect(() => {
    if (existingItem) {
      form.reset({
        title: existingItem.title,
        username: existingItem.username,
        password: existingItem.password,
        remark: existingItem.remark ?? "",
      });
      setTags(existingItem.tags);
    } else {
      toast.error("账号不存在");
      router.replace("/");
    }
    setLoading(false);
  }, [existingItem, router, form]);

  const handleDelete = () => {
    if (!existingItem) return;
    if (confirm("确定要删除这个账号吗？")) {
      removeItem(existingItem.id);
      toast.success("删除成功");
      router.replace("/");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p>加载中...</p>
      </div>
    );
  }

  if (!existingItem) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60 border-b">
        <div className="max-w-4xl mx-auto flex h-14 items-center justify-between px-4">
          <Button variant="ghost" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="font-medium">编辑账号</h1>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => form.handleSubmit()}
            disabled={saving}
          >
            <Save className="w-5 h-5" />
          </Button>
        </div>
      </header>

      <div className="p-4 max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>账号信息</CardTitle>
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
              <form.Field
                name="title"
                validators={{
                  onChange: ({ value }) => {
                    const result = schema.shape.title.safeParse(value);
                    return result.success
                      ? undefined
                      : result.error.issues[0]?.message;
                  },
                }}
              >
                {(field) => (
                  <div className="space-y-2">
                    <Label htmlFor={field.name}>标题</Label>
                    <Input
                      id={field.name}
                      name={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      placeholder="例如：GitHub"
                      disabled={saving}
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
                name="username"
                validators={{
                  onChange: ({ value }) => {
                    const result = schema.shape.username.safeParse(value);
                    return result.success
                      ? undefined
                      : result.error.issues[0]?.message;
                  },
                }}
              >
                {(field) => (
                  <div className="space-y-2">
                    <Label htmlFor={field.name}>账号</Label>
                    <Input
                      id={field.name}
                      name={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      placeholder="账号/邮箱/手机号"
                      disabled={saving}
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
                      placeholder="密码"
                      disabled={saving}
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
                name="remark"
                validators={{
                  onChange: ({ value }) => {
                    const result = schema.shape.remark.safeParse(value);
                    return result.success
                      ? undefined
                      : result.error.issues[0]?.message;
                  },
                }}
              >
                {(field) => (
                  <div className="space-y-2">
                    <Label htmlFor={field.name}>备注</Label>
                    <Textarea
                      id={field.name}
                      name={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      placeholder="备注信息（可选）"
                      rows={3}
                      disabled={saving}
                    />
                    {field.state.meta.errors?.[0] && (
                      <p className="text-sm text-destructive">
                        {field.state.meta.errors[0]}
                      </p>
                    )}
                  </div>
                )}
              </form.Field>

              <div className="space-y-2">
                <Label>标签</Label>
                <TagInput
                  value={tags}
                  onChange={setTags}
                  placeholder="输入标签后按回车添加"
                  disabled={saving}
                />
              </div>
            </form>
          </CardContent>
        </Card>

        <Button
          variant="destructive"
          className="w-full mt-4"
          onClick={handleDelete}
        >
          <Trash2 className="w-4 h-4 mr-2" />
          删除账号
        </Button>
      </div>
    </div>
  );
}
