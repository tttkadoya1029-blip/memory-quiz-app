import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { calculateRank, calculateRewards } from "@/lib/duel-logic";

interface ResultRequest {
  correctCount: number;
  wrongCount: number;
  maxCombo: number;
  playerHp: number;
  enemyHp: number;
  isVictory: boolean;
  totalQuestions: number;
}

export async function POST(request: NextRequest) {
  try {
    const body: ResultRequest = await request.json();
    const {
      correctCount,
      wrongCount,
      maxCombo,
      playerHp,
      enemyHp,
      isVictory,
      totalQuestions,
    } = body;

    // Calculate rank and rewards
    const duelState = {
      playerHp,
      enemyHp,
      currentQuestion: totalQuestions,
      totalQuestions,
      combo: 0,
      maxCombo,
      correctCount,
      wrongCount,
      consecutiveWrong: 0,
      isGameOver: true,
      isVictory,
    };

    const rank = calculateRank(duelState);
    const { exp, coins } = calculateRewards(duelState);

    // Get or create player stats
    let playerStats = await prisma.playerStats.findFirst();

    if (!playerStats) {
      playerStats = await prisma.playerStats.create({
        data: {
          level: 1,
          exp: 0,
          coins: 0,
          totalWins: 0,
          totalGames: 0,
          maxCombo: 0,
        },
      });
    }

    // Update player stats
    const updatedStats = await prisma.playerStats.update({
      where: { id: playerStats.id },
      data: {
        exp: playerStats.exp + exp,
        coins: playerStats.coins + coins,
        totalWins: isVictory ? playerStats.totalWins + 1 : playerStats.totalWins,
        totalGames: playerStats.totalGames + 1,
        maxCombo: Math.max(playerStats.maxCombo, maxCombo),
      },
    });

    // Save battle result
    const battleResult = await prisma.battleResult.create({
      data: {
        playerStatsId: playerStats.id,
        totalQuestions,
        correctCount,
        wrongCount,
        maxCombo,
        rank,
        earnedExp: exp,
        earnedCoins: coins,
        playerHpLeft: playerHp,
        enemyHpLeft: enemyHp,
        isVictory,
      },
    });

    // Award card pack on victory
    let earnedPacks = 0;
    if (isVictory) {
      earnedPacks = 1;
      let cardPack = await prisma.cardPack.findFirst();
      if (!cardPack) {
        cardPack = await prisma.cardPack.create({ data: { quantity: 1 } });
      } else {
        await prisma.cardPack.update({
          where: { id: cardPack.id },
          data: { quantity: cardPack.quantity + 1 },
        });
      }
    }

    // Update mission progress
    await fetch(new URL("/api/missions/update", request.url).toString(), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isVictory, correctCount, maxCombo }),
    }).catch(() => {
      // Ignore mission update errors
    });

    return NextResponse.json({
      rank,
      earnedExp: exp,
      earnedCoins: coins,
      earnedPacks,
      totalExp: updatedStats.exp,
      totalCoins: updatedStats.coins,
      battleResultId: battleResult.id,
    });
  } catch (error) {
    console.error("Failed to save result:", error);
    return NextResponse.json(
      { error: "Failed to save result" },
      { status: 500 }
    );
  }
}
