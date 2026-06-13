import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { WtbForm } from "@/components/wtb/WtbForm";

export default async function WtbNewPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/auth/signin?callbackUrl=/wtb/new");

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <p className="text-blood-500 text-sm font-semibold uppercase tracking-widest mb-1">Hunters Board</p>
        <h1 className="font-display text-3xl font-black text-bone-100">Post What You Want</h1>
        <p className="text-bone-500 text-sm mt-1">Sellers will see your post and reach out with matching inventory.</p>
      </div>
      <WtbForm />
    </div>
  );
}
