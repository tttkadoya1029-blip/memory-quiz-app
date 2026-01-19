# 暗記クイズアプリ 設定書・仕様書

## 概要

忘却曲線（エビングハウス）に基づいた間隔反復学習システムを採用した4択クイズWebアプリケーション。
ユーザーの「フィーリング評価」に応じて復習タイミングを最適化し、効率的な暗記学習を支援する。

---

## 1. システム構成

### 1.1 技術スタック

| カテゴリ | 技術 | バージョン |
|---------|------|-----------|
| フレームワーク | Next.js (App Router) | 16.x |
| 言語 | TypeScript | 5.x |
| スタイリング | Tailwind CSS | 4.x |
| ORM | Prisma | 5.22.0 |
| データベース（開発） | SQLite | - |
| データベース（本番） | Turso (libSQL) | - |
| ホスティング | Vercel | - |

### 1.2 ディレクトリ構成

```
memory-quiz-app/
├── prisma/
│   ├── schema.prisma          # データベーススキーマ定義
│   ├── migrations/            # マイグレーションファイル
│   ├── seed.ts                # ローカル用シードスクリプト
│   ├── seed-turso.ts          # Turso用シードスクリプト
│   └── dev.db                 # ローカルSQLiteデータベース
├── src/
│   ├── app/
│   │   ├── page.tsx           # ホームページ (/)
│   │   ├── layout.tsx         # ルートレイアウト
│   │   ├── globals.css        # グローバルスタイル
│   │   ├── quiz/
│   │   │   └── page.tsx       # クイズページ (/quiz)
│   │   ├── result/
│   │   │   └── page.tsx       # 結果ページ (/result)
│   │   └── api/
│   │       └── quiz/
│   │           ├── next/route.ts    # 次の問題取得API
│   │           ├── answer/route.ts  # 解答送信API
│   │           └── stats/route.ts   # 統計情報API
│   └── lib/
│       ├── prisma.ts          # Prismaクライアント
│       └── scheduler.ts       # スケジューリングロジック
├── docs/
│   └── SPECIFICATION.md       # 本仕様書
├── package.json
└── .env                       # 環境変数
```

---

## 2. データベース設計

### 2.1 ER図

```
┌─────────────────┐       ┌─────────────────────┐       ┌─────────────────┐
│    Question     │       │  UserQuestionState  │       │    AnswerLog    │
├─────────────────┤       ├─────────────────────┤       ├─────────────────┤
│ id (PK)         │───┬───│ questionId (FK,UQ)  │       │ id (PK)         │
│ prompt          │   │   │ id (PK)             │       │ questionId (FK) │
│ choiceA         │   │   │ status              │       │ answeredAt      │
│ choiceB         │   │   │ step                │       │ selectedChoice  │
│ choiceC         │   │   │ lastAnsweredAt      │       │ isCorrect       │
│ choiceD         │   │   │ nextDueAt           │       │ feeling         │
│ correctChoice   │   │   │ correctCount        │       │ scheduledInterval│
│ explanation     │   │   │ wrongCount          │       │ Minutes         │
│ createdAt       │   │   │ streak              │       └─────────────────┘
└─────────────────┘   │   │ lastFeeling         │               │
                      │   │ createdAt           │               │
                      │   │ updatedAt           │               │
                      │   └─────────────────────┘               │
                      │                                         │
                      └─────────────────────────────────────────┘
```

### 2.2 テーブル定義

#### Question（問題）

| カラム名 | 型 | 制約 | 説明 |
|---------|-----|------|------|
| id | String | PK, CUID | 問題ID |
| prompt | String | NOT NULL | 問題文 |
| choiceA | String | NOT NULL | 選択肢A |
| choiceB | String | NOT NULL | 選択肢B |
| choiceC | String | NOT NULL | 選択肢C |
| choiceD | String | NOT NULL | 選択肢D |
| correctChoice | String | NOT NULL | 正解 ("A"/"B"/"C"/"D") |
| explanation | String | NULL | 解説（任意） |
| createdAt | DateTime | DEFAULT now() | 作成日時 |

#### UserQuestionState（ユーザー学習状態）

