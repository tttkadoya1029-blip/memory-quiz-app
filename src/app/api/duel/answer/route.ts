import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

interface AnswerRequest {
  questionId: string;
  selectedChoice: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: AnswerRequest = await request.json();
    const { questionId, selectedChoice } = body;

    // Get the question to check the correct answer
    const question = await prisma.question.findUnique({
      where: { id: questionId },
    });

    if (!question) {
      return NextResponse.json(
        { error: "Question not found" },
        { status: 404 }
      );
    }

    const isCorrect = question.correctChoice === selectedChoice;

    // Update UserQuestionState (optional, for tracking)
    const existingState = await prisma.userQuestionState.findUnique({
      where: { questionId },
    });

    if (existingState) {
      await prisma.userQuestionState.update({
        where: { id: existingState.id },
        data: {
          correctCount: isCorrect
            ? existingState.correctCount + 1
            : existingState.correctCount,
          wrongCount: isCorrect
            ? existingState.wrongCount
            : existingState.wrongCount + 1,
          lastAnsweredAt: new Date(),
        },
      });
    } else {
      await prisma.userQuestionState.create({
        data: {
          questionId,
          status: "learning",
          correctCount: isCorrect ? 1 : 0,
          wrongCount: isCorrect ? 0 : 1,
          lastAnsweredAt: new Date(),
        },
      });
    }

    return NextResponse.json({
      isCorrect,
      correctChoice: question.correctChoice,
      explanation: question.explanation,
    });
  } catch (error) {
    console.error("Failed to process answer:", error);
    return NextResponse.json(
      { error: "Failed to process answer" },
      { status: 500 }
    );
  }
}
