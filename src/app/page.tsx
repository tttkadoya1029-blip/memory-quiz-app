"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { DailyMissionPanel } from "@/components/missions/DailyMissionPanel";
import { LoginStreakPanel } from "@/components/login/LoginStreakPanel";
import { CardPackOpening } from "@/components/gacha/CardPackOpening";

interface Stats {
  dueCount: number;
  newCount: number;
  totalQuestions: number;
}

interface PlayerStats {
  level: number;
  exp: number;
  coins: number;
  totalWins: number;
  totalGames: number;
}

export default function Home() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [playerStats, setPlayerStats] = useState<PlayerStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [showMissions, setShowMissions] = useState(false);
  const [showLoginStreak, setShowLoginStreak] = useState(false);
  const [showGacha, setShowGacha] = useState(false);
  const [packCount, setPackCount] = useState(0);

  const fetchData = async () => {
    try {
      const [statsRes, collectionRes, packsRes] = await Promise.all([
        fetch("/api/quiz/stats"),
        fetch("/api/collection"),
        fetch("/api/gacha/packs"),
      ]);
      const statsData = await statsRes.json();
      const collectionData = await collectionRes.json();
      const packsData = await packsRes.json();
      setStats(statsData);
      setPlayerStats(collectionData.playerStats);
      setPackCount(packsData.quantity || 0);
    } catch (error) {
      console.error("Failed to fetch data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handlePackOpened = () => {
    setPackCount((prev) => Math.max(0, prev - 1));
  };

  const handleLoginClaim = () => {
    fetchData(); // Refresh stats after claiming
  };

  if (loading) {
    return (
      <div className="duel-bg flex items-center justify-center">
        <motion.div
          className="text-xl text-cyan-400"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          Loading...
        </motion.div>
      </div>
    );
  }

  return (
    <div className="duel-bg">
      {/* Modals */}
      <DailyMissionPanel
        isOpen={showMissions}
        onClose={() => setShowMissions(false)}
      />
      <LoginStreakPanel
        isOpen={showLoginStreak}
        onClose={() => setShowLoginStreak(false)}
        onClaim={handleLoginClaim}
      />
      <CardPackOpening
        isOpen={showGacha}
        onClose={() => setShowGacha(false)}
        packCount={packCount}
        onPackOpened={handlePackOpened}
      />

      <main className="max-w-lg mx-auto px-4 py-8 flex flex-col min-h-screen">
        {/* Logo / Title */}
        <motion.div
          className="text-center mb-6"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-4xl font-black mb-2">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500">
              WORD
            </span>
            <span className="text-white"> DUEL</span>
          </h1>
          <p className="text-gray-400 text-sm">Master words through battle</p>
        </motion.div>

        {/* Quick Action Buttons */}
        <motion.div
          className="flex gap-2 mb-4"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          {/* Login Bonus */}
          <motion.button
            onClick={() => setShowLoginStreak(true)}
            className="flex-1 game-card p-3 text-center"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="text-xl mb-1">📅</div>
            <div className="text-xs text-white font-bold">Login</div>
          </motion.button>

          {/* Daily Missions */}
          <motion.button
            onClick={() => setShowMissions(true)}
            className="flex-1 game-card p-3 text-center"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="text-xl mb-1">🎯</div>
            <div className="text-xs text-white font-bold">Missions</div>
          </motion.button>

          {/* Card Packs */}
          <motion.button
            onClick={() => setShowGacha(true)}
            className="flex-1 game-card p-3 text-center relative"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="text-xl mb-1">🎴</div>
            <div className="text-xs text-white font-bold">Packs</div>
            {packCount > 0 && (
              <motion.div
                className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-white text-xs font-bold flex items-center justify-center"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
              >
                {packCount}
              </motion.div>
            )}
          </motion.button>
        </motion.div>

        {/* Player Stats Card */}
        {playerStats && (
          <motion.div
            className="game-card p-4 mb-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-lg">
                  {playerStats.level}
                </div>
                <div>
                  <div className="text-white font-bold">Level {playerStats.level}</div>
                  <div className="text-xs text-gray-400">
                    EXP: {playerStats.exp}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-yellow-400 font-bold flex items-center gap-1">
                  {playerStats.coins} 🪙
                </div>
                <div className="text-xs text-gray-400">
                  Wins: {playerStats.totalWins}/{playerStats.totalGames}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Main Action - DUEL START */}
        <motion.div
          className="mb-4"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, type: "spring" }}
        >
          <Link href="/duel" className="block">
            <motion.div
              className="relative overflow-hidden rounded-xl p-8 text-center cursor-pointer"
              style={{
                background:
                  "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)",
                border: "2px solid #00d4ff",
                boxShadow: "0 0 30px rgba(0, 212, 255, 0.3)",
              }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {/* Animated background effect */}
              <motion.div
                className="absolute inset-0 opacity-20"
                style={{
                  background:
                    "radial-gradient(circle at 50% 50%, #00d4ff 0%, transparent 60%)",
                }}
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.2, 0.3, 0.2],
                }}
                transition={{ duration: 2, repeat: Infinity }}
              />

              <div className="relative z-10">
                <div className="text-5xl mb-4">⚔️</div>
                <h2 className="text-3xl font-black text-white mb-2 tracking-wider">
                  DUEL START
                </h2>
                <p className="text-cyan-400 text-sm">
                  Battle against enemies with word power!
                </p>
              </div>
            </motion.div>
          </Link>
        </motion.div>

        {/* Secondary Actions */}
        <motion.div
          className="grid grid-cols-2 gap-4 mb-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          {/* Collection */}
          <Link href="/collection" className="block">
            <motion.div
              className="game-card p-4 text-center h-full"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="text-3xl mb-2">📚</div>
              <h3 className="text-white font-bold mb-1">Collection</h3>
              <p className="text-xs text-gray-400">
                {stats?.totalQuestions ?? 0} cards
              </p>
            </motion.div>
          </Link>

          {/* Study Mode (Legacy) */}
          <Link href="/quiz" className="block">
            <motion.div
              className="game-card p-4 text-center h-full"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="text-3xl mb-2">📝</div>
              <h3 className="text-white font-bold mb-1">Study</h3>
              <p className="text-xs text-gray-400">
                {stats?.dueCount ?? 0} due
              </p>
            </motion.div>
          </Link>
        </motion.div>

        {/* Stats Summary */}
        <motion.div
          className="game-card p-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <h3 className="text-xs text-gray-400 uppercase tracking-wider mb-3">
            Learning Progress
          </h3>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-red-400">
                {stats?.dueCount ?? 0}
              </div>
              <div className="text-xs text-gray-500">Due Today</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-400">
                {stats?.newCount ?? 0}
              </div>
              <div className="text-xs text-gray-500">New</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-white">
                {stats?.totalQuestions ?? 0}
              </div>
              <div className="text-xs text-gray-500">Total</div>
            </div>
          </div>
        </motion.div>

        {/* Footer */}
        <div className="mt-auto pt-8 text-center text-xs text-gray-600">
          Word Duel v1.1
        </div>
      </main>
    </div>
  );
}
