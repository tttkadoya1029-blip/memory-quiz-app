// ===== Daily Mission Logic =====

export type MissionType = "win_streak" | "correct_answers" | "combo";

export interface MissionDefinition {
  type: MissionType;
  targetValue: number;
  rewardCoins: number;
  rewardBadge?: string;
  description: string;
  icon: string;
}

// デイリーミッション定義（毎日3つ）
export const DAILY_MISSIONS: MissionDefinition[] = [
  {
    type: "win_streak",
    targetValue: 3,
    rewardCoins: 100,
    rewardBadge: "streak_master",
    description: "3連勝する",
    icon: "🏆",
  },
  {
    type: "correct_answers",
    targetValue: 20,
    rewardCoins: 80,
    description: "20問正解する",
    icon: "✅",
  },
  {
    type: "combo",
    targetValue: 10,
    rewardCoins: 120,
    rewardBadge: "combo_king",
    description: "10コンボを達成する",
    icon: "🔥",
  },
];

export interface MissionProgressData {
  missionId: string;
  type: MissionType;
  targetValue: number;
  currentValue: number;
  rewardCoins: number;
  rewardBadge?: string;
  description: string;
  icon: string;
  isCompleted: boolean;
  isClaimed: boolean;
}

export function getDateString(): string {
  const now = new Date();
  return now.toISOString().split("T")[0]; // "YYYY-MM-DD"
}

export function calculateMissionProgress(
  type: MissionType,
  battleResult: {
    isVictory: boolean;
    correctCount: number;
    maxCombo: number;
  },
  currentProgress: number
): number {
  switch (type) {
    case "win_streak":
      return battleResult.isVictory ? currentProgress + 1 : 0; // 負けたらリセット
    case "correct_answers":
      return currentProgress + battleResult.correctCount;
    case "combo":
      return Math.max(currentProgress, battleResult.maxCombo); // 最大コンボを保持
    default:
      return currentProgress;
  }
}
