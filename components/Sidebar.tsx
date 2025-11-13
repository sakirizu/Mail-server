"use client";

import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  Inbox,
  Send,
  FileText,
  AlertTriangle,
  BarChart3,
  HelpCircle,
  Settings,
  Plus,
} from "lucide-react";
import { cn } from "@/lib/utils";

const menuItems = [
  { id: "inbox", name: "受信トレイ", icon: Inbox, path: "/inbox" },
  { id: "sent", name: "送信済み", icon: Send, path: "/sent" },
  { id: "compose", name: "新規作成", icon: Plus, path: "/compose" },
  { id: "drafts", name: "下書き", icon: FileText, path: "/drafts", count: 7 },
  { id: "spam", name: "迷惑メール", icon: AlertTriangle, path: "/spam", count: 6 },
  { id: "statistics", name: "統計", icon: BarChart3, path: "/statistics" },
];

const DEMO_TOKEN = "demo-token-12345";
const DEMO_UNREAD_COUNT = 2;

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const loadUnreadCount = async () => {
      try {
        if (typeof window === "undefined") return;
        const token = localStorage.getItem("token");
        if (!token) {
          setUnreadCount(0);
          return;
        }

        if (token === DEMO_TOKEN) {
          setUnreadCount(DEMO_UNREAD_COUNT);
          return;
        }

        const response = await fetch("http://localhost:3001/api/mails/stats", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (response.ok) {
          const data = await response.json();
          const unread = data.statistics?.unread_count || 0;
          setUnreadCount(unread);
        } else if (response.status === 401) {
          // 認証エラーの場合、トークンをクリアしてログインページへ
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          setUnreadCount(0);
        } else {
          setUnreadCount(0);
        }
      } catch (error) {
        // ネットワークエラーやその他のエラーは無視（コンソールに出力しない）
        setUnreadCount(0);
      }
    };

    // パス名が認証が必要なページの場合のみAPI呼び出し
    const publicPaths = ["/login", "/signup"];
    if (!publicPaths.includes(pathname)) {
      loadUnreadCount();
      const interval = setInterval(loadUnreadCount, 30000);
      return () => clearInterval(interval);
    }
  }, [pathname]);

  return (
    <aside className="fixed left-0 top-16 bottom-0 w-64 border-r border-[var(--border)] bg-gradient-to-b from-white via-[rgba(255,245,235,0.7)] to-white/95 backdrop-blur-sm overflow-y-auto">
      <div className="p-5 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.path;
          const count = item.id === "inbox" ? unreadCount : item.count;

          return (
            <button
              key={item.id}
              onClick={() => router.push(item.path)}
              className={cn(
                "w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-sm font-medium transition-all shadow-soft/0",
                isActive
                  ? "bg-primary-50/90 text-primary-700 shadow-soft hover:translate-x-1"
                  : "text-gray-700 hover:bg-amber-50/80 hover:text-primary-600"
              )}
            >
              <div
                className={cn(
                  "h-9 w-9 rounded-lg flex items-center justify-center border border-transparent",
                  isActive
                    ? "bg-gradient-to-br from-primary-500 to-amber-400 text-white shadow-medium"
                    : "bg-white text-gray-500 border-[var(--border)]"
                )}
              >
                <Icon className="h-4 w-4" />
              </div>
              <span className="flex-1 text-left">{item.name}</span>
              {count && count > 0 && (
                <span className="px-2.5 py-0.5 text-xs font-semibold text-white bg-primary-500 rounded-full shadow-soft">
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-[var(--border)] bg-white/80 backdrop-blur-sm space-y-1.5">
        <button
          className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-amber-50/70 hover:text-primary-600 transition-colors"
        >
          <div className="h-9 w-9 rounded-lg border border-[var(--border)] bg-white flex items-center justify-center">
            <HelpCircle className="h-4 w-4 text-gray-500" />
          </div>
          <span className="flex-1 text-left">ヘルプとサポート</span>
        </button>
        <button
          className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-amber-50/70 hover:text-primary-600 transition-colors"
        >
          <div className="h-9 w-9 rounded-lg border border-[var(--border)] bg-white flex items-center justify-center">
            <Settings className="h-4 w-4 text-gray-500" />
          </div>
          <span className="flex-1 text-left">設定</span>
        </button>
      </div>
    </aside>
  );
}

