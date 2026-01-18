"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Stats {
  dueCount: number;
  newCount: number;
  totalQuestions: number;
}

export default function Home() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await fetch("/api/quiz/stats");
        const data = await res.json();
        setStats(data);
      } catch (error) {
        console.error("Failed to fetch stats:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, []);

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <p className="text-lg">読み込み中...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-8">
      <h1 className="text-3xl font-bold mb-8">暗記クイズアプリ</h1>

      <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-6 mb-8 w-full max-w-md">
        <h2 className="text-xl font-semibold mb-4">学習状況</h2>
        <div className="space-y-2">
          <p className="flex justify-between">
            <span>復習待ち:</span>
            <span className="font-bold text-red-500">{stats?.dueCount ?? 0} 問</span>
          </p>
          <p className="flex justify-between">
            <span>未学習:</span>
            <span className="font-bold text-blue-500">{stats?.newCount ?? 0} 問</span>
          </p>
          <p className="flex justify-between">
            <span>全問題数:</span>
            <span className="font-bold">{stats?.totalQuestions ?? 0} 問</span>
          </p>
        </div>
      </div>

      <Link
        href="/quiz"
        className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg text-lg transition-colors"
      >
        学習開始
      </Link>
    </main>
  );
}