| カラム名 | 型 | 制約 | 説明 |
|---------|-----|------|------|
| id | String | PK, CUID | 状態ID |
| questionId | String | FK, UNIQUE | 問題ID |
| status | String | DEFAULT "new" | 状態 ("new"/"learning"/"review") |
| step | Int | DEFAULT 0 | 学習ステップ (0-5) |
| lastAnsweredAt | DateTime | NULL | 最終解答日時 |
| nextDueAt | DateTime | NULL | 次回復習予定日時 |
| correctCount | Int | DEFAULT 0 | 正解数 |
| wrongCount | Int | DEFAULT 0 | 不正解数 |
| streak | Int | DEFAULT 0 | 連続正解数 |
| lastFeeling | String | NULL | 最後のフィーリング |
| createdAt | DateTime | DEFAULT now() | 作成日時 |
| updatedAt | DateTime | AUTO | 更新日時 |

#### AnswerLog（解答ログ）

| カラム名 | 型 | 制約 | 説明 |
|---------|-----|------|------|
| id | String | PK, CUID | ログID |
| questionId | String | FK | 問題ID |
| answeredAt | DateTime | DEFAULT now() | 解答日時 |
| selectedChoice | String | NOT NULL | 選択した回答 |
| isCorrect | Boolean | NOT NULL | 正解かどうか |
| feeling | String | NOT NULL | フィーリング評価 |
| scheduledIntervalMinutes | Int | NOT NULL | 次回までの間隔（分） |

---

## 3. 忘却曲線スケジューリング仕様

### 3.1 基本概念

エビングハウスの忘却曲線を参考に、学習したことを忘れる前に復習することで記憶を定着させる。

### 3.2 間隔テーブル

| Step | 間隔 | 説明 |
|------|------|------|
| 0 | 10分 | 初回学習直後 |
| 1 | 1日 | 翌日復習 |
| 2 | 3日 | 3日後復習 |
| 3 | 7日 | 1週間後復習 |
| 4 | 14日 | 2週間後復習 |
| 5 | 30日 | 1ヶ月後復習（最大） |

### 3.3 フィーリング評価と更新ルール

| フィーリング | Step更新 | 次回復習日 |
|-------------|----------|-----------|
| 難しかった (hard) | step - 1（最小0） | 10分後（固定） |
| 普通 (normal) | step維持 | 現stepの間隔 |
| 簡単 (easy) | step + 1（最大5） | 新stepの間隔 |

### 3.4 正誤カウント更新

- **正解時**: correctCount++, streak++
- **不正解時**: wrongCount++, streak = 0

---

## 4. API仕様

### 4.1 GET /api/quiz/stats

学習統計情報を取得する。

**レスポンス**
```json
{
  "dueCount": 5,      // 復習待ち問題数
  "newCount": 3,      // 未学習問題数
  "totalQuestions": 10 // 全問題数
}
```

### 4.2 GET /api/quiz/next

次の問題を取得する。

**クエリパラメータ**
| パラメータ | 型 | 必須 | 説明 |
|-----------|-----|------|------|
| exclude | String | No | 除外する問題ID |

**出題優先順位**
1. due: nextDueAt <= 現在時刻 の問題からランダム
2. new: UserQuestionStateが存在しない問題からランダム
3. review: 全問題からランダム

**レスポンス**
```json
{
  "question": {
    "id": "cmkj70rhs0001...",
    "prompt": "AES暗号化で使用される標準的な鍵長はどれか？",
    "choiceA": "64ビット",
    "choiceB": "128ビット",
    "choiceC": "256ビット",
    "choiceD": "512ビット"
  },
  "type": "due" // "due" | "new" | "review"
}
```

### 4.3 POST /api/quiz/answer

解答を送信し、学習状態を更新する。

**リクエストボディ**
```json
{
  "questionId": "cmkj70rhs0001...",
  "selectedChoice": "B",
  "feeling": "easy"  // "hard" | "normal" | "easy"
}
```

**レスポンス**
```json
{
  "isCorrect": true,
  "correctChoice": "B",
  "explanation": "AESは128ビット、192ビット、256ビットの鍵長をサポートします...",
  "nextDueAt": "2026-01-19T10:30:00.000Z"
}
```

