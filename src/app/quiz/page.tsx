"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";

interface Question {
  id: string;
  prompt: string;
  choiceA: string;
  choiceB: string;
  choiceC: string;
  choiceD: string;
}

interface AnswerResult {
  isCorrect: boolean;
  correctChoice: string;
  explanation: string | null;
  nextDueAt: string;
}

type Feeling = "hard" | "normal" | "easy";

export default function QuizPage() {
  const router = useRouter();
  const [question, setQuestion] = useState<Question | null>(null);
  const [questionType, setQuestionType] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedChoice, setSelectedChoice] = useState<string | null>(null);
  const [answerResult, setAnswerResult] = useState<AnswerResult | null>(null);
  const [lastQuestionId, setLastQuestionId] = useState<string | null>(null);
  const [sessionStats, setSessionStats] = useState({
    answered: 0,
    correct: 0,
  });

  const fetchNextQuestion = useCallback(async (excludeId?: string) => {
    setLoading(true);
    setSelectedChoice(null);
    setAnswerResult(null);

    try {
      const url = excludeId
        ? `/api/quiz/next?exclude=${excludeId}`
        : "/api/quiz/next";
      const res = await fetch(url);
      const data = await res.json();

      if (data.question) {
        setQuestion(data.question);
        setQuestionType(data.type);
      } else {
        setQuestion(null);
      }
    } catch (error) {
      console.error("Failed to fetch question:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNextQuestion();
  }, [fetchNextQuestion]);

  const handleChoiceSelect = (choice: string) => {
    if (answerResult) return;
    setSelectedChoice(choice);
  };

  const handleFeelingSubmit = async (feeling: Feeling) => {
    if (!question || !selectedChoice) return;

    try {
      const res = await fetch("/api/quiz/answer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          questionId: question.id,
          selectedChoice,
          feeling,
        }),
      });

      const result: AnswerResult = await res.json();
      setAnswerResult(result);

      setSessionStats((prev) => ({
        answered: prev.answered + 1,
        correct: prev.correct + (result.isCorrect ? 1 : 0),
      }));

      setLastQuestionId(question.id);
    } catch (error) {
      console.error("Failed to submit answer:", error);
    }
  };

  const handleNext = () => {
    fetchNextQuestion(lastQuestionId ?? undefined);
  };

  const handleFinish = () => {
    const params = new URLSearchParams({
      answered: sessionStats.answered.toString(),
      correct: sessionStats.correct.toString(),
    });
    router.push(`/result?${params.toString()}`);
  };

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <p className="text-lg">読み込み中...</p>
      </main>
    );
  }

  if (!question) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center p-8">
        <p className="text-xl mb-8">出題できる問題がありません</p>
        <button
          onClick={handleFinish}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg"
        >
          結果を見る
        </button>
      </main>
    );
  }

  const getChoiceStyle = (choice: string) => {
    const baseStyle =
      "w-full p-4 text-left rounded-lg border-2 transition-colors ";

    if (!selectedChoice) {
      return baseStyle + "border-gray-300 hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900";
    }

    if (answerResult) {
      if (choice === answerResult.correctChoice) {
        return baseStyle + "border-green-500 bg-green-100 dark:bg-green-900";
      }
      if (choice === selectedChoice && !answerResult.isCorrect) {
        return baseStyle + "border-red-500 bg-red-100 dark:bg-red-900";
      }
    } else if (choice === selectedChoice) {
      return baseStyle + "border-blue-500 bg-blue-100 dark:bg-blue-900";
    }

    return baseStyle + "border-gray-300 opacity-50";
  };

  const getTypeLabel = () => {
    switch (questionType) {
      case "due":
        return "復習";
      case "new":
        return "新規";
      case "review":
        return "復習";
      default:
        return "";
    }
  };

  return (
    <main className="min-h-screen flex flex-col items-center p-8">
      <div className="w-full max-w-2xl">
        <div className="flex justify-between items-center mb-6">
          <span className="text-sm bg-gray-200 dark:bg-gray-700 px-3 py-1 rounded">
            {getTypeLabel()}
          </span>
          <span className="text-sm">
            正解: {sessionStats.correct} / {sessionStats.answered}
          </span>
        </div>

        <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold">{question.prompt}</h2>
        </div>

        <div className="space-y-3 mb-6">
          {(["A", "B", "C", "D"] as const).map((choice) => (
            <button
              key={choice}
              onClick={() => handleChoiceSelect(choice)}
              disabled={!!answerResult}
              className={getChoiceStyle(choice)}
            >
              <span className="font-bold mr-3">{choice}.</span>
              {question[`choice${choice}` as keyof Question]}
            </button>
          ))}
        </div>

        {selectedChoice && !answerResult && (
          <div className="bg-yellow-50 dark:bg-yellow-900 rounded-lg p-6 mb-6">
            <p className="text-center mb-4 font-semibold">この問題の難易度は？</p>
            <div className="flex justify-center gap-4">
              <button
                onClick={() => handleFeelingSubmit("hard")}
                className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-lg"
              >
                難しかった
              </button>
              <button
                onClick={() => handleFeelingSubmit("normal")}
                className="bg-yellow-500 hover:bg-yellow-600 text-white px-6 py-2 rounded-lg"
              >
                普通
              </button>
              <button
                onClick={() => handleFeelingSubmit("easy")}
                className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-lg"
              >
                簡単
              </button>
            </div>
          </div>
        )}

        {answerResult && (
          <div
            className={`rounded-lg p-6 mb-6 ${
              answerResult.isCorrect
                ? "bg-green-100 dark:bg-green-900"
                : "bg-red-100 dark:bg-red-900"
            }`}
          >
            <p className="text-2xl font-bold text-center mb-4">
              {answerResult.isCorrect ? "正解！" : "不正解..."}
            </p>
            <p className="mb-2">
              <span className="font-semibold">正解:</span> {answerResult.correctChoice}
            </p>
            {answerResult.explanation && (
              <p className="text-sm mt-4 p-4 bg-white/50 dark:bg-black/20 rounded">
                {answerResult.explanation}
              </p>
            )}
          </div>
        )}

        {answerResult && (
          <div className="flex justify-center gap-4">
            <button
              onClick={handleNext}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg"
            >
              次の問題へ
            </button>
            <button
              onClick={handleFinish}
              className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-3 px-8 rounded-lg"
            >
              終了する
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
