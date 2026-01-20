"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Rank, calculateRank, calculateRewards } from "@/lib/duel-logic";

function ResultContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [saved, setSaved] = useState(false);
  const [earnedExp, setEarnedExp] = useState(0);
  const [earnedCoins, setEarnedCoins] = useState(0);

  const correctCount = parseInt(searchParams.get("correct") ?? "0", 10);
  const wrongCount = parseInt(searchParams.get("wrong") ?? "0", 10);
  const maxCombo = parseInt(searchParams.get("maxCombo") ?? "0", 10);
  const playerHp = parseInt(searchParams.get("playerHp") ?? "0", 10);
  const enemyHp = parseInt(searchParams.get("enemyHp") ?? "0", 10);
  const isVictory = searchParams.get("isVictory") === "true";
  const totalQuestions = parseInt(searchParams.get("total") ?? "10", 10);

  const duelState = {
    playerHp,
    enemyHp,
    currentQuestion: totalQuestions,
    totalQuestions,
    combo: 0,
    maxCombo,
    correctCount,
    wrongCount,
    consecutiveWrong: 0,
    isGameOver: true,
    isVictory,
  };

  const rank = calculateRank(duelState);
  const rewards = calculateRewards(duelState);

  useEffect(() => {
    // Save result to database
    const saveResult = async () => {
      try {
        const res = await fetch("/api/duel/result", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            correctCount,
            wrongCount,
            maxCombo,
            playerHp,
            enemyHp,
            isVictory,
            totalQuestions,
          }),
        });
        const data = await res.json();
        setEarnedExp(data.earnedExp);
        setEarnedCoins(data.earnedCoins);
        setSaved(true);
      } catch (error) {
        console.error("Failed to save result:", error);
        setEarnedExp(rewards.exp);
        setEarnedCoins(rewards.coins);
        setSaved(true);
      }
    };
    saveResult();
  }, [correctCount, wrongCount, maxCombo, playerHp, enemyHp, isVictory, totalQuestions, rewards.exp, rewards.coins]);

  const getRankClass = (rank: Rank) => {
    switch (rank) {
      case "S":
        return "rank-s";
      case "A":
        return "rank-a";
      case "B":
        return "rank-b";
      case "C":
        return "rank-c";
      case "F":
        return "rank-f";
    }
  };

  const accuracy = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;

  return (
    <div className="duel-bg flex items-center justify-center p-4">
      <motion.div
        className="w-full max-w-md"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        {/* Victory/Defeat Banner */}
        <motion.div
          className="text-center mb-8"
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, type: "spring" }}
        >
          <h1
            className={`text-5xl font-black mb-2 ${
              isVictory ? "neon-text-gold" : "neon-text-red"
            }`}
          >
            {isVictory ? "VICTORY!" : "DEFEAT"}
          </h1>
          <p className="text-gray-400">Battle Complete</p>
        </motion.div>

        {/* Rank Display */}
        <motion.div
          className="text-center mb-8"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.4, type: "spring", stiffness: 200 }}
        >
          <div className="inline-block">
            <span className="text-sm text-gray-400 uppercase tracking-wider">
              Rank
            </span>
            <div className={`text-8xl font-black ${getRankClass(rank)}`}>
              {rank}
            </div>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          className="game-card p-6 mb-6"
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-3 bg-black/30 rounded-lg">
              <div className="text-2xl font-bold text-green-400">
                {correctCount}
              </div>
              <div className="text-xs text-gray-400">Correct</div>
            </div>
            <div className="text-center p-3 bg-black/30 rounded-lg">
              <div className="text-2xl font-bold text-red-400">{wrongCount}</div>
              <div className="text-xs text-gray-400">Wrong</div>
            </div>
            <div className="text-center p-3 bg-black/30 rounded-lg">
              <div className="text-2xl font-bold text-cyan-400">{accuracy}%</div>
              <div className="text-xs text-gray-400">Accuracy</div>
            </div>
            <div className="text-center p-3 bg-black/30 rounded-lg">
              <div className="text-2xl font-bold text-orange-400 flex items-center justify-center gap-1">
                {maxCombo}
                {maxCombo >= 3 && <span className="text-lg">🔥</span>}
              </div>
              <div className="text-xs text-gray-400">Max Combo</div>
            </div>
          </div>
        </motion.div>

        {/* Rewards */}
        <motion.div
          className="game-card p-6 mb-8"
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          <h3 className="text-sm text-gray-400 uppercase tracking-wider mb-4 text-center">
            Rewards
          </h3>
          <div className="flex justify-around">
            <div className="text-center">
              <motion.div
                className="text-3xl font-bold text-purple-400"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 1, type: "spring" }}
              >
                +{earnedExp || rewards.exp}
              </motion.div>
              <div className="text-xs text-gray-400">EXP</div>
            </div>
            <div className="text-center">
              <motion.div
                className="text-3xl font-bold text-yellow-400 flex items-center justify-center gap-1"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 1.1, type: "spring" }}
              >
                +{earnedCoins || rewards.coins}
                <span className="text-xl">🪙</span>
              </motion.div>
              <div className="text-xs text-gray-400">Coins</div>
            </div>
          </div>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          className="flex gap-4"
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 1 }}
        >
          <button
            onClick={() => router.push("/duel")}
            className="flex-1 py-4 bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-bold rounded-lg hover:from-cyan-500 hover:to-blue-500 transition-all neon-blue"
          >
            REMATCH
          </button>
          <button
            onClick={() => router.push("/")}
            className="flex-1 py-4 bg-gray-700 text-white font-bold rounded-lg hover:bg-gray-600 transition-all"
          >
            HOME
          </button>
        </motion.div>
      </motion.div>
    </div>
  );
}

export default function DuelResultPage() {
  return (
    <Suspense
      fallback={
        <div className="duel-bg flex items-center justify-center">
          <div className="text-xl text-cyan-400">Loading...</div>
        </div>
      }
    >
      <ResultContent />
    </Suspense>
  );
}
