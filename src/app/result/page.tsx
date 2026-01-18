"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Suspense } from "react";

function ResultContent() {
  const searchParams = useSearchParams();
  const answered = parseInt(searchParams.get("answered") ?? "0", 10);
  const correct = parseInt(searchParams.get("correct") ?? "0", 10);
  const accuracy = answered > 0 ? Math.round((correct / answered) * 100) : 0;

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-8">
      <h1 className="text-3xl font-bold mb-8">学習結果</h1>

      <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-8 mb-8 w-full max-w-md text-center">
        <div className="text-6xl font-bold mb-4 text-blue-600">
          {accuracy}%
        </div>
        <p className="text-xl mb-6">正答率</p>

        <div className="grid grid-cols-2 gap-4 text-left">
          <div className="bg-white dark:bg-gray-700 p-4 rounded-lg">
            <p className="text-sm text-gray-500 dark:text-gray-400">解答数</p>
            <p className="text-2xl font-bold">{answered} 問</p>
          </div>
          <div className="bg-white dark:bg-gray-700 p-4 rounded-lg">
            <p className="text-sm text-gray-500 dark:text-gray-400">正解数</p>
            <p className="text-2xl font-bold text-green-600">{correct} 問</p>
          </div>
        </div>
      </div>

      <div className="flex gap-4">
        <Link
          href="/quiz"
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg"
        >
          もう一度学習
        </Link>
        <Link
          href="/"
          className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-3 px-8 rounded-lg"
        >
          ホームへ戻る
        </Link>
      </div>
    </main>
  );
}

export default function ResultPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen flex items-center justify-center">
          <p className="text-lg">読み込み中...</p>
        </main>
      }
    >
      <ResultContent />
    </Suspense>
  );
}
