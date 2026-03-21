import { redirect } from "next/navigation";
import { getCurrentRole } from "@/lib/authz";
import HiwiSubNav from "@/components/hiwi/HiwiSubNav";

export default async function HiwiSectionLayout({ children }: { children: React.ReactNode }) {
  const role = await getCurrentRole();
  if (role !== "HIWI" && role !== "ADMIN") {
    redirect("/");
  }

  return (
    <div className="space-y-6">
      <HiwiSubNav />
      {children}
    </div>
  );
}
