// ===== Login Streak Logic =====

export interface LoginStreakData {
  currentStreak: number;
  maxStreak: number;
  weeklyStamps: boolean[]; // 7日分のスタンプ状態
  todayReward: LoginReward | null;
  isNewDay: boolean;
}

export interface LoginReward {
  day: number;
  coins: number;
  bonus?: string;
}

// 7日間の報酬定義
export const DAILY_REWARDS: LoginReward[] = [
  { day: 1, coins: 10 },
  { day: 2, coins: 20 },
  { day: 3, coins: 30 },
  { day: 4, coins: 50 },
  { day: 5, coins: 75 },
  { day: 6, coins: 100 },
  { day: 7, coins: 200, bonus: "Card Pack x1" },
];

export function getDateString(date: Date = new Date()): string {
  return date.toISOString().split("T")[0];
}

export function getWeekStartDate(date: Date = new Date()): string {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Monday start
  d.setDate(diff);
  return getDateString(d);
}

export function parseWeeklyStamps(stamps: string): boolean[] {
  return stamps.split("").map((s) => s === "1");
}

export function stringifyWeeklyStamps(stamps: boolean[]): string {
  return stamps.map((s) => (s ? "1" : "0")).join("");
}

export function getDayOfWeek(date: Date = new Date()): number {
  const day = date.getDay();
  return day === 0 ? 6 : day - 1; // Monday = 0, Sunday = 6
}
