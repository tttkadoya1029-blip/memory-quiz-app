// 忘却曲線に基づくスケジューリング
// step -> 間隔（分単位）
const INTERVAL_TABLE: Record<number, number> = {
  0: 10, // 10分
  1: 1 * 24 * 60, // 1日
  2: 3 * 24 * 60, // 3日
  3: 7 * 24 * 60, // 7日
  4: 14 * 24 * 60, // 14日
  5: 30 * 24 * 60, // 30日
};

const MAX_STEP = 5;

export type Feeling = "hard" | "normal" | "easy";

export function calculateNextDueAt(
  currentStep: number,
  feeling: Feeling,
  now: Date = new Date()
): { nextStep: number; nextDueAt: Date; intervalMinutes: number } {
  let nextStep: number;
  let intervalMinutes: number;

  switch (feeling) {
    case "hard":
      // hardの場合: step -1 (最小0)、10分後に復習
      nextStep = Math.max(0, currentStep - 1);
      intervalMinutes = 10;
      break;
    case "normal":
      // normalの場合: stepを維持、対応する間隔を適用
      nextStep = currentStep;
      intervalMinutes = INTERVAL_TABLE[nextStep] ?? INTERVAL_TABLE[MAX_STEP];
      break;
    case "easy":
      // easyの場合: step +1 (最大MAX_STEP)、対応する間隔を適用
      nextStep = Math.min(currentStep + 1, MAX_STEP);
      intervalMinutes = INTERVAL_TABLE[nextStep] ?? INTERVAL_TABLE[MAX_STEP];
      break;
  }

  const nextDueAt = new Date(now.getTime() + intervalMinutes * 60 * 1000);

  return { nextStep, nextDueAt, intervalMinutes };
}
