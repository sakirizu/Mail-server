"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Search, Menu, Moon, Sun } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function TopBar() {
  const [searchValue, setSearchValue] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);
  const [user, setUser] = useState<{ name?: string; username?: string } | null>(null);
  const [isDark, setIsDark] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token");
      const userData = localStorage.getItem("user");
      if (userData) {
        setUser(JSON.parse(userData));
      }
      
      // ダークモードの初期状態を読み込む
      const darkMode = localStorage.getItem("darkMode") === "true";
      setIsDark(darkMode);
      if (darkMode) {
        document.documentElement.classList.add("dark");
      }
    }
  }, []);

  const toggleDarkMode = () => {
    const newDarkMode = !isDark;
    setIsDark(newDarkMode);
    localStorage.setItem("darkMode", newDarkMode.toString());
    
    if (newDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  const handleProfileClick = () => {
    router.push("/profile");
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b dark:border-dark-200 bg-white/90 dark:bg-dark-700/95 shadow-soft dark:shadow-dark-medium backdrop-blur supports-[backdrop-filter]:bg-white/70 dark:supports-[backdrop-filter]:bg-dark-700/80 transition-theme">
      <div className="flex h-16 items-center justify-between px-4 md:px-6 gap-4">
        {/* Left Section - Menu and Logo */}
        <div className="flex items-center gap-4">
          <button className="p-2 rounded-full transition-colors bg-accent/70 dark:bg-dark-400 hover:bg-accent dark:hover:bg-dark-300">
            <Menu className="h-5 w-5 text-gray-700 dark:text-gray-300" />
          </button>
          <div className="hidden md:flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-500 to-amber-400 shadow-medium dark:shadow-glow-red flex items-center justify-center">
              <span className="text-white text-base font-semibold">S</span>
            </div>
            <div className="flex flex-col leading-tight">
              <span className="text-lg font-semibold text-gray-900 dark:text-gray-100 tracking-wide">
                Smail
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                Smart mail for every day
              </span>
            </div>
          </div>
        </div>

        {/* Center Section - Search */}
        <div className="flex-1 max-w-2xl">
          <div
            className={`relative flex items-center rounded-full border transition-all bg-white/80 dark:bg-dark-400/80 ${
              searchFocused
                ? "border-primary-500 shadow-[0_8px_24px_rgba(214,51,36,0.15)] dark:shadow-glow-red"
                : "border-transparent shadow-soft dark:shadow-dark-soft"
            }`}
          >
            <Input
              type="text"
              placeholder="メールを検索"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
              className="border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 pl-4 pr-14 placeholder:text-gray-400 dark:placeholder:text-gray-500 text-sm text-gray-900 dark:text-gray-100"
            />
            <div className="absolute right-2">
              <Button
                size="icon"
                className="h-9 w-9 rounded-full bg-gradient-to-br from-primary-500 to-amber-400 hover:opacity-90 dark:shadow-glow-red"
              >
                <Search className="h-4 w-4 text-white" />
              </Button>
            </div>
          </div>
        </div>

        {/* Right Section - Dark Mode Toggle & User Profile */}
        <div className="flex items-center gap-3">
          {/* Dark Mode Toggle */}
          <button
            onClick={toggleDarkMode}
            className="p-2.5 rounded-full bg-white/80 dark:bg-dark-400 hover:bg-accent dark:hover:bg-dark-300 shadow-soft dark:shadow-dark-soft transition-all"
            aria-label="Toggle dark mode"
          >
            {isDark ? (
              <Sun className="h-5 w-5 text-amber-400 transition-transform hover:rotate-12" />
            ) : (
              <Moon className="h-5 w-5 text-gray-700 transition-transform hover:-rotate-12" />
            )}
          </button>
          
          {/* User Profile */}
          <button
            onClick={handleProfileClick}
            className="flex items-center gap-3 px-3 py-2 rounded-full bg-white/80 dark:bg-dark-400 hover:bg-white dark:hover:bg-dark-300 shadow-soft dark:shadow-dark-soft transition-all"
          >
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 dark:from-primary-400 dark:to-primary-500 flex items-center justify-center shadow-medium dark:shadow-glow-red">
              <span className="text-sm font-semibold text-white tracking-wide">
                {user?.name?.charAt(0)?.toUpperCase() ||
                  user?.username?.charAt(0)?.toUpperCase() ||
                  "U"}
              </span>
            </div>
            <span className="hidden md:flex flex-col text-xs font-medium text-gray-900 dark:text-gray-100 leading-tight">
              <span className="text-sm font-semibold">
                {user?.name || user?.username || "User"}
              </span>
              <span className="text-[10px] text-gray-500 dark:text-gray-400">
                アカウント設定
              </span>
            </span>
          </button>
        </div>
      </div>
    </header>
  );
}

