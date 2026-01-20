import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { DAILY_MISSIONS, getDateString, calculateMissionProgress, MissionType } from "@/lib/missions";

interface UpdateRequest {
  isVictory: boolean;
  correctCount: number;
  maxCombo: number;
}

export async function POST(request: NextRequest) {
  try {
    const body: UpdateRequest = await request.json();
    const today = getDateString();

    const updatedMissions = [];

    for (const missionDef of DAILY_MISSIONS) {
      // ミッション定義を取得
      let mission = await prisma.dailyMission.findFirst({
        where: { type: missionDef.type },
      });

      if (!mission) {
        mission = await prisma.dailyMission.create({
          data: {
            type: missionDef.type,
            targetValue: missionDef.targetValue,
            rewardCoins: missionDef.rewardCoins,
            rewardBadge: missionDef.rewardBadge,
            description: missionDef.description,
          },
        });
      }

      // 今日の進捗を取得または作成
      let progress = await prisma.missionProgress.findUnique({
        where: {
          missionId_date: {
            missionId: mission.id,
            date: today,
          },
        },
      });

      if (!progress) {
        progress = await prisma.missionProgress.create({
          data: {
            missionId: mission.id,
            date: today,
            currentValue: 0,
            isCompleted: false,
            isClaimed: false,
          },
        });
      }

      // 既に完了している場合はスキップ
      if (progress.isCompleted) {
        updatedMissions.push({
          type: missionDef.type,
          currentValue: progress.currentValue,
          targetValue: missionDef.targetValue,
          isCompleted: true,
          isNewlyCompleted: false,
        });
        continue;
      }

      // 進捗を計算
      const newValue = calculateMissionProgress(
        missionDef.type as MissionType,
        body,
        progress.currentValue
      );

      const isCompleted = newValue >= missionDef.targetValue;
      const isNewlyCompleted = isCompleted && !progress.isCompleted;

      // 進捗を更新
      await prisma.missionProgress.update({
        where: { id: progress.id },
        data: {
          currentValue: newValue,
          isCompleted,
        },
      });

      updatedMissions.push({
        type: missionDef.type,
        currentValue: newValue,
        targetValue: missionDef.targetValue,
        isCompleted,
        isNewlyCompleted,
      });
    }

    return NextResponse.json({
      success: true,
      missions: updatedMissions,
    });
  } catch (error) {
    console.error("Failed to update mission progress:", error);
    return NextResponse.json(
      { error: "Failed to update progress" },
      { status: 500 }
    );
  }
}
