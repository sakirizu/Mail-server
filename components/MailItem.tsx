"use client";

import { useRouter } from "next/navigation";

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
}

interface MailItemProps {
  mail: Email;
  onPress?: () => void;
  onRead?: () => void;
}

const formatTimeAgo = (dateString?: string): string => {
  if (!dateString) return "Just now";

  const now = new Date();
  const date = new Date(dateString);
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return "Just now";
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes}m ago`;
  }

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours}h ago`;
  }

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) {
    return `${diffInDays}d ago`;
  }

  const diffInWeeks = Math.floor(diffInDays / 7);
  if (diffInWeeks < 4) {
    return `${diffInWeeks}w ago`;
  }

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: diffInDays > 365 ? "numeric" : undefined,
  });
};

export default function MailItem({ mail, onPress, onRead }: MailItemProps) {
  const router = useRouter();
  const isUnread = !mail.read_status;

  const handleClick = () => {
    if (onRead && !mail.read_status) {
      onRead();
    }

    if (onPress) {
      onPress();
    } else {
      router.push(`/mail/${mail.id || mail._id}`);
    }
  };

  return (
    <button
      onClick={handleClick}
      className={`
        group w-full flex items-start gap-4 rounded-2xl px-5 py-4 text-left transition-all
        ${isUnread
          ? "bg-primary-50/80 dark:bg-dark-400 shadow-medium dark:shadow-dark-medium dark:shadow-glow-red"
          : "bg-white dark:bg-dark-500 shadow-soft dark:shadow-dark-soft hover:shadow-medium dark:hover:shadow-dark-medium hover:scale-[1.01]"}
      `}
    >
      {/* Avatar */}
      <div className="flex-shrink-0">
        <div
          className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
            isUnread
              ? "bg-gradient-to-br from-primary-500 to-amber-400 text-white shadow-soft dark:shadow-glow-red"
              : "bg-amber-50 dark:bg-dark-300 text-primary-600 dark:text-primary-400 shadow-soft dark:shadow-dark-soft"
          }`}
        >
          <span className="text-sm font-semibold tracking-wide">
            {mail.sender?.charAt(0)?.toUpperCase() || "U"}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        {/* Sender and Time */}
        <div className="flex items-center justify-between mb-1">
          <span
            className={`text-sm flex-1 truncate transition-colors ${
              isUnread 
                ? "font-semibold text-gray-900 dark:text-gray-100" 
                : "font-medium text-gray-800 dark:text-gray-200"
            }`}
          >
            {mail.sender}
          </span>
          <span className="text-xs text-gray-400 dark:text-gray-500 ml-4 flex-shrink-0">
            {formatTimeAgo(mail.created_at || mail.date)}
          </span>
        </div>

        {/* Subject */}
        <div
          className={`text-sm mb-1 truncate transition-colors ${
            isUnread
              ? "font-semibold text-gray-900 dark:text-gray-100"
              : "font-semibold text-gray-800 dark:text-gray-200 group-hover:text-primary-600 dark:group-hover:text-primary-400"
          }`}
        >
          {mail.subject}
        </div>

        {/* Snippet */}
        <div className="text-xs text-gray-500 dark:text-gray-400 leading-5 line-clamp-2">
          {mail.snippet || mail.body || "No preview available"}
        </div>
      </div>
    </button>
  );
}

