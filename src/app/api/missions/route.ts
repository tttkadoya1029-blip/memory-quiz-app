import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { DAILY_MISSIONS, getDateString, MissionProgressData } from "@/lib/missions";

export async function GET() {
  try {
    const today = getDateString();

    // 今日のミッション進捗を取得または作成
    const missions: MissionProgressData[] = [];

    for (const missionDef of DAILY_MISSIONS) {
      // DBからミッション定義を取得または作成
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

      missions.push({
        missionId: mission.id,
        type: missionDef.type as MissionProgressData["type"],
        targetValue: missionDef.targetValue,
        currentValue: progress.currentValue,
        rewardCoins: missionDef.rewardCoins,
        rewardBadge: missionDef.rewardBadge,
        description: missionDef.description,
        icon: missionDef.icon,
        isCompleted: progress.isCompleted,
        isClaimed: progress.isClaimed,
      });
    }

    return NextResponse.json({ missions, date: today });
  } catch (error) {
    console.error("Failed to fetch missions:", error);
    return NextResponse.json(
      { error: "Failed to fetch missions" },
      { status: 500 }
    );
  }
}
