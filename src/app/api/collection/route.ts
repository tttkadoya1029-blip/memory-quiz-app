import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    // Get all questions with their learning state
    const questions = await prisma.question.findMany({
      include: {
        userState: true,
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    // Transform to collection cards
    const cards = questions.map((q) => ({
      id: q.id,
      prompt: q.prompt,
      choiceA: q.choiceA,
      choiceB: q.choiceB,
      choiceC: q.choiceC,
      choiceD: q.choiceD,
      correctChoice: q.correctChoice,
      explanation: q.explanation,
      isLearned: q.userState !== null,
      correctCount: q.userState?.correctCount ?? 0,
      wrongCount: q.userState?.wrongCount ?? 0,
      masteryLevel: getMasteryLevel(
        q.userState?.correctCount ?? 0,
        q.userState?.wrongCount ?? 0
      ),
    }));

    // Get player stats
    const playerStats = await prisma.playerStats.findFirst();

    return NextResponse.json({
      cards,
      totalCards: cards.length,
      learnedCards: cards.filter((c) => c.isLearned).length,
      playerStats: playerStats
        ? {
            level: playerStats.level,
            exp: playerStats.exp,
            coins: playerStats.coins,
            totalWins: playerStats.totalWins,
            totalGames: playerStats.totalGames,
          }
        : null,
    });
  } catch (error) {
    console.error("Failed to fetch collection:", error);
    return NextResponse.json(
      { error: "Failed to fetch collection" },
      { status: 500 }
    );
  }
}

function getMasteryLevel(correct: number, wrong: number): number {
  // 0: Not learned, 1-5: Mastery levels based on accuracy and attempts
  if (correct + wrong === 0) return 0;

  const accuracy = correct / (correct + wrong);
  const totalAttempts = correct + wrong;

  if (accuracy >= 0.9 && totalAttempts >= 5) return 5; // Master
  if (accuracy >= 0.8 && totalAttempts >= 3) return 4; // Expert
  if (accuracy >= 0.7 && totalAttempts >= 2) return 3; // Advanced
  if (accuracy >= 0.5) return 2; // Intermediate
  return 1; // Beginner
}
