"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    if (typeof window === "undefined") {
      setIsChecking(false);
      return;
    }
    
    const token = localStorage.getItem("token");
    setIsChecking(false);
    
    if (token) {
      router.replace("/inbox");
    } else {
      router.replace("/login");
    }
  }, [router]);

  if (isChecking) {
    return (
      <div className="flex items-center justify-center h-screen bg-white">
        <div className="text-gray-500">読み込み中...</div>
      </div>
    );
  }

  return null;
}
