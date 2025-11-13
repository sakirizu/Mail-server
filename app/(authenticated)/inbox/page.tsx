"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import MailItem from "@/components/MailItem";

interface Email {
  id?: string;
  _id?: string;
  sender: string;
  subject: string;
  snippet?: string;
  body?: string;
  created_at?: string;
  date?: string;
  read_status?: boolean;
  folder?: string;
}

const DEMO_TOKEN = "demo-token-12345";

const demoEmails: Email[] = [
  {
    id: "demo-1",
    sender: "Smail チーム",
    subject: "Smailへようこそ！",
    snippet: "Smailでのメール体験を最大限に活かすヒントとセットアップガイドです。",
    body: "Smailをお選びいただきありがとうございます。受信トレイの整理方法や、便利なショートカットについてご紹介します。",
    created_at: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    read_status: false,
    folder: "inbox",
  },
  {
    id: "demo-2",
    sender: "セキュリティノート",
    subject: "アカウント保護のための3つのステップ",
    snippet: "セキュリティ通知とデバイス管理でアカウントをさらに安全に保ちましょう。",
    body: "2段階認証の設定やログイン履歴の確認など、アカウントを守るための実践的なガイドをご確認ください。",
    created_at: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
    read_status: false,
    folder: "inbox",
  },
  {
    id: "demo-3",
    sender: "Smail ニュース",
    subject: "Smailアップデート - 今週の新機能",
    snippet: "新しいテーマと高速検索機能が利用可能になりました。",
    body: "最新のアップデート情報をご確認ください。テーマのカスタマイズや検索機能が進化し、より快適なメール操作が可能になりました。",
    created_at: new Date(Date.now() - 1000 * 60 * 240).toISOString(),
    read_status: true,
    folder: "inbox",
  },
];

export default function InboxPage() {
  const [emails, setEmails] = useState<Email[]>([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);

  const getToken = () => {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("token");
  };

  const loadEmailStats = async () => {
    const token = getToken();
    if (!token) return;

    if (token === DEMO_TOKEN) {
      const unread = demoEmails.filter((email) => !email.read_status).length;
      setUnreadCount(unread);
      return;
    }

    try {
      const response = await axios.get("http://localhost:3001/api/mails/stats", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data) {
        setUnreadCount(response.data.statistics?.unread_count || 0);
      } else {
        setUnreadCount(0);
      }
    } catch {
      setUnreadCount(0);
    }
  };

  const loadEmails = async () => {
    const token = getToken();
    if (!token) {
      setEmails([]);
      setUnreadCount(0);
      return;
    }

    if (token === DEMO_TOKEN) {
      setEmails(demoEmails);
      const unread = demoEmails.filter((email) => !email.read_status).length;
      setUnreadCount(unread);
      return;
    }

    try {
      const response = await axios.get("http://localhost:3001/api/mails/inbox", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data) {
        const loadedEmails = response.data.mails || [];
        setEmails(loadedEmails);

        const inboxEmails = loadedEmails.filter(
          (email: Email) => email.folder === "inbox"
        );
        const unreadEmails = inboxEmails.filter(
          (email: Email) => !email.read_status
        );
        setUnreadCount(unreadEmails.length);
      } else {
        setEmails([]);
        setUnreadCount(0);
      }
    } catch {
      setEmails([]);
      setUnreadCount(0);
    }
  };

  useEffect(() => {
    const loadInitialData = async () => {
      setLoading(true);
      await Promise.all([loadEmails(), loadEmailStats()]);
      setLoading(false);
    };

    loadInitialData();
  }, []);

  const handleEmailRead = async (emailId: string) => {
    const token = getToken();
    if (!token) return;

    if (token === DEMO_TOKEN) {
      setEmails((prev) =>
        prev.map((email) =>
          email.id === emailId || email._id === emailId
            ? { ...email, read_status: true }
            : email
        )
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
      return;
    }

    try {
      await axios.put(
        `http://localhost:3001/api/mails/${emailId}/read`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setEmails((prev) =>
        prev.map((email) =>
          email.id === emailId || email._id === emailId
            ? { ...email, read_status: true }
            : email
        )
      );

      const emailToUpdate = emails.find(
        (email) => (email.id === emailId || email._id === emailId) && !email.read_status
      );
      if (emailToUpdate) {
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
    } catch {
      // ignore errors for now
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-gray-50 via-white to-amber-50/30 dark:from-dark-900 dark:via-dark-800 dark:to-dark-900">
        <p className="text-base text-gray-500 dark:text-gray-400">メールを読み込み中...</p>
      </div>
    );
  }

  if (!emails || emails.length === 0) {
    return (
      <div className="flex-1">
        <div className="flex flex-col items-center justify-center h-full px-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500 to-amber-400 flex items-center justify-center text-white text-2xl font-semibold shadow-medium dark:shadow-glow-red mb-4">
            S
          </div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 text-center mb-2">
            受信トレイにメールがありません
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 text-center leading-5">
            新しいメッセージが届くと、こちらに表示されます。
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1">
      {/* Header */}
      <div className="px-8 py-5 border-b dark:border-dark-200 bg-white/80 dark:bg-dark-600/80 backdrop-blur-sm shadow-sm dark:shadow-dark-soft transition-theme">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-amber-400 shadow-soft dark:shadow-glow-red flex items-center justify-center text-white font-semibold">
                IN
              </div>
              <div>
                <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 tracking-tight">
                  受信トレイ
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {emails.length} 通のメッセージが届いています
                </p>
              </div>
            </div>
            {unreadCount > 0 && (
              <div className="inline-flex items-center gap-2 rounded-full bg-primary-50/80 dark:bg-dark-400 text-primary-700 dark:text-primary-400 px-4 py-1 text-xs font-medium shadow-soft dark:shadow-dark-soft">
                <span className="h-2 w-2 rounded-full bg-primary-500 dark:bg-primary-400"></span>
                未読 {unreadCount} 件
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mail list */}
      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-3">
        {emails.map((email) => (
          <MailItem
            key={email.id || email._id}
            mail={email}
            onRead={() =>
              !email.read_status && handleEmailRead(email.id || email._id || "")
            }
          />
        ))}
      </div>
    </div>
  );
}

