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
    <div className="flex-1 bg-gradient-to-br from-white via-[rgba(255,244,235,0.7)] to-white">
      <div className="px-8 py-5 border-b border-[var(--border)] bg-white/80 backdrop-blur-sm flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-amber-200 text-primary-700 shadow-soft flex items-center justify-center text-sm font-semibold">
            DR
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-[var(--foreground)] tracking-tight">
              下書き
            </h1>
            <p className="text-sm text-gray-500">
              {drafts.length} 件の下書きが保存されています
            </p>
          </div>
        </div>
        <Button className="bg-gradient-to-br from-primary-500 to-amber-400">
          新しいメールを作成
        </Button>
      </div>

      <div className="px-6 py-6 space-y-4">
        {drafts.map((draft) => (
          <div
            key={draft.id}
            className="rounded-2xl border border-[var(--border)] bg-white shadow-soft p-5 hover:border-amber-200 transition-colors"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-base font-semibold text-gray-900">
                  {draft.subject}
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  {draft.preview}
                </p>
              </div>
              <span className="text-xs text-gray-400 whitespace-nowrap">
                更新 {formatTime(draft.updated_at)}
              </span>
            </div>
            <div className="mt-4 flex gap-3">
              <Button variant="outline">編集を続ける</Button>
              <Button variant="ghost">削除</Button>
            </div>
          </div>
        ))}

        {drafts.length === 0 && (
          <div className="rounded-2xl border border-dashed border-amber-200 bg-amber-50/60 p-6 text-center text-sm text-amber-700">
            現在保存されている下書きはありません。
          </div>
        )}
      </div>
    </div>
  );
}

