import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { purchaseId, rating, comment } = await req.json();

    if (!purchaseId || !rating || rating < 1 || rating > 5) {
      return NextResponse.json({ error: "Invalid review data" }, { status: 400 });
    }

    const purchase = await prisma.purchase.findUnique({
      where: { id: purchaseId, buyerId: session.user.id, status: "COMPLETED" },
    });

    if (!purchase) return NextResponse.json({ error: "Purchase not found" }, { status: 404 });

    const existing = await prisma.review.findUnique({ where: { purchaseId } });
    if (existing) return NextResponse.json({ error: "Review already submitted" }, { status: 400 });

    const review = await prisma.review.create({
      data: {
        purchaseId,
        reviewerId: session.user.id,
        revieweeId: purchase.sellerId,
        rating: Number(rating),
        comment: comment?.trim().slice(0, 1000) ?? null,
      },
    });

    // recalculate seller rating
    const allReviews = await prisma.review.findMany({
      where: { revieweeId: purchase.sellerId },
      select: { rating: true },
    });
    const avg = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;

    await prisma.user.update({
      where: { id: purchase.sellerId },
      data: {
        sellerRating: Math.round(avg * 10) / 10,
        reviewCount: allReviews.length,
      },
    });

    return NextResponse.json({ success: true, reviewId: review.id }, { status: 201 });
  } catch (err) {
    console.error("Create review error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
