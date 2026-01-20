"use client";

import { motion } from "framer-motion";
import { SkillType, SKILLS } from "@/lib/skills";

interface SkillButtonProps {
  type: SkillType;
  usesLeft: number;
  isActive: boolean;
  disabled: boolean;
  onUse: () => void;
}

export function SkillButton({
  type,
  usesLeft,
  isActive,
  disabled,
  onUse,
}: SkillButtonProps) {
  const skill = SKILLS[type];
  const isUsable = usesLeft > 0 && !isActive && !disabled;

  return (
    <motion.button
      onClick={onUse}
      disabled={!isUsable}
      className={`relative flex flex-col items-center justify-center p-3 rounded-xl transition-all ${
        isUsable
          ? "bg-gradient-to-br from-purple-600 to-pink-600 text-white cursor-pointer"
          : "bg-gray-700 text-gray-500 cursor-not-allowed"
      }`}
      style={{
        boxShadow: isUsable ? "0 0 20px rgba(147, 51, 234, 0.4)" : "none",
      }}
      whileHover={isUsable ? { scale: 1.05 } : {}}
      whileTap={isUsable ? { scale: 0.95 } : {}}
    >
      {/* Icon */}
      <span className="text-2xl mb-1">{skill.icon}</span>

      {/* Name */}
      <span className="text-xs font-bold">{skill.name}</span>

      {/* Uses Left Badge */}
      <div
        className={`absolute -top-1 -right-1 w-5 h-5 rounded-full text-xs font-bold flex items-center justify-center ${
          usesLeft > 0 ? "bg-yellow-500 text-black" : "bg-gray-600 text-gray-400"
        }`}
      >
        {usesLeft}
      </div>

      {/* Active Indicator */}
      {isActive && (
        <motion.div
          className="absolute inset-0 rounded-xl border-2 border-green-400"
          animate={{ opacity: [1, 0.5, 1] }}
          transition={{ duration: 1, repeat: Infinity }}
        />
      )}
    </motion.button>
  );
}
