"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Search, Menu, User } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function TopBar() {
  const [searchValue, setSearchValue] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);
  const [user, setUser] = useState<{ name?: string; username?: string } | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token");
      const userData = localStorage.getItem("user");
      if (userData) {
        setUser(JSON.parse(userData));
      }
    }
  }, []);

  const handleProfileClick = () => {
    router.push("/profile");
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-[var(--border)] bg-white/90 shadow-soft backdrop-blur supports-[backdrop-filter]:bg-white/70">
      <div className="flex h-16 items-center justify-between px-4 md:px-6 gap-4">
        {/* Left Section - Menu and Logo */}
        <div className="flex items-center gap-4">
          <button className="p-2 rounded-full transition-colors bg-accent/70 hover:bg-accent">
            <Menu className="h-5 w-5 text-[var(--accent-foreground)]" />
          </button>
          <div className="hidden md:flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[var(--primary)] via-[var(--primary)] to-[var(--secondary)] shadow-medium flex items-center justify-center">
              <span className="text-white text-base font-semibold">S</span>
            </div>
            <div className="flex flex-col leading-tight">
              <span className="text-lg font-semibold text-[var(--foreground)] tracking-wide">
                Smail
              </span>
              <span className="text-xs text-[var(--muted-foreground)]">
                Smart mail for every day
              </span>
            </div>
          </div>
        </div>

        {/* Center Section - Search */}
        <div className="flex-1 max-w-2xl">
          <div
            className={`relative flex items-center rounded-full border transition-all bg-white/80 ${
              searchFocused
                ? "border-[var(--primary)] shadow-[0_8px_24px_rgba(214,51,36,0.15)]"
                : "border-transparent shadow-soft"
            }`}
          >
            <Input
              type="text"
              placeholder="メールを検索"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
              className="border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 pl-4 pr-14 placeholder:text-[var(--muted-foreground)] text-sm"
            />
            <div className="absolute right-2">
              <Button
                size="icon"
                className="h-9 w-9 rounded-full bg-gradient-to-br from-[var(--primary)] to-[var(--secondary)] hover:opacity-90"
              >
                <Search className="h-4 w-4 text-white" />
              </Button>
            </div>
          </div>
        </div>

        {/* Right Section - User Profile */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleProfileClick}
            className="flex items-center gap-3 px-3 py-2 rounded-full bg-white/80 hover:bg-white shadow-soft transition-shadow"
          >
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[var(--primary)] to-[var(--primary)] flex items-center justify-center shadow-medium">
              <span className="text-sm font-semibold text-white tracking-wide">
                {user?.name?.charAt(0)?.toUpperCase() ||
                  user?.username?.charAt(0)?.toUpperCase() ||
                  "U"}
              </span>
            </div>
            <span className="hidden md:flex flex-col text-xs font-medium text-[var(--foreground)] leading-tight">
              <span className="text-sm font-semibold">
                {user?.name || user?.username || "User"}
              </span>
              <span className="text-[10px] text-[var(--muted-foreground)]">
                アカウント設定
              </span>
            </span>
          </button>
        </div>
      </div>
    </header>
  );
}

