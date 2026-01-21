"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { useState } from "react";

interface QuestionCardProps {
  prompt: string;
  imageUrl?: string | null;
  questionNumber: number;
  totalQuestions: number;
}

export function QuestionCard({
  prompt,
  imageUrl,
  questionNumber,
  totalQuestions,
}: QuestionCardProps) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  return (
    <motion.div
      className="game-card p-4 w-full"
      initial={{ opacity: 0, y: 20, rotateX: -15 }}
      animate={{ opacity: 1, y: 0, rotateX: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      {/* Card header */}
      <div className="flex justify-between items-center mb-3">
        <span className="text-xs text-cyan-400 uppercase tracking-wider font-bold">
          Question
        </span>
        <span className="text-xs text-gray-400">
          {questionNumber} / {totalQuestions}
        </span>
      </div>

      {/* Image (if available) */}
      {imageUrl && !imageError && (
        <div className="mb-4 relative">
          <div className="relative w-full h-48 rounded-lg overflow-hidden bg-gray-800">
            {!imageLoaded && (
              <div className="absolute inset-0 flex items-center justify-center">
                <motion.div
                  className="text-cyan-400 text-sm"
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 1, repeat: Infinity }}
                >
                  Loading...
                </motion.div>
              </div>
            )}
            <Image
              src={imageUrl}
              alt="Question image"
              fill
              className={`object-cover transition-opacity duration-300 ${
                imageLoaded ? "opacity-100" : "opacity-0"
              }`}
              onLoad={() => setImageLoaded(true)}
              onError={() => setImageError(true)}
              unoptimized
            />
          </div>
        </div>
      )}

      {/* Question content */}
      <div className={`${imageUrl ? "min-h-[40px]" : "min-h-[80px]"} flex items-center justify-center`}>
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
