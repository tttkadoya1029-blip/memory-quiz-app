import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getDateString } from "@/lib/missions";

export async function POST(request: NextRequest) {
  try {
    const { missionId } = await request.json();
    const today = getDateString();

    // 進捗を取得
    const progress = await prisma.missionProgress.findUnique({
      where: {
        missionId_date: {
          missionId,
          date: today,
        },
      },
      include: {
        mission: true,
      },
    });

    if (!progress) {
      return NextResponse.json(
        { error: "Mission progress not found" },
        { status: 404 }
      );
    }

    if (!progress.isCompleted) {
      return NextResponse.json(
        { error: "Mission not completed yet" },
        { status: 400 }
      );
    }

    if (progress.isClaimed) {
      return NextResponse.json(
        { error: "Reward already claimed" },
        { status: 400 }
      );
    }

    // 報酬を付与
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

    // コイン付与
    await prisma.playerStats.update({
      where: { id: playerStats.id },
      data: {
        coins: playerStats.coins + progress.mission.rewardCoins,
      },
    });

    // バッジ付与（あれば）
    let earnedBadge = null;
    if (progress.mission.rewardBadge) {
      // バッジを取得または作成
      let badge = await prisma.badge.findFirst({
        where: { id: progress.mission.rewardBadge },
      });

      if (!badge) {
        // バッジ定義
        const badgeDefinitions: Record<string, { name: string; description: string; iconEmoji: string; rarity: string }> = {
          streak_master: {
            name: "Streak Master",
            description: "3連勝を達成",
            iconEmoji: "🏆",
            rarity: "rare",
          },
          combo_king: {
            name: "Combo King",
            description: "10コンボを達成",
            iconEmoji: "🔥",
            rarity: "epic",
          },
        };

        const def = badgeDefinitions[progress.mission.rewardBadge];
        if (def) {
          badge = await prisma.badge.create({
            data: {
              id: progress.mission.rewardBadge,
              ...def,
            },
          });
        }
      }

      if (badge) {
        // 既に持っていないか確認
        const existingEarned = await prisma.earnedBadge.findUnique({
          where: { badgeId: badge.id },
        });

        if (!existingEarned) {
          await prisma.earnedBadge.create({
            data: { badgeId: badge.id },
          });
          earnedBadge = badge;
        }
      }
    }

    // 受取済みにする
    await prisma.missionProgress.update({
      where: { id: progress.id },
      data: { isClaimed: true },
    });

    return NextResponse.json({
      success: true,
      earnedCoins: progress.mission.rewardCoins,
      earnedBadge,
    });
  } catch (error) {
    console.error("Failed to claim mission reward:", error);
    return NextResponse.json(
      { error: "Failed to claim reward" },
      { status: 500 }
    );
  }
}
