"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function ComposePage() {
  const [to, setTo] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");

  return (
    <div className="flex-1 bg-gradient-to-br from-white via-[rgba(255,244,235,0.7)] to-white flex justify-center overflow-y-auto py-10">
      <div className="w-full max-w-3xl px-6">
        <div className="rounded-3xl border border-[var(--border)] bg-white shadow-large overflow-hidden">
          <div className="bg-gradient-to-r from-primary-500 to-amber-400 text-white px-6 py-5 flex items-center justify-between">
            <div>
              <h1 className="text-xl font-semibold">新しいメッセージ</h1>
              <p className="text-xs text-white/80 mt-1">
                Smail でメッセージを作成しましょう
              </p>
            </div>
            <Button variant="secondary" className="bg-white text-primary-600 hover:bg-amber-50">
              下書きとして保存
            </Button>
          </div>

          <div className="px-6 py-6 space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-600">宛先</label>
              <Input
                placeholder="example@smail.jp"
                value={to}
                onChange={(e) => setTo(e.target.value)}
                className="h-12 rounded-xl bg-gray-50 border-[var(--border)] focus-visible:ring-primary-500"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-600">件名</label>
              <Input
                placeholder="件名を入力"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="h-12 rounded-xl bg-gray-50 border-[var(--border)] focus-visible:ring-primary-500"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-600">本文</label>
              <textarea
                placeholder="メッセージを入力してください..."
                value={body}
                onChange={(e) => setBody(e.target.value)}
                className="h-48 w-full resize-none rounded-2xl border border-[var(--border)] bg-gray-50 px-4 py-3 text-sm leading-6 text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <Button variant="ghost" className="text-gray-600 hover:text-primary-600">
                破棄
              </Button>
              <Button className="bg-gradient-to-r from-primary-500 to-amber-400">
                送信
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

