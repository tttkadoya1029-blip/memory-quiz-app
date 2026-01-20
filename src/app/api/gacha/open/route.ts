import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getRandomRarity, GachaCard, Rarity } from "@/lib/gacha";

export async function POST() {
  try {
    // パック数を確認
    let cardPack = await prisma.cardPack.findFirst();

    if (!cardPack) {
      cardPack = await prisma.cardPack.create({
        data: { quantity: 0 },
      });
    }

    if (cardPack.quantity <= 0) {
      return NextResponse.json(
        { error: "No card packs available" },
        { status: 400 }
      );
    }

    // 未学習の問題を優先的に取得
    const unlearnedQuestions = await prisma.question.findMany({
      where: {
        userState: null,
      },
      take: 10,
    });

    // 学習済みの問題も取得（足りない場合用）
    const learnedQuestions = await prisma.question.findMany({
      where: {
        userState: { isNot: null },
      },
      include: {
        userState: true,
      },
      take: 10,
    });

    // 3枚選択（未学習優先）
    const allQuestions = [...unlearnedQuestions, ...learnedQuestions];
    const selectedQuestions: typeof allQuestions = [];
    const usedIds = new Set<string>();

    // ランダムに3枚選択
    while (selectedQuestions.length < 3 && allQuestions.length > 0) {
      const randomIndex = Math.floor(Math.random() * allQuestions.length);
      const question = allQuestions[randomIndex];

      if (!usedIds.has(question.id)) {
        usedIds.add(question.id);
        selectedQuestions.push(question);
      }
      allQuestions.splice(randomIndex, 1);
    }

    if (selectedQuestions.length === 0) {
      return NextResponse.json(
        { error: "No questions available" },
        { status: 400 }
      );
    }

    // レア度を決定して更新
    const cards: GachaCard[] = [];

    for (const question of selectedQuestions) {
      // 新しいレア度を決定（既存のレア度がcommonなら再抽選）
      let newRarity: Rarity = question.rarity as Rarity;
      if (newRarity === "common") {
        newRarity = getRandomRarity();
      }

      // レア度を更新
      await prisma.question.update({
        where: { id: question.id },
        data: { rarity: newRarity },
      });

      // UserQuestionStateがなければ作成（カードを「獲得」扱いに）
      const existingState = await prisma.userQuestionState.findUnique({
        where: { questionId: question.id },
      });

      const isNew = !existingState;

      if (!existingState) {
        await prisma.userQuestionState.create({
          data: {
            questionId: question.id,
            status: "new",
            step: 0,
          },
        });
      }

      // 正解の選択肢テキストを取得
      const choiceKey = `choice${question.correctChoice}` as keyof typeof question;
      const answer = question[choiceKey] as string;

      cards.push({
        id: question.id,
        prompt: question.prompt,
        correctChoice: question.correctChoice,
        answer,
        rarity: newRarity,
        isNew,
      });
    }

    // パック数を減らす
    await prisma.cardPack.update({
      where: { id: cardPack.id },
      data: { quantity: cardPack.quantity - 1 },
    });

    return NextResponse.json({
      success: true,
      cards,
      remainingPacks: cardPack.quantity - 1,
    });
  } catch (error) {
    console.error("Failed to open pack:", error);
    return NextResponse.json(
      { error: "Failed to open pack" },
      { status: 500 }
    );
  }
}
