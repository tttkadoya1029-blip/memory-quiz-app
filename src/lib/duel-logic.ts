// ===== Duel Game Logic =====

export const GAME_CONFIG = {
  QUESTIONS_PER_BATTLE: 10,
  PLAYER_MAX_HP: 100,
  ENEMY_MAX_HP: 100,
  BASE_DAMAGE: 10,
  COMBO_MULTIPLIER: 0.2, // Each combo adds 20% damage
  PLAYER_DAMAGE_ON_WRONG: 15,
  CONSECUTIVE_WRONG_MULTIPLIER: 0.3, // Each consecutive wrong adds 30%
  EXP_PER_CORRECT: 10,
  EXP_BONUS_PER_COMBO: 2,
  COINS_PER_CORRECT: 5,
  COINS_BONUS_WIN: 50,
};

export type Rank = "S" | "A" | "B" | "C" | "F";

export interface DuelState {
  playerHp: number;
  enemyHp: number;
  currentQuestion: number;
  totalQuestions: number;
  combo: number;
  maxCombo: number;
  correctCount: number;
  wrongCount: number;
  consecutiveWrong: number;
  isGameOver: boolean;
  isVictory: boolean;
}

export function createInitialDuelState(
  totalQuestions: number = GAME_CONFIG.QUESTIONS_PER_BATTLE
): DuelState {
  return {
    playerHp: GAME_CONFIG.PLAYER_MAX_HP,
    enemyHp: GAME_CONFIG.ENEMY_MAX_HP,
    currentQuestion: 0,
    totalQuestions,
    combo: 0,
    maxCombo: 0,
    correctCount: 0,
    wrongCount: 0,
    consecutiveWrong: 0,
    isGameOver: false,
    isVictory: false,
  };
}

export function calculateDamage(combo: number): number {
  const multiplier = 1 + combo * GAME_CONFIG.COMBO_MULTIPLIER;
  return Math.round(GAME_CONFIG.BASE_DAMAGE * multiplier);
}

export function calculatePlayerDamage(consecutiveWrong: number): number {
  const multiplier = 1 + consecutiveWrong * GAME_CONFIG.CONSECUTIVE_WRONG_MULTIPLIER;
  return Math.round(GAME_CONFIG.PLAYER_DAMAGE_ON_WRONG * multiplier);
}

export function processAnswer(
  state: DuelState,
  isCorrect: boolean
): { newState: DuelState; damage: number; damageToPlayer: boolean } {
  const newState = { ...state };
  let damage = 0;
  let damageToPlayer = false;

  if (isCorrect) {
    // Correct answer
    newState.combo += 1;
    newState.maxCombo = Math.max(newState.maxCombo, newState.combo);
    newState.correctCount += 1;
    newState.consecutiveWrong = 0;

    // Calculate damage to enemy
    damage = calculateDamage(newState.combo);
    newState.enemyHp = Math.max(0, newState.enemyHp - damage);
  } else {
    // Wrong answer
    newState.combo = 0;
    newState.wrongCount += 1;
    newState.consecutiveWrong += 1;
    damageToPlayer = true;

    // Calculate damage to player
    damage = calculatePlayerDamage(newState.consecutiveWrong);
    newState.playerHp = Math.max(0, newState.playerHp - damage);
  }

  newState.currentQuestion += 1;

  // Check game over conditions
  if (newState.playerHp <= 0) {
    newState.isGameOver = true;
    newState.isVictory = false;
  } else if (newState.enemyHp <= 0) {
    newState.isGameOver = true;
    newState.isVictory = true;
  } else if (newState.currentQuestion >= newState.totalQuestions) {
    newState.isGameOver = true;
    newState.isVictory = newState.enemyHp < newState.playerHp;
  }

  return { newState, damage, damageToPlayer };
}

export function calculateRank(state: DuelState): Rank {
  const accuracy = state.correctCount / state.totalQuestions;
  const hasFullCombo = state.maxCombo >= state.totalQuestions;

  if (state.isVictory && accuracy >= 1.0) {
    return "S"; // Perfect
  } else if (state.isVictory && accuracy >= 0.8) {
    return hasFullCombo ? "S" : "A";
  } else if (state.isVictory && accuracy >= 0.6) {
    return "B";
  } else if (state.isVictory) {
    return "C";
  } else {
    return "F";
  }
}

export function calculateRewards(state: DuelState): {
  exp: number;
  coins: number;
} {
  let exp = state.correctCount * GAME_CONFIG.EXP_PER_CORRECT;
  exp += state.maxCombo * GAME_CONFIG.EXP_BONUS_PER_COMBO;

  let coins = state.correctCount * GAME_CONFIG.COINS_PER_CORRECT;
  if (state.isVictory) {
    coins += GAME_CONFIG.COINS_BONUS_WIN;
  }

  // Rank bonus
  const rank = calculateRank(state);
  const rankMultiplier: Record<Rank, number> = {
    S: 2.0,
    A: 1.5,
    B: 1.2,
    C: 1.0,
    F: 0.5,
  };

  exp = Math.round(exp * rankMultiplier[rank]);
  coins = Math.round(coins * rankMultiplier[rank]);

  return { exp, coins };
}

export function getEnemyName(level: number = 1): string {
  const enemies = [
    "Shadow Goblin",
    "Dark Knight",
    "Void Specter",
    "Chaos Dragon",
    "Nightmare Lord",
  ];
  const index = Math.min(Math.floor(level / 5), enemies.length - 1);
  return enemies[index];
}

export function getLevelFromExp(exp: number): number {
  // Simple level formula: each level needs level * 100 exp
  let level = 1;
  let expNeeded = 100;
  let totalExp = 0;

  while (totalExp + expNeeded <= exp) {
    totalExp += expNeeded;
    level += 1;
    expNeeded = level * 100;
  }

  return level;
}

export function getExpForNextLevel(currentExp: number): {
  currentLevel: number;
  expInLevel: number;
  expNeeded: number;
} {
  let level = 1;
  let expNeeded = 100;
  let totalExp = 0;

  while (totalExp + expNeeded <= currentExp) {
    totalExp += expNeeded;
    level += 1;
    expNeeded = level * 100;
  }

  return {
    currentLevel: level,
    expInLevel: currentExp - totalExp,
    expNeeded: expNeeded,
  };
}
