"use client";

import { useMemo } from "react";
import { BarChart3, MailOpen, MailQuestion, MailPlus } from "lucide-react";

const demoStats = {
  total: 128,
  sent: 42,
  received: 86,
  unread: 7,
};

const demoDailyActivity = [
  { day: "月", sent: 5, received: 12 },
  { day: "火", sent: 7, received: 14 },
  { day: "水", sent: 9, received: 18 },
  { day: "木", sent: 8, received: 16 },
  { day: "金", sent: 6, received: 20 },
  { day: "土", sent: 4, received: 3 },
  { day: "日", sent: 3, received: 3 },
];

export default function StatisticsPage() {
  const activity = useMemo(() => demoDailyActivity, []);

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="px-8 py-5 border-b dark:border-dark-200 bg-white/80 dark:bg-dark-600/80 backdrop-blur-sm shadow-sm dark:shadow-dark-soft flex items-center gap-4 transition-theme">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-amber-400 text-white flex items-center justify-center shadow-soft dark:shadow-glow-red">
          <BarChart3 className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 tracking-tight">
            メール統計
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Smail を利用した最近のアクティビティの概要
          </p>
        </div>
      </div>

      <div className="px-6 py-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[
            {
              title: "総メッセージ",
              value: demoStats.total,
              icon: MailOpen,
              color: "from-primary-500 to-amber-400",
            },
            {
              title: "送信済み",
              value: demoStats.sent,
              icon: MailPlus,
              color: "from-amber-400 to-primary-500",
            },
            {
              title: "受信済み",
              value: demoStats.received,
              icon: MailOpen,
              color: "from-primary-500 to-primary-700",
            },
            {
              title: "未読",
              value: demoStats.unread,
              icon: MailQuestion,
              color: "from-error to-error/80",
            },
          ].map((card) => (
            <div
              key={card.title}
              className="rounded-3xl bg-white dark:bg-dark-500 p-5 shadow-soft dark:shadow-dark-soft transition-all"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">
                    {card.title}
                  </p>
                  <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mt-2">
                    {card.value}
                  </p>
                </div>
                <div
                  className={`w-11 h-11 rounded-xl bg-gradient-to-br ${card.color} flex items-center justify-center text-white shadow-soft dark:shadow-glow-red`}
                >
                  <card.icon className="h-5 w-5" />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="rounded-3xl bg-white dark:bg-dark-500 p-6 shadow-soft dark:shadow-dark-soft transition-all">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            日別の送受信状況
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            過去7日間の送信・受信の件数
          </p>

          <div className="grid grid-cols-7 gap-4">
            {activity.map((item) => (
              <div key={item.day} className="flex flex-col items-center">
                <div className="flex items-end gap-2 h-32">
                  <div className="w-4 rounded-full bg-primary-500/80" style={{ height: `${item.sent * 5}px` }} />
                  <div className="w-4 rounded-full bg-amber-400/80" style={{ height: `${item.received * 5}px` }} />
                </div>
                <span className="mt-2 text-xs text-gray-500">{item.day}</span>
              </div>
            ))}
          </div>

          <div className="mt-6 flex items-center gap-6 text-xs text-gray-500 dark:text-gray-400">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-primary-500/80"></span>
              <span>送信件数</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-amber-400/80"></span>
              <span>受信件数</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

