"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { LoginStreakData, DAILY_REWARDS, LoginReward } from "@/lib/login-streak";

interface LoginStreakPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onClaim: () => void;
}

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export function LoginStreakPanel({ isOpen, onClose, onClaim }: LoginStreakPanelProps) {
  const [data, setData] = useState<LoginStreakData | null>(null);
  const [loading, setLoading] = useState(true);
  const [claiming, setClaiming] = useState(false);
  const [claimedReward, setClaimedReward] = useState<LoginReward | null>(null);

  useEffect(() => {
    if (isOpen) {
      fetchData();
    }
  }, [isOpen]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/login/streak");
      const result = await res.json();
      setData(result);
    } catch (error) {
      console.error("Failed to fetch login streak:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleClaim = async () => {
    if (!data?.isNewDay || claiming) return;

    try {
      setClaiming(true);
      const res = await fetch("/api/login/streak", {
        method: "POST",
      });
      const result = await res.json();

      if (result.success) {
        setClaimedReward(result.reward);
        setData((prev) =>
          prev
            ? {
                ...prev,
                currentStreak: result.currentStreak,
                weeklyStamps: result.weeklyStamps,
                isNewDay: false,
                todayReward: null,
              }
            : null
        );
        onClaim();
      }
    } catch (error) {
      console.error("Failed to claim:", error);
    } finally {
      setClaiming(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="w-full max-w-md"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="game-card p-4 mb-4 text-center">
              <h2 className="text-xl font-black neon-text-gold mb-1">
                DAILY LOGIN
              </h2>
              <p className="text-gray-400 text-sm">
                Login every day for rewards!
              </p>
              {data && (
                <div className="mt-2 text-cyan-400 font-bold">
                  Current Streak: {data.currentStreak} days
                </div>
              )}
            </div>

            {loading ? (
              <div className="game-card p-8 text-center">
                <motion.div
                  className="text-cyan-400"
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  Loading...
                </motion.div>
              </div>
            ) : data ? (
              <>
                {/* Weekly Stamps */}
                <div className="game-card p-4 mb-4">
                  <div className="grid grid-cols-7 gap-2">
                    {DAYS.map((day, index) => {
                      const isStamped = data.weeklyStamps[index];
                      const reward = DAILY_REWARDS[index];

                      return (
                        <motion.div
                          key={day}
                          className={`text-center p-2 rounded-lg ${
                            isStamped
                              ? "bg-gradient-to-br from-green-500 to-emerald-600"
                              : "bg-gray-700"
                          }`}
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ delay: index * 0.05 }}
                        >
                          <div className="text-xs text-white/80 mb-1">{day}</div>
                          <div className="text-lg">
                            {isStamped ? "✓" : "🪙"}
                          </div>
                          <div className="text-xs text-yellow-400">
                            +{reward.coins}
                          </div>
                          {index === 6 && (
                            <div className="text-[10px] text-purple-400">
                              +Pack
                            </div>
                          )}
                        </motion.div>
                      );
                    })}
                  </div>
                </div>

                {/* Today's Reward / Claimed */}
                {data.isNewDay && data.todayReward ? (
                  <motion.div
                    className="game-card p-4 mb-4 text-center"
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                  >
                    <div className="text-sm text-gray-400 mb-2">
                      Today&apos;s Reward
                    </div>
                    <div className="text-3xl text-yellow-400 font-bold mb-2">
                      +{data.todayReward.coins} 🪙
                    </div>
                    {data.todayReward.bonus && (
                      <div className="text-purple-400 text-sm mb-2">
                        + {data.todayReward.bonus}
                      </div>
                    )}
                    <motion.button
                      onClick={handleClaim}
                      disabled={claiming}
                      className="w-full py-3 bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-bold rounded-lg"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      {claiming ? "Claiming..." : "CLAIM REWARD"}
                    </motion.button>
                  </motion.div>
                ) : claimedReward ? (
                  <motion.div
                    className="game-card p-4 mb-4 text-center"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                  >
                    <div className="text-4xl mb-2">🎉</div>
                    <div className="text-green-400 font-bold mb-1">
                      Reward Claimed!
                    </div>
                    <div className="text-yellow-400">
                      +{claimedReward.coins} coins
                    </div>
                    {claimedReward.bonus && (
                      <div className="text-purple-400 text-sm">
                        + {claimedReward.bonus}
                      </div>
                    )}
                  </motion.div>
                ) : (
                  <div className="game-card p-4 mb-4 text-center text-gray-400">
                    Come back tomorrow for more rewards!
                  </div>
                )}
              </>
            ) : null}

            {/* Close Button */}
            <motion.button
              onClick={onClose}
              className="w-full py-3 bg-gray-700 text-white font-bold rounded-lg hover:bg-gray-600"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Close
            </motion.button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
