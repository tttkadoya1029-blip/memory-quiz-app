-- CreateTable
CREATE TABLE "PlayerStats" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "level" INTEGER NOT NULL DEFAULT 1,
    "exp" INTEGER NOT NULL DEFAULT 0,
    "coins" INTEGER NOT NULL DEFAULT 0,
    "totalWins" INTEGER NOT NULL DEFAULT 0,
    "totalGames" INTEGER NOT NULL DEFAULT 0,
    "maxCombo" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "BattleResult" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "playerStatsId" TEXT,
    "totalQuestions" INTEGER NOT NULL,
    "correctCount" INTEGER NOT NULL,
    "wrongCount" INTEGER NOT NULL,
    "maxCombo" INTEGER NOT NULL,
    "rank" TEXT NOT NULL,
    "earnedExp" INTEGER NOT NULL,
    "earnedCoins" INTEGER NOT NULL,
    "playerHpLeft" INTEGER NOT NULL,
    "enemyHpLeft" INTEGER NOT NULL,
    "isVictory" BOOLEAN NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "BattleResult_playerStatsId_fkey" FOREIGN KEY ("playerStatsId") REFERENCES "PlayerStats" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
