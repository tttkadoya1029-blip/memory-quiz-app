import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// PC/IT関連の画像クイズ問題
const imageQuestions = [
  // プログラミング言語ロゴ
  {
    prompt: "このプログラミング言語は何？",
    imageUrl: "https://images.unsplash.com/photo-1627398242454-45a1465c2479?w=400",
    choiceA: "Python",
    choiceB: "JavaScript",
    choiceC: "Java",
    choiceD: "C++",
    correctChoice: "B",
    explanation: "JavaScriptはWeb開発で最も使われるプログラミング言語です。",
    rarity: "common",
  },
  {
    prompt: "このコードエディタは何？",
    imageUrl: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=400",
    choiceA: "Visual Studio Code",
    choiceB: "Sublime Text",
    choiceC: "Atom",
    choiceD: "Vim",
    correctChoice: "A",
    explanation: "VS Codeは最も人気のあるコードエディタの一つです。",
    rarity: "common",
  },
  {
    prompt: "この画面は何の作業？",
    imageUrl: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=400",
    choiceA: "データベース設計",
    choiceB: "コーディング",
    choiceC: "ネットワーク設定",
    choiceD: "グラフィックデザイン",
    correctChoice: "B",
    explanation: "プログラミング/コーディングの作業画面です。",
    rarity: "common",
  },
  {
    prompt: "このハードウェアは何？",
    imageUrl: "https://images.unsplash.com/photo-1591488320449-011701bb6704?w=400",
    choiceA: "HDD",
    choiceB: "SSD",
    choiceC: "CPU",
    choiceD: "GPU",
    correctChoice: "C",
    explanation: "CPUはコンピュータの頭脳と呼ばれる中央処理装置です。",
    rarity: "rare",
  },
  {
    prompt: "このパーツは何？",
    imageUrl: "https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=400",
    choiceA: "マザーボード",
    choiceB: "グラフィックカード",
    choiceC: "電源ユニット",
    choiceD: "メモリ",
    correctChoice: "B",
    explanation: "グラフィックカード(GPU)は映像処理を担当するパーツです。",
    rarity: "rare",
  },
  {
    prompt: "このデバイスは何？",
    imageUrl: "https://images.unsplash.com/photo-1563206767-5b18f218e8de?w=400",
    choiceA: "ルーター",
    choiceB: "スイッチ",
    choiceC: "サーバー",
    choiceD: "NAS",
    correctChoice: "C",
    explanation: "サーバーはネットワーク上でサービスを提供するコンピュータです。",
    rarity: "epic",
  },
  {
    prompt: "この記憶装置は何？",
    imageUrl: "https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=400",
    choiceA: "USBメモリ",
    choiceB: "SDカード",
    choiceC: "HDD",
    choiceD: "SSD",
    correctChoice: "D",
    explanation: "SSDは高速で静音な記憶装置です。",
    rarity: "common",
  },
  {
    prompt: "このケーブルは何？",
    imageUrl: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400",
    choiceA: "HDMI",
    choiceB: "USB-C",
    choiceC: "イーサネット",
    choiceD: "DisplayPort",
    correctChoice: "C",
    explanation: "イーサネットケーブルはLAN接続に使用されます。",
    rarity: "common",
  },
  {
    prompt: "このOSは何？",
    imageUrl: "https://images.unsplash.com/photo-1629654297299-c8506221ca97?w=400",
    choiceA: "Windows",
    choiceB: "macOS",
    choiceC: "Linux",
    choiceD: "Chrome OS",
    correctChoice: "C",
    explanation: "Linuxはオープンソースのオペレーティングシステムです。",
    rarity: "rare",
  },
  {
    prompt: "このデバイスの名前は？",
    imageUrl: "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=400",
    choiceA: "Raspberry Pi",
    choiceB: "Arduino",
    choiceC: "ESP32",
    choiceD: "BeagleBone",
    correctChoice: "A",
    explanation: "Raspberry Piは教育用の小型コンピュータです。",
    rarity: "epic",
  },
  {
    prompt: "このソフトウェアは何に使う？",
    imageUrl: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400",
    choiceA: "画像編集",
    choiceB: "動画編集",
    choiceC: "データ分析",
    choiceD: "プログラミング",
    correctChoice: "C",
    explanation: "ダッシュボードはデータを可視化・分析するツールです。",
    rarity: "common",
  },
  {
    prompt: "このアーキテクチャは何？",
    imageUrl: "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=400",
    choiceA: "モノリシック",
    choiceB: "マイクロサービス",
    choiceC: "サーバーレス",
    choiceD: "コンテナ",
    correctChoice: "D",
    explanation: "コンテナはアプリケーションを隔離して実行する技術です。",
    rarity: "epic",
  },
  {
    prompt: "この開発手法は何？",
    imageUrl: "https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=400",
    choiceA: "ウォーターフォール",
    choiceB: "アジャイル",
    choiceC: "スクラム",
    choiceD: "カンバン",
    correctChoice: "D",
    explanation: "カンバンボードはタスク管理に使用される視覚的ツールです。",
    rarity: "rare",
  },
  {
    prompt: "このサービスは何？",
    imageUrl: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=400",
    choiceA: "オンプレミス",
    choiceB: "クラウド",
    choiceC: "ハイブリッド",
    choiceD: "エッジ",
    correctChoice: "B",
    explanation: "クラウドコンピューティングはインターネット経由でリソースを提供します。",
    rarity: "legendary",
  },
  {
    prompt: "このネットワーク構成は何？",
    imageUrl: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=400",
    choiceA: "LAN",
    choiceB: "WAN",
    choiceC: "VPN",
    choiceD: "データセンター",
    correctChoice: "D",
    explanation: "データセンターは大規模なサーバー設備を収容する施設です。",
    rarity: "legendary",
  },
];

export async function POST() {
  try {
    let addedCount = 0;

    for (const q of imageQuestions) {
      // 同じpromptとimageUrlの組み合わせがなければ追加
      const existing = await prisma.question.findFirst({
        where: {
          prompt: q.prompt,
          imageUrl: q.imageUrl,
        },
      });

      if (!existing) {
        await prisma.question.create({
          data: q,
        });
        addedCount++;
      }
    }

    return NextResponse.json({
      success: true,
      message: `Added ${addedCount} new PC/IT image questions`,
      total: imageQuestions.length,
    });
  } catch (error) {
    console.error("Failed to seed images:", error);
    return NextResponse.json(
      { error: "Failed to seed images" },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: "Use POST to seed image questions",
  });
}
