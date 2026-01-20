// ===== Gacha / Card Pack Logic =====

export type Rarity = "common" | "rare" | "epic" | "legendary";

export interface RarityConfig {
  name: string;
  color: string;
  glowColor: string;
  bgGradient: string;
  probability: number; // 0-100
}

export const RARITY_CONFIG: Record<Rarity, RarityConfig> = {
  common: {
    name: "Common",
    color: "text-gray-400",
    glowColor: "rgba(156, 163, 175, 0.5)",
    bgGradient: "from-gray-600 to-gray-700",
    probability: 60,
  },
  rare: {
    name: "Rare",
    color: "text-blue-400",
    glowColor: "rgba(59, 130, 246, 0.5)",
    bgGradient: "from-blue-600 to-blue-700",
    probability: 25,
  },
  epic: {
    name: "Epic",
    color: "text-purple-400",
    glowColor: "rgba(147, 51, 234, 0.7)",
    bgGradient: "from-purple-600 to-purple-700",
    probability: 12,
  },
  legendary: {
    name: "Legendary",
    color: "text-yellow-400",
    glowColor: "rgba(234, 179, 8, 0.8)",
    bgGradient: "from-yellow-500 to-orange-500",
    probability: 3,
  },
};

export interface GachaCard {
  id: string;
  prompt: string;
  correctChoice: string;
  answer: string;
  rarity: Rarity;
  isNew: boolean;
}

export function getRandomRarity(): Rarity {
  const roll = Math.random() * 100;
  let cumulative = 0;

  for (const [rarity, config] of Object.entries(RARITY_CONFIG) as [Rarity, RarityConfig][]) {
    cumulative += config.probability;
    if (roll < cumulative) {
      return rarity;
    }
  }

  return "common";
}

export function assignRarityToQuestions(questionCount: number): Rarity[] {
  const rarities: Rarity[] = [];

  for (let i = 0; i < questionCount; i++) {
    // より均等に分配しつつランダム性を保持
    const index = i % 10;
    if (index < 6) {
      rarities.push("common");
    } else if (index < 8) {
      rarities.push("rare");
    } else if (index < 9) {
      rarities.push("epic");
    } else {
      rarities.push("legendary");
    }
  }

  // シャッフル
  for (let i = rarities.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [rarities[i], rarities[j]] = [rarities[j], rarities[i]];
  }

  return rarities;
}
