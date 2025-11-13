"use client";

import { useMemo } from "react";
import MailItem from "@/components/MailItem";

interface Mail {
  id: string;
  sender: string;
  subject: string;
  snippet: string;
  created_at: string;
  read_status: boolean;
}

const demoSentMails: Mail[] = [
  {
    id: "sent-1",
    sender: "Smail サポート",
    subject: "お問い合わせありがとうございます",
    snippet: "サポートチームより：ご質問は24時間以内に回答いたします。",
    created_at: new Date(Date.now() - 1000 * 60 * 20).toISOString(),
    read_status: true,
  },
  {
    id: "sent-2",
    sender: "取引先A社",
    subject: "今月のレポートを送信しました",
    snippet: "最新のレポートを添付しております。内容をご確認ください。",
    created_at: new Date(Date.now() - 1000 * 60 * 90).toISOString(),
    read_status: true,
  },
  {
    id: "sent-3",
    sender: "社内チーム",
    subject: "プロジェクトミーティング議事録",
    snippet: "議事録を共有します。次回のアクションアイテムもご確認ください。",
    created_at: new Date(Date.now() - 1000 * 60 * 220).toISOString(),
    read_status: true,
  },
];

export default function SentPage() {
  const mails = useMemo(() => demoSentMails, []);

  return (
    <div className="flex-1">
      <div className="px-8 py-5 border-b dark:border-dark-200 bg-white/80 dark:bg-dark-600/80 backdrop-blur-sm shadow-sm dark:shadow-dark-soft transition-theme">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-amber-400 shadow-soft dark:shadow-glow-red flex items-center justify-center text-white font-semibold">
              OUT
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 tracking-tight">
                送信済み
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                最近送信したメッセージ
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-3">
        {mails.map((mail) => (
          <MailItem key={mail.id} mail={mail} />
        ))}
      </div>
    </div>
  );
}

