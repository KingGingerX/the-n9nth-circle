import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { NewListingForm } from "@/components/listings/NewListingForm";

export default async function NewListingPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/auth/signin?callbackUrl=/listings/new");

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <p className="text-blood-500 text-sm font-semibold uppercase tracking-widest mb-1">Enter the Arena</p>
        <h1 className="font-display text-4xl font-black text-bone-100">List Your Army</h1>
        <p className="text-bone-500 text-sm mt-2">
          Platform takes 12% on sale. You keep the rest.
        </p>
      </div>
      <NewListingForm />
    </div>
  );
}
