import { prisma } from "./prisma";

export async function createNotification(
  userId: string,
  type: string,
  title: string,
  message: string,
  link?: string
) {
  try {
    await prisma.notification.create({
      data: { userId, type, title, message, link: link ?? null },
    });
  } catch {
    // never break main flow
  }
}
