// ===== Skill Card Logic =====

export type SkillType = "hint" | "time_stop";

export interface SkillDefinition {
  type: SkillType;
  name: string;
  description: string;
  icon: string;
  maxUses: number; // 1バトルあたりの使用回数上限
  cooldown: number; // 使用後のクールダウン（問題数）
}

export const SKILLS: Record<SkillType, SkillDefinition> = {
  hint: {
    type: "hint",
    name: "Hint",
    description: "Eliminate 2 wrong answers",
    icon: "💡",
    maxUses: 2,
    cooldown: 0,
  },
  time_stop: {
    type: "time_stop",
    name: "Time Stop",
    description: "+5 seconds to answer",
    icon: "⏰",
    maxUses: 1,
    cooldown: 0,
  },
};

export interface SkillState {
  hint: {
    usesLeft: number;
    isActive: boolean;
    eliminatedChoices: string[]; // 消された選択肢
  };
  timeStop: {
    usesLeft: number;
    isActive: boolean;
    bonusTime: number; // 追加された秒数
  };
}

export function createInitialSkillState(): SkillState {
  return {
    hint: {
      usesLeft: SKILLS.hint.maxUses,
      isActive: false,
      eliminatedChoices: [],
    },
    timeStop: {
      usesLeft: SKILLS.time_stop.maxUses,
      isActive: false,
      bonusTime: 0,
    },
  };
}

export function useHintSkill(
  state: SkillState,
  correctChoice: string,
  allChoices: string[]
): { newState: SkillState; eliminatedChoices: string[] } {
  if (state.hint.usesLeft <= 0 || state.hint.isActive) {
    return { newState: state, eliminatedChoices: [] };
  }

  // 正解以外の選択肢から2つをランダムに選んで消す
  const wrongChoices = allChoices.filter((c) => c !== correctChoice);
  const shuffled = wrongChoices.sort(() => Math.random() - 0.5);
  const eliminated = shuffled.slice(0, 2);

  return {
    newState: {
      ...state,
      hint: {
        usesLeft: state.hint.usesLeft - 1,
        isActive: true,
        eliminatedChoices: eliminated,
      },
    },
    eliminatedChoices: eliminated,
  };
}

export function useTimeStopSkill(state: SkillState): {
  newState: SkillState;
  bonusTime: number;
} {
  if (state.timeStop.usesLeft <= 0 || state.timeStop.isActive) {
    return { newState: state, bonusTime: 0 };
  }

  const bonusTime = 5; // 5秒追加

  return {
    newState: {
      ...state,
      timeStop: {
        usesLeft: state.timeStop.usesLeft - 1,
        isActive: true,
        bonusTime,
      },
    },
    bonusTime,
  };
}

export function resetSkillsForNextQuestion(state: SkillState): SkillState {
  return {
    ...state,
    hint: {
      ...state.hint,
      isActive: false,
      eliminatedChoices: [],
    },
    timeStop: {
      ...state.timeStop,
      isActive: false,
      bonusTime: 0,
    },
  };
}
