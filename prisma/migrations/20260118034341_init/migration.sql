-- CreateTable
CREATE TABLE "Question" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "prompt" TEXT NOT NULL,
    "choiceA" TEXT NOT NULL,
    "choiceB" TEXT NOT NULL,
    "choiceC" TEXT NOT NULL,
    "choiceD" TEXT NOT NULL,
    "correctChoice" TEXT NOT NULL,
    "explanation" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "UserQuestionState" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "questionId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'new',
    "step" INTEGER NOT NULL DEFAULT 0,
    "lastAnsweredAt" DATETIME,
    "nextDueAt" DATETIME,
    "correctCount" INTEGER NOT NULL DEFAULT 0,
    "wrongCount" INTEGER NOT NULL DEFAULT 0,
    "streak" INTEGER NOT NULL DEFAULT 0,
    "lastFeeling" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "UserQuestionState_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "AnswerLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "questionId" TEXT NOT NULL,
    "answeredAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "selectedChoice" TEXT NOT NULL,
    "isCorrect" BOOLEAN NOT NULL,
    "feeling" TEXT NOT NULL,
    "scheduledIntervalMinutes" INTEGER NOT NULL,
    CONSTRAINT "AnswerLog_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "UserQuestionState_questionId_key" ON "UserQuestionState"("questionId");
