"use client";

import { useMemo } from "react";
import MailItem from "@/components/MailItem";
import { ShieldAlert } from "lucide-react";

interface SpamMail {
  id: string;
  sender: string;
  subject: string;
  snippet: string;
  created_at: string;
  read_status: boolean;
}

const demoSpam: SpamMail[] = [
  {
    id: "spam-1",
    sender: "不明な送信者",
    subject: "【重要】アカウントが停止されました",
    snippet: "緊急対応が必要です。リンクを確認してください。",
    created_at: new Date(Date.now() - 1000 * 60 * 320).toISOString(),
    read_status: true,
  },
  {
    id: "spam-2",
    sender: "キャンペーン事務局",
    subject: "限定オファーのお知らせ",
    snippet: "今だけの特別キャンペーンにご招待します。",
    created_at: new Date(Date.now() - 1000 * 60 * 560).toISOString(),
    read_status: true,
  },
];

export default function SpamPage() {
  const spamMails = useMemo(() => demoSpam, []);

  return (
    <div className="flex-1">
      <div className="px-8 py-5 border-b dark:border-dark-200 bg-white/80 dark:bg-dark-600/80 backdrop-blur-sm shadow-sm dark:shadow-dark-soft flex items-center gap-4 transition-theme">
        <div className="w-10 h-10 rounded-full bg-error text-white flex items-center justify-center shadow-soft dark:shadow-glow-red">
          <ShieldAlert className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 tracking-tight">
            迷惑メール
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            疑わしいメールは14日後に自動で削除されます
          </p>
        </div>
      </div>

      <div className="px-6 py-6 space-y-3">
        {spamMails.map((mail) => (
          <MailItem key={mail.id} mail={mail} />
        ))}

        {spamMails.length === 0 && (
          <div className="rounded-2xl border border-dashed border-error/40 dark:border-error/60 bg-error/5 dark:bg-error/10 p-6 text-center text-sm text-error dark:text-error/90">
            現在迷惑メールはありません。
          </div>
        )}
      </div>
    </div>
  );
}

