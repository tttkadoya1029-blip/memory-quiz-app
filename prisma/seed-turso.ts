import { PrismaClient } from "@prisma/client";
import { PrismaLibSQL } from "@prisma/adapter-libsql";
import { createClient } from "@libsql/client";

const libsql = createClient({
  url: process.env.TURSO_DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN!,
});
const adapter = new PrismaLibSQL(libsql);
const prisma = new PrismaClient({ adapter });

const questions = [
  {
    prompt: "AES暗号化で使用される標準的な鍵長はどれか？",
    choiceA: "64ビット",
    choiceB: "128ビット",
    choiceC: "256ビット",
    choiceD: "512ビット",
    correctChoice: "B",
    explanation:
      "AESは128ビット、192ビット、256ビットの鍵長をサポートしますが、標準的には128ビットが最も広く使用されています。",
  },
  {
    prompt: "RSA暗号は何に基づいた暗号化方式か？",
    choiceA: "離散対数問題",
    choiceB: "素因数分解の困難性",
    choiceC: "楕円曲線",
    choiceD: "ハッシュ関数",
    correctChoice: "B",
    explanation:
      "RSAは大きな数の素因数分解が計算的に困難であることを安全性の根拠としています。",
  },
  {
    prompt: "SHA-256のハッシュ出力長は何ビットか？",
    choiceA: "128ビット",
    choiceB: "160ビット",
    choiceC: "256ビット",
    choiceD: "512ビット",
    correctChoice: "C",
    explanation:
      "SHA-256は256ビット（32バイト）のハッシュ値を出力します。名前の256はこの出力長を表しています。",
  },
  {
    prompt: "公開鍵暗号方式の特徴として正しいものはどれか？",
    choiceA: "暗号化と復号に同じ鍵を使用する",
    choiceB: "暗号化と復号に異なる鍵を使用する",
    choiceC: "鍵を使用しない",
    choiceD: "ハッシュ値のみを使用する",
    correctChoice: "B",
    explanation:
      "公開鍵暗号方式では、公開鍵で暗号化し、秘密鍵で復号します。これにより鍵配送問題を解決できます。",
  },
  {
    prompt: "TLS/SSLで使用されるハンドシェイクの主な目的は何か？",
    choiceA: "データの圧縮",
    choiceB: "セッション鍵の交換と認証",
    choiceC: "ファイルの転送",
    choiceD: "IPアドレスの割り当て",
    correctChoice: "B",
    explanation:
      "TLSハンドシェイクでは、サーバー認証、暗号スイートの選択、セッション鍵の生成・交換が行われます。",
  },
  {
    prompt: "ブロック暗号のCBCモードで必要なものは何か？",
    choiceA: "カウンター",
    choiceB: "初期化ベクトル（IV）",
    choiceC: "タイムスタンプ",
    choiceD: "チェックサム",
    correctChoice: "B",
    explanation:
      "CBCモードでは、最初のブロックの暗号化にIVが必要です。IVは各暗号化で異なる値を使用する必要があります。",
  },
  {
    prompt: "デジタル署名の主な目的はどれか？",
    choiceA: "データの暗号化",
    choiceB: "データの圧縮",
    choiceC: "送信者の認証と改ざん検知",
    choiceD: "通信速度の向上",
    correctChoice: "C",
    explanation:
      "デジタル署名は、メッセージの送信者を認証し、メッセージが改ざんされていないことを検証するために使用されます。",
  },
  {
    prompt: "楕円曲線暗号（ECC）の利点として正しいものはどれか？",
    choiceA: "実装が非常に簡単",
    choiceB: "RSAより短い鍵長で同等のセキュリティを提供",
    choiceC: "量子コンピュータに対して安全",
    choiceD: "ハッシュ関数が不要",
    correctChoice: "B",
    explanation:
      "ECCは同等のセキュリティレベルに対してRSAよりも短い鍵長で済むため、計算効率が良いです。",
  },
  {
    prompt: "ゼロ知識証明とは何か？",
    choiceA: "パスワードを暗号化する方式",
    choiceB: "秘密を明かさずに知識の保有を証明する方式",
    choiceC: "データを完全に削除する方式",
    choiceD: "匿名通信を行う方式",
    correctChoice: "B",
    explanation:
      "ゼロ知識証明では、証明者は検証者に対して、秘密の情報を一切明かすことなく、その情報を知っていることを証明できます。",
  },
  {
    prompt: "HMAC（Hash-based Message Authentication Code）の用途は何か？",
    choiceA: "データの暗号化",
    choiceB: "メッセージの完全性と認証の検証",
    choiceC: "鍵の生成",
    choiceD: "乱数の生成",
    correctChoice: "B",
    explanation:
      "HMACは秘密鍵とハッシュ関数を組み合わせて、メッセージの完全性と送信者の認証を検証するために使用されます。",
  },
];

async function main() {
  console.log("Seeding Turso database...");

  for (const q of questions) {
    await prisma.question.create({
      data: q,
    });
  }

  console.log(`Seeded ${questions.length} questions.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
