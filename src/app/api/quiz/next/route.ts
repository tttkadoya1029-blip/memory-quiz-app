import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const excludeId = searchParams.get("exclude");
  const now = new Date();

  // 1. due（nextDueAt <= now）の問題からランダムに1問
  const dueQuestions = await prisma.question.findMany({
    where: {
      userState: {
        nextDueAt: {
          lte: now,
        },
      },
      ...(excludeId ? { id: { not: excludeId } } : {}),
    },
    include: {
      userState: true,
    },
  });

  if (dueQuestions.length > 0) {
    const randomIndex = Math.floor(Math.random() * dueQuestions.length);
    const question = dueQuestions[randomIndex];
    return NextResponse.json({
      question: {
        id: question.id,
        prompt: question.prompt,
        choiceA: question.choiceA,
        choiceB: question.choiceB,
        choiceC: question.choiceC,
        choiceD: question.choiceD,
      },
      type: "due",
    });
  }

  // 2. 未学習（userStateがない）からランダムに1問
  const newQuestions = await prisma.question.findMany({
    where: {
      userState: null,
      ...(excludeId ? { id: { not: excludeId } } : {}),
    },
  });

  if (newQuestions.length > 0) {
    const randomIndex = Math.floor(Math.random() * newQuestions.length);
    const question = newQuestions[randomIndex];
    return NextResponse.json({
      question: {
        id: question.id,
        prompt: question.prompt,
        choiceA: question.choiceA,
        choiceB: question.choiceB,
        choiceC: question.choiceC,
        choiceD: question.choiceD,
      },
      type: "new",
    });
  }

  // 3. 全体からランダムに1問
  const allQuestions = await prisma.question.findMany({
    where: excludeId ? { id: { not: excludeId } } : {},
  });

  if (allQuestions.length > 0) {
    const randomIndex = Math.floor(Math.random() * allQuestions.length);
    const question = allQuestions[randomIndex];
    return NextResponse.json({
      question: {
        id: question.id,
        prompt: question.prompt,
        choiceA: question.choiceA,
        choiceB: question.choiceB,
        choiceC: question.choiceC,
        choiceD: question.choiceD,
      },
      type: "review",
    });
  }

  return NextResponse.json({ question: null, type: null });
}
