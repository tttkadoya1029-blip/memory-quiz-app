"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

interface CollectionCard {
  id: string;
  prompt: string;
  choiceA: string;
  choiceB: string;
  choiceC: string;
  choiceD: string;
  correctChoice: string;
  explanation: string | null;
  isLearned: boolean;
  correctCount: number;
  wrongCount: number;
  masteryLevel: number;
}

interface PlayerStats {
  level: number;
  exp: number;
  coins: number;
  totalWins: number;
  totalGames: number;
}

export default function CollectionPage() {
  const router = useRouter();
  const [cards, setCards] = useState<CollectionCard[]>([]);
  const [playerStats, setPlayerStats] = useState<PlayerStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedCard, setSelectedCard] = useState<CollectionCard | null>(null);
  const [filter, setFilter] = useState<"all" | "learned" | "unlearned">("all");

  useEffect(() => {
    const fetchCollection = async () => {
      try {
        const res = await fetch("/api/collection");
        const data = await res.json();
        setCards(data.cards);
        setPlayerStats(data.playerStats);
      } catch (error) {
        console.error("Failed to fetch collection:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchCollection();
  }, []);

  const filteredCards = cards.filter((card) => {
    if (filter === "learned") return card.isLearned;
    if (filter === "unlearned") return !card.isLearned;
    return true;
  });

  const getMasteryColor = (level: number) => {
    switch (level) {
      case 5:
        return "from-yellow-400 to-orange-500"; // Master - Gold
      case 4:
        return "from-purple-400 to-pink-500"; // Expert - Purple
      case 3:
        return "from-blue-400 to-cyan-500"; // Advanced - Blue
      case 2:
        return "from-green-400 to-emerald-500"; // Intermediate - Green
      case 1:
        return "from-gray-400 to-gray-500"; // Beginner - Gray
      default:
        return "from-gray-600 to-gray-700"; // Not learned
    }
  };

  const getMasteryLabel = (level: number) => {
    switch (level) {
      case 5:
        return "MASTER";
      case 4:
        return "EXPERT";
      case 3:
        return "ADVANCED";
      case 2:
        return "INTERMEDIATE";
      case 1:
        return "BEGINNER";
      default:
        return "UNKNOWN";
    }
  };

  if (loading) {
    return (
      <div className="duel-bg flex items-center justify-center">
        <div className="text-xl text-cyan-400">Loading Collection...</div>
      </div>
    );
  }

  return (
    <div className="duel-bg min-h-screen">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-black/80 backdrop-blur-sm border-b border-gray-700">
        <div className="max-w-lg mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => router.push("/")}
              className="text-gray-400 hover:text-white"
            >
              ← Back
            </button>
            <h1 className="text-xl font-bold neon-text-blue">COLLECTION</h1>
            <div className="w-12" />
          </div>

          {/* Stats Bar */}
          {playerStats && (
            <div className="flex justify-around text-center text-sm mb-4">
              <div>
                <div className="text-purple-400 font-bold">
                  Lv.{playerStats.level}
                </div>
                <div className="text-xs text-gray-500">Level</div>
              </div>
              <div>
                <div className="text-yellow-400 font-bold flex items-center justify-center gap-1">
                  {playerStats.coins} 🪙
                </div>
                <div className="text-xs text-gray-500">Coins</div>
              </div>
              <div>
                <div className="text-green-400 font-bold">
                  {playerStats.totalWins}/{playerStats.totalGames}
                </div>
                <div className="text-xs text-gray-500">Wins</div>
              </div>
            </div>
          )}

          {/* Collection Progress */}
          <div className="mb-4">
            <div className="flex justify-between text-xs text-gray-400 mb-1">
              <span>Collection Progress</span>
              <span>
                {cards.filter((c) => c.isLearned).length} / {cards.length}
              </span>
            </div>
            <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-cyan-500 to-blue-500"
                initial={{ width: 0 }}
                animate={{
                  width: `${
                    (cards.filter((c) => c.isLearned).length / cards.length) *
                    100
                  }%`,
                }}
                transition={{ duration: 0.5 }}
              />
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="flex gap-2">
            {(["all", "learned", "unlearned"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                  filter === f
                    ? "bg-cyan-600 text-white"
                    : "bg-gray-700 text-gray-400 hover:bg-gray-600"
                }`}
              >
                {f === "all"
                  ? `ALL (${cards.length})`
                  : f === "learned"
                  ? `LEARNED (${cards.filter((c) => c.isLearned).length})`
                  : `NEW (${cards.filter((c) => !c.isLearned).length})`}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Card Grid */}
      <div className="max-w-lg mx-auto px-4 py-6">
        <div className="grid grid-cols-2 gap-4">
          {filteredCards.map((card, index) => (
            <motion.div
              key={card.id}
              className={`game-card p-4 cursor-pointer ${
                card.isLearned ? "" : "opacity-50"
              }`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setSelectedCard(card)}
            >
              {/* Mastery Badge */}
              {card.isLearned && (
                <div
                  className={`absolute top-2 right-2 w-6 h-6 rounded-full bg-gradient-to-br ${getMasteryColor(
                    card.masteryLevel
                  )} flex items-center justify-center text-xs font-bold text-white`}
                >
                  {card.masteryLevel}
                </div>
              )}

              {/* Card Content */}
              <div className="text-xs text-gray-500 mb-2">
                #{cards.indexOf(card) + 1}
              </div>
              <p className="text-sm text-white line-clamp-3 leading-snug">
                {card.isLearned ? card.prompt : "???"}
              </p>

              {/* Stats */}
              {card.isLearned && (
                <div className="mt-3 flex gap-2 text-xs">
                  <span className="text-green-400">✓{card.correctCount}</span>
                  <span className="text-red-400">✗{card.wrongCount}</span>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>

      {/* Card Detail Modal */}
      <AnimatePresence>
        {selectedCard && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedCard(null)}
          >
            <motion.div
              className="game-card w-full max-w-md p-6"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Mastery Header */}
              {selectedCard.isLearned && (
                <div
                  className={`inline-block px-3 py-1 rounded-full text-xs font-bold text-white bg-gradient-to-r ${getMasteryColor(
                    selectedCard.masteryLevel
                  )} mb-4`}
                >
                  {getMasteryLabel(selectedCard.masteryLevel)}
                </div>
              )}

              {/* Question */}
              <h3 className="text-lg font-bold text-white mb-4">
                {selectedCard.prompt}
              </h3>

              {/* Choices */}
              <div className="space-y-2 mb-4">
                {(["A", "B", "C", "D"] as const).map((choice) => (
                  <div
                    key={choice}
                    className={`p-3 rounded-lg text-sm ${
                      choice === selectedCard.correctChoice
                        ? "bg-green-500/20 border border-green-500 text-green-400"
                        : "bg-gray-700/50 text-gray-300"
                    }`}
                  >
                    <span className="font-bold mr-2">{choice}.</span>
                    {selectedCard[
                      `choice${choice}` as keyof CollectionCard
                    ] as string}
                    {choice === selectedCard.correctChoice && (
                      <span className="ml-2">✓</span>
                    )}
                  </div>
                ))}
              </div>

              {/* Explanation */}
              {selectedCard.explanation && (
                <div className="p-4 bg-black/30 rounded-lg text-sm text-gray-300 mb-4">
                  <div className="text-xs text-cyan-400 mb-1">EXPLANATION</div>
                  {selectedCard.explanation}
                </div>
              )}

              {/* Stats */}
              <div className="flex justify-around text-center border-t border-gray-700 pt-4">
                <div>
                  <div className="text-2xl font-bold text-green-400">
                    {selectedCard.correctCount}
                  </div>
                  <div className="text-xs text-gray-500">Correct</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-red-400">
                    {selectedCard.wrongCount}
                  </div>
                  <div className="text-xs text-gray-500">Wrong</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-cyan-400">
                    {selectedCard.correctCount + selectedCard.wrongCount > 0
                      ? Math.round(
                          (selectedCard.correctCount /
                            (selectedCard.correctCount +
                              selectedCard.wrongCount)) *
                            100
                        )
                      : 0}
                    %
                  </div>
                  <div className="text-xs text-gray-500">Accuracy</div>
                </div>
              </div>

              {/* Close Button */}
              <button
                onClick={() => setSelectedCard(null)}
                className="w-full mt-4 py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-600"
              >
                Close
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
