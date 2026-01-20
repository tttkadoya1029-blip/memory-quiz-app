"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { DailyMissionCard } from "./DailyMissionCard";
import { MissionProgressData } from "@/lib/missions";

interface DailyMissionPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export function DailyMissionPanel({ isOpen, onClose }: DailyMissionPanelProps) {
  const [missions, setMissions] = useState<MissionProgressData[]>([]);
  const [loading, setLoading] = useState(true);
  const [claiming, setClaiming] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchMissions();
    }
  }, [isOpen]);

  const fetchMissions = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/missions");
      const data = await res.json();
      setMissions(data.missions);
    } catch (error) {
      console.error("Failed to fetch missions:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleClaim = async (missionId: string) => {
    try {
      setClaiming(true);
      const res = await fetch("/api/missions/claim", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ missionId }),
      });

      if (res.ok) {
        // 更新
        setMissions((prev) =>
          prev.map((m) =>
            m.missionId === missionId ? { ...m, isClaimed: true } : m
          )
        );
      }
    } catch (error) {
      console.error("Failed to claim reward:", error);
    } finally {
      setClaiming(false);
    }
  };

  const completedCount = missions.filter((m) => m.isCompleted).length;

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
            className="w-full max-w-md max-h-[80vh] overflow-auto"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="game-card p-4 mb-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-black neon-text-gold">
                    DAILY MISSIONS
                  </h2>
                  <p className="text-xs text-gray-400">Complete to earn rewards!</p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-cyan-400">
                    {completedCount}/{missions.length}
                  </div>
                  <div className="text-xs text-gray-500">Completed</div>
                </div>
              </div>
            </div>

            {/* Mission List */}
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
            ) : (
              <div className="space-y-3">
                {missions.map((mission, index) => (
                  <motion.div
                    key={mission.missionId}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <DailyMissionCard
                      mission={mission}
                      onClaim={handleClaim}
                      claiming={claiming}
                    />
                  </motion.div>
                ))}
              </div>
            )}

            {/* Close Button */}
            <motion.button
              onClick={onClose}
              className="w-full mt-4 py-3 bg-gray-700 text-white font-bold rounded-lg hover:bg-gray-600"
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
