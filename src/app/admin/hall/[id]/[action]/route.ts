import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string; action: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.redirect(new URL("/", req.url));
  }

  const submission = await prisma.hallOfLegendsSubmission.findUnique({
    where: { id: params.id },
  });

  if (!submission) {
    return NextResponse.redirect(new URL("/admin", req.url));
  }

  if (params.action === "approve") {
    const isImmortal = submission.tier === "IMMORTAL";
    await Promise.all([
      prisma.hallOfLegendsSubmission.update({
        where: { id: params.id },
        data: { status: "APPROVED", reviewedAt: new Date() },
      }),
      prisma.listing.update({
        where: { id: submission.listingId },
        data: {
          isHallOfLegends: true,
          hallOfLegendsStatus: isImmortal ? "IMMORTAL" : "APPROVED",
        },
      }),
    ]);
  } else if (params.action === "reject") {
    await Promise.all([
      prisma.hallOfLegendsSubmission.update({
        where: { id: params.id },
        data: { status: "REJECTED", reviewedAt: new Date() },
      }),
      prisma.listing.update({
        where: { id: submission.listingId },
        data: { hallOfLegendsStatus: "REJECTED" },
      }),
    ]);
  }

  return NextResponse.redirect(new URL("/admin", req.url));
}
