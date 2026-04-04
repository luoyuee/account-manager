"use client";

import type { AccountItem } from "@/types";
import type { ImportResult } from "@/utils/account-data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAccountsStore } from "@/stores/accounts";
import { useState, useRef, useEffect } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  ArrowLeft,
  Upload,
  FileJson,
  Lock,
  AlertCircle,
  TriangleAlert,
} from "lucide-react";
import {
  parseImportFile,
  decryptImportData,
  prepareImportAccounts,
} from "@/utils/account-data";

export default function ImportPage() {
  const router = useRouter();
  const { items: existingItems, setItems } = useAccountsStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [file, setFile] = useState<File | null>(null);
  const [fileContent, setFileContent] = useState<string>("");
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [accounts, setAccounts] = useState<AccountItem[]>([]);
  const [password, setPassword] = useState("");
  const [overwrite, setOverwrite] = useState(false);
  const [overwriteDialogOpen, setOverwriteDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState<{
    imported: AccountItem[];
    skipped: AccountItem[];
  } | null>(null);

  useEffect(() => {
    if (accounts.length > 0) {
      const result = prepareImportAccounts(accounts, existingItems, overwrite);
      setPreview(result);
    } else {
      setPreview(null);
    }
  }, [accounts, existingItems, overwrite]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    setPreview(null);
    setAccounts([]);

    try {
      const content = await selectedFile.text();
      setFileContent(content);
      const result = parseImportFile(content);
      setImportResult(result);

      if (!result.isEncrypted) {
        setAccounts(result.accounts);
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "解析文件失败");
      setFile(null);
      setImportResult(null);
    }
  };

  const handleDecrypt = () => {
    if (!password.trim()) {
      toast.error("请输入密码");
      return;
    }

    setLoading(true);
    try {
      const data = JSON.parse(fileContent);
      const decrypted = decryptImportData(data.data, password);
      setAccounts(decrypted);
      toast.success("解密成功");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "解密失败");
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmImport = async () => {
    if (!preview) return;

    setLoading(true);
    try {
      if (overwrite) {
        await setItems(preview.imported);
      } else {
        await setItems([...preview.imported, ...existingItems]);
      }

      toast.success(
        `导入成功：${preview.imported.length} 条${preview.skipped.length > 0 ? `，跳过 ${preview.skipped.length} 条重复数据` : ""}`,
      );
      router.replace("/");
    } catch (err) {
      console.error(err);
      toast.error("导入失败");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFile(null);
    setFileContent("");
    setImportResult(null);
    setAccounts([]);
    setPassword("");
    setOverwrite(false);
    setPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60 border-b">
        <div className="max-w-4xl mx-auto flex h-14 items-center justify-between px-4">
          <Button variant="ghost" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="font-medium">导入数据</h1>
          <div className="w-8" />
        </div>
      </header>

      <div className="p-4 max-w-4xl mx-auto space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="w-5 h-5" />
              选择文件
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <Input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleFileChange}
                disabled={loading}
              />
              {file && (
                <Button variant="outline" size="sm" onClick={handleReset}>
                  重置
                </Button>
              )}
            </div>

            {file && importResult && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                {importResult.isEncrypted ? (
                  <>
                    <Lock className="w-4 h-4" />
                    <span>加密文件</span>
                  </>
                ) : (
                  <>
                    <FileJson className="w-4 h-4" />
                    <span>明文文件 - {accounts.length} 个账号</span>
                  </>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {importResult?.isEncrypted && (
          <Card>
            <CardHeader>
              <CardTitle>解密文件</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password">输入密码</Label>
                <div className="flex gap-2">
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="输入解密密码"
                    disabled={loading}
                  />
                  <Button
                    onClick={handleDecrypt}
                    disabled={loading || !password.trim()}
                  >
                    解密
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {preview && (
          <Card>
            <CardHeader>
              <CardTitle>导入预览</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="overwrite"
                  checked={overwrite}
                  onCheckedChange={(checked) => {
                    if (checked === true) {
                      setOverwriteDialogOpen(true);
                    } else {
                      setOverwrite(false);
                    }
                  }}
                />
                <Label htmlFor="overwrite" className="text-sm">
                  覆盖导入（清空现有数据）
                </Label>
              </div>

              <AlertDialog
                open={overwriteDialogOpen}
                onOpenChange={setOverwriteDialogOpen}
              >
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogMedia className="bg-destructive/10 text-destructive dark:bg-destructive/20 dark:text-destructive">
                      <TriangleAlert />
                    </AlertDialogMedia>
                    <AlertDialogTitle>危险操作警告</AlertDialogTitle>
                    <AlertDialogDescription>
                      覆盖导入将清空当前所有账号数据，此操作不可恢复。确定要继续吗？
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel variant="outline">
                      取消
                    </AlertDialogCancel>
                    <AlertDialogAction
                      variant="destructive"
                      onClick={() => {
                        setOverwrite(true);
                        setOverwriteDialogOpen(false);
                      }}
                    >
                      确认覆盖
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="p-3 bg-muted rounded-lg">
                  <div className="font-medium text-green-600">
                    将导入 {preview.imported.length} 条
                  </div>
                </div>
                <div className="p-3 bg-muted rounded-lg">
                  <div className="font-medium text-orange-600">
                    跳过重复 {preview.skipped.length} 条
                  </div>
                </div>
              </div>

              {preview.imported.length > 0 && (
                <div className="space-y-2">
                  <Label>待导入账号</Label>
                  <ScrollArea className="h-48 border rounded-lg">
                    <div className="p-2 space-y-1">
                      {preview.imported.map((account) => (
                        <div
                          key={account.id}
                          className="flex items-center justify-between p-2 bg-muted/50 rounded text-sm"
                        >
                          <span className="font-medium">{account.title}</span>
                          <span className="text-muted-foreground">
                            {account.username}
                          </span>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </div>
              )}

              {preview.skipped.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-orange-600">
                    <AlertCircle className="w-4 h-4" />
                    <span>跳过的重复账号</span>
                  </div>
                  <ScrollArea className="h-32 border rounded-lg">
                    <div className="p-2 space-y-1">
                      {preview.skipped.map((account, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-2 bg-muted/50 rounded text-sm text-muted-foreground"
                        >
                          <span>{account.title}</span>
                          <span>{account.username}</span>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <Button
                  variant="outline"
                  onClick={handleReset}
                  className="flex-1"
                >
                  取消
                </Button>
                <Button
                  onClick={handleConfirmImport}
                  disabled={loading || preview.imported.length === 0}
                  className="flex-1"
                >
                  确认导入
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
