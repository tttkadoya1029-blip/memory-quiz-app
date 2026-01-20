"use client";

import { motion } from "framer-motion";
import { MissionProgressData } from "@/lib/missions";

interface DailyMissionCardProps {
  mission: MissionProgressData;
  onClaim: (missionId: string) => void;
  claiming: boolean;
}

export function DailyMissionCard({ mission, onClaim, claiming }: DailyMissionCardProps) {
  const progress = Math.min(mission.currentValue / mission.targetValue, 1);
  const progressPercent = Math.round(progress * 100);

  return (
    <motion.div
      className="game-card p-4"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
    >
      <div className="flex items-start gap-3">
        {/* Icon */}
        <div className="text-3xl">{mission.icon}</div>

        {/* Content */}
        <div className="flex-1">
          <div className="flex items-center justify-between mb-1">
            <h3 className="text-white font-bold text-sm">{mission.description}</h3>
            <span className="text-yellow-400 text-xs font-bold">
              +{mission.rewardCoins} 🪙
            </span>
          </div>

          {/* Progress Bar */}
          <div className="mb-2">
            <div className="flex justify-between text-xs text-gray-400 mb-1">
              <span>Progress</span>
              <span>
                {mission.currentValue} / {mission.targetValue}
              </span>
            </div>
            <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
              <motion.div
                className={`h-full ${
                  mission.isCompleted
                    ? "bg-gradient-to-r from-green-500 to-emerald-400"
                    : "bg-gradient-to-r from-cyan-500 to-blue-500"
                }`}
                initial={{ width: 0 }}
                animate={{ width: `${progressPercent}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
          </div>

          {/* Badge Reward */}
          {mission.rewardBadge && (
            <div className="text-xs text-purple-400 mb-2">
              + Badge Reward
            </div>
          )}

          {/* Claim Button */}
          {mission.isCompleted && !mission.isClaimed && (
            <motion.button
              onClick={() => onClaim(mission.missionId)}
              disabled={claiming}
              className="w-full py-2 bg-gradient-to-r from-yellow-500 to-orange-500 text-white text-sm font-bold rounded-lg hover:from-yellow-400 hover:to-orange-400 disabled:opacity-50"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {claiming ? "Claiming..." : "CLAIM REWARD"}
            </motion.button>
          )}

          {/* Claimed Badge */}
          {mission.isClaimed && (
            <div className="text-center py-2 text-green-400 text-sm font-bold">
              ✓ CLAIMED
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
