"use client";

import { motion } from "framer-motion";

interface QuestionCardProps {
  prompt: string;
  questionNumber: number;
  totalQuestions: number;
}

export function QuestionCard({
  prompt,
  questionNumber,
  totalQuestions,
}: QuestionCardProps) {
  return (
    <motion.div
      className="game-card p-6 w-full"
      initial={{ opacity: 0, y: 20, rotateX: -15 }}
      animate={{ opacity: 1, y: 0, rotateX: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      {/* Card header */}
      <div className="flex justify-between items-center mb-4">
        <span className="text-xs text-cyan-400 uppercase tracking-wider font-bold">
          Question
        </span>
        <span className="text-xs text-gray-400">
          {questionNumber} / {totalQuestions}
        </span>
      </div>

      {/* Question content */}
      <div className="min-h-[80px] flex items-center justify-center">
        <p className="text-lg text-white text-center font-medium leading-relaxed">
          {prompt}
        </p>
      </div>

      {/* Card decoration */}
      <div className="absolute top-2 right-2 w-8 h-8 opacity-20">
        <svg viewBox="0 0 24 24" fill="currentColor" className="text-cyan-400">
          <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
        </svg>
      </div>
    </motion.div>
  );
}
