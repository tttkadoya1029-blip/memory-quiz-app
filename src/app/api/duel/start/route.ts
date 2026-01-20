import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { GAME_CONFIG } from "@/lib/duel-logic";

export async function GET() {
  try {
    // Get random questions for the duel
    const allQuestions = await prisma.question.findMany();

    // Shuffle and pick questions
    const shuffled = allQuestions.sort(() => Math.random() - 0.5);
    const questions = shuffled.slice(0, GAME_CONFIG.QUESTIONS_PER_BATTLE);

    // Return only the fields needed for the game (not correctChoice)
    const gameQuestions = questions.map((q) => ({
      id: q.id,
      prompt: q.prompt,
      choiceA: q.choiceA,
      choiceB: q.choiceB,
      choiceC: q.choiceC,
      choiceD: q.choiceD,
    }));

    return NextResponse.json({
      questions: gameQuestions,
      totalQuestions: questions.length,
    });
  } catch (error) {
    console.error("Failed to start duel:", error);
    return NextResponse.json(
      { error: "Failed to start duel" },
      { status: 500 }
    );
  }
}
