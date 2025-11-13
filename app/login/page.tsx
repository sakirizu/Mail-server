"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username || !password) {
      alert("ユーザー名とパスワードを入力してください");
      return;
    }

    // Demo account
    if (username === "demo" && password === "demo123") {
      setLoading(true);
      setTimeout(() => {
        const demoUser = {
          id: "demo-user",
          username: "demo",
          name: "Demo User",
          email: "demo@ssmail.com",
          token: "demo-token-12345",
        };
        
        if (typeof window !== "undefined") {
          localStorage.setItem("token", demoUser.token);
          localStorage.setItem("user", JSON.stringify(demoUser));
        }
        
        router.push("/inbox");
        setLoading(false);
      }, 1000);
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post("http://localhost:3001/api/auth/login", {
        username,
        password,
      });

      if (response.data.requires2FA) {
        // 2FAが必要な場合は別ページへ
        router.push(`/two-factor?tempToken=${response.data.tempToken}`);
      } else if (response.data.token && response.data.user) {
        const userWithToken = { ...response.data.user, token: response.data.token };
        
        if (typeof window !== "undefined") {
          localStorage.setItem("token", userWithToken.token);
          localStorage.setItem("user", JSON.stringify(userWithToken));
        }
        
        router.push("/inbox");
      } else {
        alert(response.data?.error || "ログインに失敗しました");
      }
    } catch (error: any) {
      alert(error.response?.data?.error || "サーバーエラーが発生しました");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-4">
            <div className="text-3xl font-bold">
              <span className="text-error">S</span>
              <span className="text-primary-500">mail</span>
            </div>
          </div>
          <CardTitle className="text-2xl font-bold">ログイン</CardTitle>
          <CardDescription>
            アカウントにログインしてメールを確認
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="username" className="text-sm font-medium text-gray-700">
                ユーザー名
              </label>
              <Input
                id="username"
                type="text"
                placeholder="ユーザー名を入力"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="h-11"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium text-gray-700">
                パスワード
              </label>
              <Input
                id="password"
                type="password"
                placeholder="パスワードを入力"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="h-11"
              />
            </div>
            <Button
              type="submit"
              className="w-full h-11 bg-primary-500 hover:bg-primary-600"
              disabled={loading}
            >
              {loading ? "ログイン中..." : "ログイン"}
            </Button>
            <div className="text-center text-sm text-gray-600 mt-4">
              <p>デモアカウント:</p>
              <p className="font-mono text-xs mt-1">ユーザー名: demo / パスワード: demo123</p>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

