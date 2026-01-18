import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const now = new Date();

  // 今日の復習数（nextDueAt <= now）
  const dueCount = await prisma.userQuestionState.count({
    where: {
      nextDueAt: {
        lte: now,
      },
    },
  });

  // 未学習の問題数
  const totalQuestions = await prisma.question.count();
  const learnedQuestions = await prisma.userQuestionState.count();
  const newCount = totalQuestions - learnedQuestions;

  return NextResponse.json({
    dueCount,
    newCount,
    totalQuestions,
  });
}
