import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { calculateNextDueAt, Feeling } from "@/lib/scheduler";

interface AnswerRequest {
  questionId: string;
  selectedChoice: string;
  feeling: Feeling;
}

export async function POST(request: NextRequest) {
  const body: AnswerRequest = await request.json();
  const { questionId, selectedChoice, feeling } = body;
  const now = new Date();

  // 問題を取得
  const question = await prisma.question.findUnique({
    where: { id: questionId },
    include: { userState: true },
  });

  if (!question) {
    return NextResponse.json({ error: "Question not found" }, { status: 404 });
  }

  const isCorrect = question.correctChoice === selectedChoice;

  // 現在のstepを取得（stateがなければ0）
  const currentStep = question.userState?.step ?? 0;

  // 次のスケジュールを計算
  const { nextStep, nextDueAt, intervalMinutes } = calculateNextDueAt(
    currentStep,
    feeling,
    now
  );

  // UserQuestionStateを更新または作成
  if (question.userState) {
    await prisma.userQuestionState.update({
      where: { id: question.userState.id },
      data: {
        status: nextStep === 0 ? "learning" : "review",
        step: nextStep,
        lastAnsweredAt: now,
        nextDueAt: nextDueAt,
        correctCount: isCorrect
          ? question.userState.correctCount + 1
          : question.userState.correctCount,
        wrongCount: isCorrect
          ? question.userState.wrongCount
          : question.userState.wrongCount + 1,
        streak: isCorrect ? question.userState.streak + 1 : 0,
        lastFeeling: feeling,
      },
    });
  } else {
    await prisma.userQuestionState.create({
      data: {
        questionId: questionId,
        status: "learning",
        step: nextStep,
        lastAnsweredAt: now,
        nextDueAt: nextDueAt,
        correctCount: isCorrect ? 1 : 0,
        wrongCount: isCorrect ? 0 : 1,
        streak: isCorrect ? 1 : 0,
        lastFeeling: feeling,
      },
    });
  }

  // AnswerLogを作成
  await prisma.answerLog.create({
    data: {
      questionId: questionId,
      selectedChoice: selectedChoice,
      isCorrect: isCorrect,
      feeling: feeling,
      scheduledIntervalMinutes: intervalMinutes,
    },
  });

  return NextResponse.json({
    isCorrect,
    correctChoice: question.correctChoice,
    explanation: question.explanation,
    nextDueAt: nextDueAt.toISOString(),
  });
}
