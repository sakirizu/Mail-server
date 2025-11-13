"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = () => {
      if (typeof window === "undefined") return;
      
      const token = localStorage.getItem("token");
      const publicPaths = ["/login", "/signup"];
      
      if (!token && !publicPaths.includes(pathname)) {
        router.push("/login");
        setIsLoading(false);
        return;
      }
      
      if (token && pathname === "/login") {
        router.push("/inbox");
        setIsLoading(false);
        return;
      }
      
      setIsAuthenticated(!!token);
      setIsLoading(false);
    };

    checkAuth();
  }, [pathname, router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-gray-500">読み込み中...</div>
      </div>
    );
  }

  return <>{children}</>;
}
