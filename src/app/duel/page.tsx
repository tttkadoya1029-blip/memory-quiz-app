"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { HPBar } from "@/components/duel/HPBar";
import { EnemyAvatar } from "@/components/duel/EnemyAvatar";
import { QuestionCard } from "@/components/duel/QuestionCard";
import { ChoiceCard } from "@/components/duel/ChoiceCard";
import { ComboCounter } from "@/components/duel/ComboCounter";
import { DamageEffect } from "@/components/duel/DamageEffect";
import { BattleStartOverlay } from "@/components/duel/BattleStartOverlay";
import {
  DuelState,
  createInitialDuelState,
  processAnswer,
  GAME_CONFIG,
  getEnemyName,
} from "@/lib/duel-logic";

interface Question {
  id: string;
  prompt: string;
  choiceA: string;
  choiceB: string;
  choiceC: string;
  choiceD: string;
}

type ChoiceKey = "A" | "B" | "C" | "D";
type ChoiceState = "default" | "selected" | "correct" | "wrong";

export default function DuelPage() {
  const router = useRouter();
  const [showBattleStart, setShowBattleStart] = useState(true);
  const [duelState, setDuelState] = useState<DuelState>(createInitialDuelState());
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedChoice, setSelectedChoice] = useState<ChoiceKey | null>(null);
  const [choiceStates, setChoiceStates] = useState<Record<ChoiceKey, ChoiceState>>({
    A: "default",
    B: "default",
    C: "default",
    D: "default",
  });
  const [correctChoice, setCorrectChoice] = useState<ChoiceKey | null>(null);
  const [showDamageEffect, setShowDamageEffect] = useState(false);
  const [lastDamage, setLastDamage] = useState(0);
  const [lastDamageToPlayer, setLastDamageToPlayer] = useState(false);
  const [isEnemyHit, setIsEnemyHit] = useState(false);
  const [showComboPop, setShowComboPop] = useState(false);
  const [isAnswering, setIsAnswering] = useState(false);
  const [enemyName] = useState(() => getEnemyName(1));

  // Fetch all questions at start
  const fetchQuestions = useCallback(async () => {
    try {
      const res = await fetch("/api/duel/start");
      const data = await res.json();
      if (data.questions && data.questions.length > 0) {
        setQuestions(data.questions);
        setCurrentQuestion(data.questions[0]);
      }
    } catch (error) {
      console.error("Failed to fetch questions:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchQuestions();
  }, [fetchQuestions]);

  const handleChoiceSelect = async (choice: ChoiceKey) => {
    if (isAnswering || selectedChoice) return;
    setIsAnswering(true);
    setSelectedChoice(choice);

    // Update choice state to selected
    setChoiceStates((prev) => ({
      ...prev,
      [choice]: "selected",
    }));

    try {
      // Submit answer to API
      const res = await fetch("/api/duel/answer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          questionId: currentQuestion?.id,
          selectedChoice: choice,
        }),
      });

      const result = await res.json();
      const isCorrect = result.isCorrect;
      const correct = result.correctChoice as ChoiceKey;
      setCorrectChoice(correct);

      // Update choice states
      setChoiceStates({
        A: correct === "A" ? "correct" : choice === "A" && !isCorrect ? "wrong" : "default",
        B: correct === "B" ? "correct" : choice === "B" && !isCorrect ? "wrong" : "default",
        C: correct === "C" ? "correct" : choice === "C" && !isCorrect ? "wrong" : "default",
        D: correct === "D" ? "correct" : choice === "D" && !isCorrect ? "wrong" : "default",
      });

      // Process game logic
      const { newState, damage, damageToPlayer } = processAnswer(duelState, isCorrect);
      setDuelState(newState);
      setLastDamage(damage);
      setLastDamageToPlayer(damageToPlayer);

      // Show effects
      if (isCorrect) {
        setIsEnemyHit(true);
        setShowComboPop(true);
        setTimeout(() => setIsEnemyHit(false), 300);
        setTimeout(() => setShowComboPop(false), 300);
      }

      setShowDamageEffect(true);
      setTimeout(() => setShowDamageEffect(false), 500);

      // Wait and move to next question
      setTimeout(() => {
        if (newState.isGameOver) {
          // Navigate to result
          const params = new URLSearchParams({
            correct: newState.correctCount.toString(),
            wrong: newState.wrongCount.toString(),
            maxCombo: newState.maxCombo.toString(),
            playerHp: newState.playerHp.toString(),
            enemyHp: newState.enemyHp.toString(),
            isVictory: newState.isVictory.toString(),
            total: newState.totalQuestions.toString(),
          });
          router.push(`/duel/result?${params.toString()}`);
        } else {
          // Next question
          const nextIndex = newState.currentQuestion;
          if (nextIndex < questions.length) {
            setCurrentQuestion(questions[nextIndex]);
          }
          setSelectedChoice(null);
          setCorrectChoice(null);
          setChoiceStates({
            A: "default",
            B: "default",
            C: "default",
            D: "default",
          });
          setIsAnswering(false);
        }
      }, 1200);
    } catch (error) {
      console.error("Failed to submit answer:", error);
      setIsAnswering(false);
    }
  };

  if (loading) {
    return (
      <div className="duel-bg flex items-center justify-center">
        <motion.div
          className="text-xl text-cyan-400"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          Loading...
        </motion.div>
      </div>
    );
  }

  if (!currentQuestion) {
    return (
      <div className="duel-bg flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl text-white mb-4">問題がありません</p>
          <button
            onClick={() => router.push("/")}
            className="px-6 py-3 bg-cyan-600 text-white rounded-lg"
          >
            ホームへ戻る
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="duel-bg relative overflow-hidden">
      {/* Battle Start Overlay */}
      <BattleStartOverlay
        show={showBattleStart}
        enemyName={enemyName}
        onComplete={() => setShowBattleStart(false)}
      />

      {/* Damage Effect */}
      <DamageEffect
        damage={lastDamage}
        isPlayerDamage={lastDamageToPlayer}
        show={showDamageEffect}
      />

      {/* Main Game UI */}
      <div className="max-w-lg mx-auto px-4 py-6 flex flex-col min-h-screen">
        {/* Enemy Section */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <EnemyAvatar name={enemyName} isHit={isEnemyHit} />
            <div className="flex-1 ml-4">
              <HPBar
                current={duelState.enemyHp}
                max={GAME_CONFIG.ENEMY_MAX_HP}
                isPlayer={false}
                label="Enemy HP"
                showDamage={!lastDamageToPlayer ? lastDamage : undefined}
              />
            </div>
          </div>
        </div>

        {/* Battle Info */}
        <div className="flex justify-between items-center mb-4">
          <ComboCounter combo={duelState.combo} showPop={showComboPop} />
          <div className="text-sm text-gray-400">
            <span className="text-green-400">{duelState.correctCount}</span>
            <span className="mx-1">/</span>
            <span className="text-red-400">{duelState.wrongCount}</span>
          </div>
        </div>

        {/* Question Card */}
        <div className="mb-6">
          <QuestionCard
            prompt={currentQuestion.prompt}
            questionNumber={duelState.currentQuestion + 1}
            totalQuestions={duelState.totalQuestions}
          />
        </div>

        {/* Choice Cards */}
        <div className="space-y-3 mb-6 flex-1">
          {(["A", "B", "C", "D"] as const).map((choice, index) => (
            <ChoiceCard
              key={choice}
              choice={choice}
              text={currentQuestion[`choice${choice}` as keyof Question] as string}
              onClick={() => handleChoiceSelect(choice)}
              disabled={isAnswering}
              state={choiceStates[choice]}
              delay={index}
            />
          ))}
        </div>

        {/* Player HP */}
        <div className="mt-auto pb-4">
          <HPBar
            current={duelState.playerHp}
            max={GAME_CONFIG.PLAYER_MAX_HP}
            isPlayer={true}
            label="Your HP"
            showDamage={lastDamageToPlayer ? lastDamage : undefined}
          />
        </div>
      </div>
    </div>
  );
}
