export const dynamic = "force-dynamic";

import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { HallSubmitForm } from "@/components/hall/HallSubmitForm";
import { Crown } from "lucide-react";

export default async function HallSubmitPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/auth/signin?callbackUrl=/hall-of-legends/submit");

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-12">
      <div className="text-center mb-10">
        <Crown className="w-12 h-12 text-brass-500 mx-auto mb-4" />
        <h1 className="font-display text-4xl font-black text-bone-100 mb-3">
          Seek Immortality
        </h1>
        <p className="text-bone-400">
          Submit your finest painted army for consideration. Every submission is reviewed by
          the Game Master. Acceptance is not guaranteed — quality is the only currency here.
        </p>
      </div>
      <HallSubmitForm />
    </div>
  );
}