---

## 5. 画面仕様

### 5.1 ホーム画面 (/)

**機能**
- 学習状況の表示（復習待ち数、未学習数、全問題数）
- 「学習開始」ボタン → /quiz へ遷移

**表示項目**
| 項目 | 説明 |
|------|------|
| 復習待ち | nextDueAt <= 現在時刻 の問題数 |
| 未学習 | まだ一度も学習していない問題数 |
| 全問題数 | 登録されている問題の総数 |

### 5.2 クイズ画面 (/quiz)

**フロー**
1. 問題文と4つの選択肢を表示
2. ユーザーが選択肢をクリック
3. フィーリング評価ボタンを表示（難しかった/普通/簡単）
4. フィーリングをクリック → 正解/不正解・解説を表示
5. 「次の問題へ」または「終了する」

**表示項目**
- 問題タイプ（復習/新規）
- セッション中の正解数/解答数
- 問題文
- 選択肢ボタン（A/B/C/D）
- フィーリング評価ボタン
- 正解/不正解表示
- 解説（あれば）

### 5.3 結果画面 (/result)

**表示項目**
| 項目 | 説明 |
|------|------|
| 正答率 | (正解数 / 解答数) × 100 % |
| 解答数 | セッション中に解答した問題数 |
| 正解数 | 正解した問題数 |

**アクション**
- 「もう一度学習」→ /quiz
- 「ホームへ戻る」→ /

---

## 6. 環境設定

### 6.1 環境変数

| 変数名 | 用途 | 例 |
|--------|------|-----|
| DATABASE_URL | ローカルSQLite | file:./dev.db |
| TURSO_DATABASE_URL | Turso接続URL | libsql://xxx.turso.io |
| TURSO_AUTH_TOKEN | Turso認証トークン | eyJhbGciOi... |

### 6.2 開発環境 vs 本番環境

| 項目 | 開発環境 | 本番環境 |
|------|---------|---------|
| データベース | SQLite (ローカルファイル) | Turso (クラウド) |
| 接続方式 | DATABASE_URL | TURSO_DATABASE_URL + TURSO_AUTH_TOKEN |
| ホスト | localhost:3000 | Vercel |

---

## 7. セットアップ手順

### 7.1 ローカル開発

```bash
# 1. リポジトリクローン
git clone https://github.com/tttkadoya1029-blip/memory-quiz-app.git
cd memory-quiz-app

# 2. 依存関係インストール
npm install

# 3. 環境変数設定
cp .env.example .env
# DATABASE_URL="file:./dev.db" を設定

# 4. データベースセットアップ
npx prisma migrate dev

# 5. シードデータ投入
npx prisma db seed

# 6. 開発サーバー起動
npm run dev
```

### 7.2 本番デプロイ（Vercel + Turso）

```bash
# 1. Tursoデータベース作成
turso db create memory-quiz-db

# 2. スキーマ適用
turso db shell memory-quiz-db < prisma/migrations/xxx/migration.sql

# 3. シードデータ投入
npx ts-node prisma/seed-turso.ts

# 4. Vercel環境変数設定
vercel env add TURSO_DATABASE_URL production
vercel env add TURSO_AUTH_TOKEN production

# 5. デプロイ
vercel --prod
```

---

## 8. 公開URL

**本番環境**: https://memory-quiz-app.vercel.app

---

## 9. 今後の拡張案

| 機能 | 説明 | 優先度 |
|------|------|--------|
| ユーザー認証 | 個人ごとの学習データ管理 | 高 |
| 問題管理画面 | Web UIからの問題追加・編集 | 中 |
| カテゴリ分類 | 問題をカテゴリ別に整理 | 中 |
| 学習履歴グラフ | 日別の学習量・正答率の可視化 | 低 |
| エクスポート機能 | 問題データのCSV出力 | 低 |

---

## 10. 変更履歴

| 日付 | バージョン | 変更内容 |
|------|-----------|---------|
| 2026-01-18 | 1.0.0 | 初版作成 |
