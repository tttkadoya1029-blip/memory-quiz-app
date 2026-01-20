import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// パック数取得
export async function GET() {
  try {
    let cardPack = await prisma.cardPack.findFirst();

    if (!cardPack) {
      cardPack = await prisma.cardPack.create({
        data: { quantity: 0 },
      });
    }

    return NextResponse.json({ quantity: cardPack.quantity });
  } catch (error) {
    console.error("Failed to get packs:", error);
    return NextResponse.json(
      { error: "Failed to get packs" },
      { status: 500 }
    );
  }
}

// パック追加（バトル勝利時に呼ばれる）
export async function POST(request: NextRequest) {
  try {
    const { count = 1 } = await request.json();

    let cardPack = await prisma.cardPack.findFirst();

    if (!cardPack) {
      cardPack = await prisma.cardPack.create({
        data: { quantity: count },
      });
    } else {
      cardPack = await prisma.cardPack.update({
        where: { id: cardPack.id },
        data: { quantity: cardPack.quantity + count },
      });
    }

    return NextResponse.json({ quantity: cardPack.quantity });
  } catch (error) {
    console.error("Failed to add packs:", error);
    return NextResponse.json(
      { error: "Failed to add packs" },
      { status: 500 }
    );
  }
}
