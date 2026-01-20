import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  getDateString,
  getWeekStartDate,
  parseWeeklyStamps,
  stringifyWeeklyStamps,
  getDayOfWeek,
  DAILY_REWARDS,
  LoginStreakData,
} from "@/lib/login-streak";

export async function GET() {
  try {
    const today = getDateString();
    const weekStart = getWeekStartDate();
    const dayOfWeek = getDayOfWeek();

    // ログインストリークを取得または作成
    let streak = await prisma.loginStreak.findFirst();

    if (!streak) {
      streak = await prisma.loginStreak.create({
        data: {
          currentStreak: 0,
          maxStreak: 0,
          lastLoginDate: null,
          weeklyStamps: "0000000",
          weekStartDate: weekStart,
        },
      });
    }

    // 週が変わったらリセット
    if (streak.weekStartDate !== weekStart) {
      streak = await prisma.loginStreak.update({
        where: { id: streak.id },
        data: {
          weeklyStamps: "0000000",
          weekStartDate: weekStart,
        },
      });
    }

    const weeklyStamps = parseWeeklyStamps(streak.weeklyStamps);
    const isNewDay = streak.lastLoginDate !== today;

    // 今日の報酬を計算
    let todayReward = null;
    if (isNewDay) {
      const rewardDay = Math.min(streak.currentStreak + 1, 7);
      todayReward = DAILY_REWARDS[rewardDay - 1];
    }

    const data: LoginStreakData = {
      currentStreak: streak.currentStreak,
      maxStreak: streak.maxStreak,
      weeklyStamps,
      todayReward,
      isNewDay,
    };

    return NextResponse.json(data);
  } catch (error) {
    console.error("Failed to get login streak:", error);
    return NextResponse.json(
      { error: "Failed to get login streak" },
      { status: 500 }
    );
  }
}

// ログインボーナス受け取り
export async function POST() {
  try {
    const today = getDateString();
    const weekStart = getWeekStartDate();
    const dayOfWeek = getDayOfWeek();

    let streak = await prisma.loginStreak.findFirst();

    if (!streak) {
      streak = await prisma.loginStreak.create({
        data: {
          currentStreak: 0,
          maxStreak: 0,
          lastLoginDate: null,
          weeklyStamps: "0000000",
          weekStartDate: weekStart,
        },
      });
    }

    // 既に今日ログイン済み
    if (streak.lastLoginDate === today) {
      return NextResponse.json({
        success: false,
        message: "Already claimed today",
        currentStreak: streak.currentStreak,
      });
    }

    // 連続かどうか確認
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = getDateString(yesterday);

    let newStreak = streak.currentStreak;
    if (streak.lastLoginDate === yesterdayStr) {
      // 連続ログイン
      newStreak = Math.min(newStreak + 1, 7);
    } else if (streak.lastLoginDate === null) {
      // 初回ログイン
      newStreak = 1;
    } else {
      // 連続が途切れた
      newStreak = 1;
    }

    // 週のスタンプを更新
    let weeklyStamps = parseWeeklyStamps(streak.weeklyStamps);
    if (streak.weekStartDate !== weekStart) {
      weeklyStamps = [false, false, false, false, false, false, false];
    }
    weeklyStamps[dayOfWeek] = true;

    // 報酬を計算
    const reward = DAILY_REWARDS[newStreak - 1];

    // プレイヤーステータスを更新
    let playerStats = await prisma.playerStats.findFirst();
    if (!playerStats) {
      playerStats = await prisma.playerStats.create({
        data: { level: 1, exp: 0, coins: 0, totalWins: 0, totalGames: 0, maxCombo: 0 },
      });
    }

    await prisma.playerStats.update({
      where: { id: playerStats.id },
      data: {
        coins: playerStats.coins + reward.coins,
      },
    });

    // 7日目ボーナス：カードパック追加
    if (newStreak === 7) {
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

    // ストリークを更新
    streak = await prisma.loginStreak.update({
      where: { id: streak.id },
      data: {
        currentStreak: newStreak,
        maxStreak: Math.max(streak.maxStreak, newStreak),
        lastLoginDate: today,
        weeklyStamps: stringifyWeeklyStamps(weeklyStamps),
        weekStartDate: weekStart,
      },
    });

    return NextResponse.json({
      success: true,
      currentStreak: newStreak,
      reward,
      weeklyStamps,
    });
  } catch (error) {
    console.error("Failed to claim login bonus:", error);
    return NextResponse.json(
      { error: "Failed to claim login bonus" },
      { status: 500 }
    );
  }
}
