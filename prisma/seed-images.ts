import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// 画像クイズ問題（Unsplashのフリー画像を使用）
const imageQuestions = [
  // 動物クイズ
  {
    prompt: "この動物は何？",
    imageUrl: "https://images.unsplash.com/photo-1474511320723-9a56873571b7?w=400",
    choiceA: "ライオン",
    choiceB: "トラ",
    choiceC: "チーター",
    choiceD: "ヒョウ",
    correctChoice: "A",
    explanation: "ライオンはオスの特徴的なたてがみで識別できます。",
    rarity: "common",
  },
  {
    prompt: "この動物は何？",
    imageUrl: "https://images.unsplash.com/photo-1564349683136-77e08dba1ef7?w=400",
    choiceA: "アルパカ",
    choiceB: "ラマ",
    choiceC: "ヒツジ",
    choiceD: "ヤギ",
    correctChoice: "A",
    explanation: "アルパカは南米原産で、ふわふわの毛が特徴です。",
    rarity: "rare",
  },
  {
    prompt: "この鳥は何？",
    imageUrl: "https://images.unsplash.com/photo-1552728089-57bdde30beb3?w=400",
    choiceA: "スズメ",
    choiceB: "フラミンゴ",
    choiceC: "ペリカン",
    choiceD: "白鳥",
    correctChoice: "B",
    explanation: "フラミンゴはピンク色の羽と長い脚が特徴的です。",
    rarity: "common",
  },
  {
    prompt: "この動物は何？",
    imageUrl: "https://images.unsplash.com/photo-1557050543-4d5f4e07ef46?w=400",
    choiceA: "コアラ",
    choiceB: "ナマケモノ",
    choiceC: "レッサーパンダ",
    choiceD: "アライグマ",
    correctChoice: "C",
    explanation: "レッサーパンダは赤褐色の毛と可愛い顔が特徴です。",
    rarity: "epic",
  },
  {
    prompt: "この海の生き物は何？",
    imageUrl: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=400",
    choiceA: "イルカ",
    choiceB: "サメ",
    choiceC: "クジラ",
    choiceD: "マンタ",
    correctChoice: "B",
    explanation: "サメは三角形の背びれが特徴的です。",
    rarity: "common",
  },

  // 食べ物クイズ
  {
    prompt: "この料理はどこの国の料理？",
    imageUrl: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400",
    choiceA: "アメリカ",
    choiceB: "イタリア",
    choiceC: "フランス",
    choiceD: "日本",
    correctChoice: "B",
    explanation: "ピザはイタリア発祥の料理です。",
    rarity: "common",
  },
  {
    prompt: "この料理は何？",
    imageUrl: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=400",
    choiceA: "ラーメン",
    choiceB: "うどん",
    choiceC: "そば",
    choiceD: "パスタ",
    correctChoice: "A",
    explanation: "ラーメンは中華麺を使った日本の人気料理です。",
    rarity: "common",
  },
  {
    prompt: "このフルーツは何？",
    imageUrl: "https://images.unsplash.com/photo-1587132137056-bfbf0166836e?w=400",
    choiceA: "マンゴー",
    choiceB: "パパイヤ",
    choiceC: "ドラゴンフルーツ",
    choiceD: "パッションフルーツ",
    correctChoice: "C",
    explanation: "ドラゴンフルーツはピンクの外皮と白い果肉が特徴です。",
    rarity: "rare",
  },
  {
    prompt: "この料理はどこの国の料理？",
    imageUrl: "https://images.unsplash.com/photo-1455619452474-d2be8b1e70cd?w=400",
    choiceA: "タイ",
    choiceB: "ベトナム",
    choiceC: "中国",
    choiceD: "韓国",
    correctChoice: "A",
    explanation: "パッタイ（タイ風焼きそば）はタイの代表的な料理です。",
    rarity: "rare",
  },

  // 場所・建物クイズ
  {
    prompt: "この建物はどこにある？",
    imageUrl: "https://images.unsplash.com/photo-1499856871958-5b9627545d1a?w=400",
    choiceA: "ロンドン",
    choiceB: "パリ",
    choiceC: "ローマ",
    choiceD: "ベルリン",
    correctChoice: "B",
    explanation: "エッフェル塔はフランス・パリのシンボルです。",
    rarity: "common",
  },
  {
    prompt: "この場所はどこの国？",
    imageUrl: "https://images.unsplash.com/photo-1526129318478-62ed807ebdf9?w=400",
    choiceA: "イギリス",
    choiceB: "アメリカ",
    choiceC: "カナダ",
    choiceD: "オーストラリア",
    correctChoice: "A",
    explanation: "ビッグベンはイギリス・ロンドンにある時計塔です。",
    rarity: "common",
  },
  {
    prompt: "この建物はどこにある？",
    imageUrl: "https://images.unsplash.com/photo-1555400038-63f5ba517a47?w=400",
    choiceA: "中国",
    choiceB: "日本",
    choiceC: "韓国",
    choiceD: "台湾",
    correctChoice: "B",
    explanation: "金閣寺は日本・京都にある有名な寺院です。",
    rarity: "epic",
  },
  {
    prompt: "この建造物は何？",
    imageUrl: "https://images.unsplash.com/photo-1503614472-8c93d56e92ce?w=400",
    choiceA: "エベレスト",
    choiceB: "富士山",
    choiceC: "マッターホルン",
    choiceD: "キリマンジャロ",
    correctChoice: "B",
    explanation: "富士山は日本最高峰の山で、世界遺産にも登録されています。",
    rarity: "legendary",
  },

  // 自然・風景クイズ
  {
    prompt: "この風景はどこの国？",
    imageUrl: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400",
    choiceA: "スイス",
    choiceB: "オーストリア",
    choiceC: "ノルウェー",
    choiceD: "カナダ",
    correctChoice: "A",
    explanation: "アルプス山脈の美しい景色はスイスの代表的な風景です。",
    rarity: "rare",
  },
  {
    prompt: "このビーチはどこの国？",
    imageUrl: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400",
    choiceA: "ハワイ",
    choiceB: "モルディブ",
    choiceC: "タイ",
    choiceD: "フィリピン",
    correctChoice: "B",
    explanation: "モルディブは美しい白砂のビーチと透明な海で有名です。",
    rarity: "epic",
  },

  // 乗り物クイズ
  {
    prompt: "この乗り物は何？",
    imageUrl: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=400",
    choiceA: "電車",
    choiceB: "バス",
    choiceC: "トラム",
    choiceD: "モノレール",
    correctChoice: "B",
    explanation: "ロンドンの赤い二階建てバスは有名な観光名所です。",
    rarity: "common",
  },
  {
    prompt: "この列車はどこの国のもの？",
    imageUrl: "https://images.unsplash.com/photo-1540573133985-87b6da6d54a9?w=400",
    choiceA: "フランス",
    choiceB: "ドイツ",
    choiceC: "日本",
    choiceD: "中国",
    correctChoice: "C",
    explanation: "新幹線は日本の高速鉄道システムです。",
    rarity: "rare",
  },

  // スポーツクイズ
  {
    prompt: "このスポーツは何？",
    imageUrl: "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=400",
    choiceA: "バスケットボール",
    choiceB: "サッカー",
    choiceC: "バレーボール",
    choiceD: "ラグビー",
    correctChoice: "B",
    explanation: "サッカーは世界で最も人気のあるスポーツの一つです。",
    rarity: "common",
  },
  {
    prompt: "このスポーツは何？",
    imageUrl: "https://images.unsplash.com/photo-1461896836934- voices=0?w=400",
    choiceA: "テニス",
    choiceB: "バドミントン",
    choiceC: "卓球",
    choiceD: "スカッシュ",
    correctChoice: "A",
    explanation: "テニスはラケットとボールを使用するスポーツです。",
    rarity: "common",
  },
];

async function main() {
  console.log("Seeding image questions...");

  // 既存の問題を削除（オプション）
  // await prisma.question.deleteMany();

  for (const q of imageQuestions) {
    await prisma.question.create({
      data: q,
    });
  }

  console.log(`Seeded ${imageQuestions.length} image questions.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
