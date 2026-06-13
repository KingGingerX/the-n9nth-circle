import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const { company, imageUrl, linkUrl, placement, startDate, endDate, amount } = await req.json();

    if (!company || !imageUrl || !linkUrl || !placement || !startDate || !endDate) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const ad = await prisma.adSlot.create({
      data: {
        company: company.trim(),
        imageUrl,
        linkUrl,
        placement,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        amount: Number(amount) || 299,
        isActive: true,
      },
    });

    return NextResponse.json(ad, { status: 201 });
  } catch (err) {
    console.error("Create ad error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const ads = await prisma.adSlot.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json(ads);
}
