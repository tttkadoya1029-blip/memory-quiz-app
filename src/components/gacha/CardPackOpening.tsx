"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GachaCard, RARITY_CONFIG, Rarity } from "@/lib/gacha";

interface CardPackOpeningProps {
  isOpen: boolean;
  onClose: () => void;
  packCount: number;
  onPackOpened: () => void;
}

type Phase = "idle" | "opening" | "reveal" | "done";

export function CardPackOpening({
  isOpen,
  onClose,
  packCount,
  onPackOpened,
}: CardPackOpeningProps) {
  const [phase, setPhase] = useState<Phase>("idle");
  const [cards, setCards] = useState<GachaCard[]>([]);
  const [revealedIndex, setRevealedIndex] = useState(-1);
  const [loading, setLoading] = useState(false);

  const handleOpenPack = async () => {
    if (packCount <= 0 || loading) return;

    setLoading(true);
    setPhase("opening");

    try {
      const res = await fetch("/api/gacha/open", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      if (!res.ok) {
        throw new Error("Failed to open pack");
      }

      const data = await res.json();
      setCards(data.cards);

      // 開封アニメーション後にカード表示
      setTimeout(() => {
        setPhase("reveal");
        setRevealedIndex(0);
        onPackOpened();
      }, 1500);
    } catch (error) {
      console.error("Failed to open pack:", error);
      setPhase("idle");
    } finally {
      setLoading(false);
    }
  };

  const handleRevealNext = () => {
    if (revealedIndex < cards.length - 1) {
      setRevealedIndex(revealedIndex + 1);
    } else {
      setPhase("done");
    }
  };

  const handleReset = () => {
    setPhase("idle");
    setCards([]);
    setRevealedIndex(-1);
  };

  const getRarityStyle = (rarity: Rarity) => {
    const config = RARITY_CONFIG[rarity];
    return {
      boxShadow: `0 0 30px ${config.glowColor}, 0 0 60px ${config.glowColor}`,
    };
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="w-full max-w-md">
            {/* Idle - Show Pack */}
            {phase === "idle" && (
              <motion.div
                className="text-center"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
              >
                <h2 className="text-2xl font-black neon-text-gold mb-6">
                  CARD PACK
                </h2>

                {/* Pack Visual */}
                <motion.div
                  className="w-48 h-64 mx-auto mb-6 rounded-xl bg-gradient-to-br from-purple-600 via-pink-500 to-orange-500 flex items-center justify-center cursor-pointer"
                  style={{
                    boxShadow: "0 0 40px rgba(147, 51, 234, 0.5)",
                  }}
                  whileHover={{ scale: 1.05, rotate: [-1, 1, -1, 0] }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleOpenPack}
                >
                  <div className="text-center">
                    <div className="text-6xl mb-2">🎴</div>
                    <div className="text-white font-bold">x3 Cards</div>
                  </div>
                </motion.div>

                <p className="text-gray-400 mb-4">
                  Packs Available: <span className="text-yellow-400 font-bold">{packCount}</span>
                </p>

                <div className="flex gap-4">
                  <motion.button
                    onClick={handleOpenPack}
                    disabled={packCount <= 0 || loading}
                    className="flex-1 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-lg disabled:opacity-50"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {loading ? "Opening..." : "OPEN PACK"}
                  </motion.button>
                  <motion.button
                    onClick={onClose}
                    className="px-6 py-4 bg-gray-700 text-white font-bold rounded-lg"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Close
                  </motion.button>
                </div>
              </motion.div>
            )}

            {/* Opening Animation */}
            {phase === "opening" && (
              <motion.div
                className="text-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <motion.div
                  className="w-48 h-64 mx-auto rounded-xl bg-gradient-to-br from-purple-600 via-pink-500 to-orange-500"
                  animate={{
                    scale: [1, 1.1, 1.2, 0],
                    rotate: [0, 10, -10, 0],
                    opacity: [1, 1, 1, 0],
                  }}
                  transition={{ duration: 1.5 }}
                  style={{
                    boxShadow: "0 0 60px rgba(147, 51, 234, 0.8)",
                  }}
                />
                <motion.div
                  className="absolute inset-0 flex items-center justify-center"
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: [0, 1.5, 1], opacity: [0, 1, 0] }}
                  transition={{ delay: 0.8, duration: 0.7 }}
                >
                  <div className="text-8xl">✨</div>
                </motion.div>
              </motion.div>
            )}

            {/* Card Reveal */}
            {phase === "reveal" && cards.length > 0 && revealedIndex >= 0 && (
              <motion.div
                className="text-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                onClick={handleRevealNext}
              >
                <p className="text-gray-400 mb-4">
                  Card {revealedIndex + 1} / {cards.length}
                </p>

                <motion.div
                  key={revealedIndex}
                  className={`w-64 mx-auto p-6 rounded-xl bg-gradient-to-br ${
                    RARITY_CONFIG[cards[revealedIndex].rarity].bgGradient
                  }`}
                  style={getRarityStyle(cards[revealedIndex].rarity)}
                  initial={{ rotateY: 180, opacity: 0 }}
                  animate={{ rotateY: 0, opacity: 1 }}
                  transition={{ duration: 0.6, type: "spring" }}
                >
                  {/* Rarity Badge */}
                  <div
                    className={`inline-block px-3 py-1 rounded-full text-xs font-bold mb-4 ${
                      RARITY_CONFIG[cards[revealedIndex].rarity].color
                    } bg-black/50`}
                  >
                    {RARITY_CONFIG[cards[revealedIndex].rarity].name.toUpperCase()}
                    {cards[revealedIndex].isNew && (
                      <span className="ml-2 text-green-400">NEW!</span>
                    )}
                  </div>

                  {/* Card Content */}
                  <p className="text-white text-sm mb-4 min-h-[60px]">
                    {cards[revealedIndex].prompt}
                  </p>

                  <div className="border-t border-white/20 pt-4">
                    <div className="text-xs text-gray-300 mb-1">Answer</div>
                    <div className="text-lg font-bold text-white">
                      {cards[revealedIndex].answer}
                    </div>
                  </div>
                </motion.div>

                <p className="text-gray-500 text-sm mt-6">Tap to continue</p>
              </motion.div>
            )}

            {/* Done */}
            {phase === "done" && (
              <motion.div
                className="text-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <h2 className="text-2xl font-black neon-text-gold mb-6">
                  CARDS OBTAINED!
                </h2>

                {/* All Cards Summary */}
                <div className="space-y-3 mb-6">
                  {cards.map((card, index) => (
                    <motion.div
                      key={card.id}
                      className={`p-4 rounded-lg bg-gradient-to-r ${
                        RARITY_CONFIG[card.rarity].bgGradient
                      }`}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <div className="flex items-center justify-between">
                        <div className="text-left">
                          <span
                            className={`text-xs font-bold ${
                              RARITY_CONFIG[card.rarity].color
                            }`}
                          >
                            {RARITY_CONFIG[card.rarity].name}
                          </span>
                          {card.isNew && (
                            <span className="ml-2 text-xs text-green-400">
                              NEW!
                            </span>
                          )}
                          <p className="text-white text-sm line-clamp-1">
                            {card.prompt}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>

                <div className="flex gap-4">
                  {packCount > 1 && (
                    <motion.button
                      onClick={handleReset}
                      className="flex-1 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-lg"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      OPEN MORE
                    </motion.button>
                  )}
                  <motion.button
                    onClick={onClose}
                    className={`${packCount > 1 ? "" : "flex-1"} px-6 py-4 bg-gray-700 text-white font-bold rounded-lg`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Done
                  </motion.button>
                </div>
              </motion.div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
