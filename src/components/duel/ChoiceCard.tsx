"use client";

import { motion } from "framer-motion";

interface ChoiceCardProps {
  choice: "A" | "B" | "C" | "D";
  text: string;
  onClick: () => void;
  disabled?: boolean;
  state?: "default" | "selected" | "correct" | "wrong";
  delay?: number;
}

export function ChoiceCard({
  choice,
  text,
  onClick,
  disabled = false,
  state = "default",
  delay = 0,
}: ChoiceCardProps) {
  const getCardClass = () => {
    switch (state) {
      case "correct":
        return "game-card game-card-correct";
      case "wrong":
        return "game-card game-card-wrong";
      case "selected":
        return "game-card game-card-active";
      default:
        return "game-card hover:game-card-active";
    }
  };

  const getChoiceBadgeClass = () => {
    switch (state) {
      case "correct":
        return "bg-green-500";
      case "wrong":
        return "bg-red-500";
      case "selected":
        return "bg-cyan-500";
      default:
        return "bg-gray-600";
    }
  };

  return (
    <motion.button
      className={`${getCardClass()} w-full p-4 text-left transition-all duration-200 ${
        disabled ? "opacity-60 cursor-not-allowed" : "cursor-pointer"
      }`}
      onClick={onClick}
      disabled={disabled}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, delay: delay * 0.1 }}
      whileHover={!disabled ? { scale: 1.02 } : {}}
      whileTap={!disabled ? { scale: 0.98 } : {}}
    >
      <div className="flex items-center gap-3">
        {/* Choice badge */}
        <span
          className={`${getChoiceBadgeClass()} w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0`}
        >
          {choice}
        </span>
        {/* Choice text */}
        <span className="text-white text-sm leading-snug">{text}</span>
      </div>

      {/* Result indicator */}
      {state === "correct" && (
        <motion.div
          className="absolute top-2 right-2"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 500, damping: 20 }}
        >
          <span className="text-green-400 text-xl">✓</span>
        </motion.div>
      )}
      {state === "wrong" && (
        <motion.div
          className="absolute top-2 right-2"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 500, damping: 20 }}
        >
          <span className="text-red-400 text-xl">✗</span>
        </motion.div>
      )}
    </motion.button>
  );
}
