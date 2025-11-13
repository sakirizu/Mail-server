"use client";

import { useMemo } from "react";
import { Button } from "@/components/ui/button";

interface Draft {
  id: string;
  subject: string;
  updated_at: string;
  preview: string;
}

const demoDrafts: Draft[] = [
  {
    id: "draft-1",
    subject: "社内共有：四半期レポート",
    preview: "概要と主要なポイントを追記予定です。",
    updated_at: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
  },
  {
    id: "draft-2",
    subject: "お礼のメッセージ",
    preview: "先日のミーティングのお礼を伝える内容を検討中です。",
    updated_at: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
  },
];

const formatTime = (value: string) =>
  new Date(value).toLocaleString("ja-JP", {
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

export default function DraftsPage() {
  const drafts = useMemo(() => demoDrafts, []);

  return (
    <div className="flex-1">
      <div className="px-8 py-5 border-b dark:border-dark-200 bg-white/80 dark:bg-dark-600/80 backdrop-blur-sm shadow-sm dark:shadow-dark-soft flex items-center justify-between transition-theme">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-amber-200 dark:bg-amber-400 text-primary-700 dark:text-dark-900 shadow-soft dark:shadow-glow-amber flex items-center justify-center text-sm font-semibold">
            DR
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 tracking-tight">
              下書き
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {drafts.length} 件の下書きが保存されています
            </p>
          </div>
        </div>
        <Button className="bg-gradient-to-br from-primary-500 to-amber-400 dark:shadow-glow-red">
          新しいメールを作成
        </Button>
      </div>

      <div className="px-6 py-6 space-y-4">
        {drafts.map((draft) => (
          <div
            key={draft.id}
            className="rounded-2xl bg-white dark:bg-dark-500 shadow-soft dark:shadow-dark-soft p-5 hover:shadow-medium dark:hover:shadow-dark-medium transition-all"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100">
                  {draft.subject}
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  {draft.preview}
                </p>
              </div>
              <span className="text-xs text-gray-400 dark:text-gray-500 whitespace-nowrap">
                更新 {formatTime(draft.updated_at)}
              </span>
            </div>
            <div className="mt-4 flex gap-3">
              <Button variant="outline" className="dark:border-dark-300 dark:text-gray-300 dark:hover:bg-dark-400">編集を続ける</Button>
              <Button variant="ghost" className="dark:text-gray-300 dark:hover:bg-dark-400">削除</Button>
            </div>
          </div>
        ))}

        {drafts.length === 0 && (
          <div className="rounded-2xl border border-dashed border-amber-200 dark:border-amber-400/50 bg-amber-50/60 dark:bg-dark-400/50 p-6 text-center text-sm text-amber-700 dark:text-amber-400">
            現在保存されている下書きはありません。
          </div>
        )}
      </div>
    </div>
  );
}

