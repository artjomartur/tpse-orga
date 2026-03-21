import { getServerSession } from "next-auth/next";

import HomePublic from "@/components/HomePublic";
import StaffHome from "@/components/StaffHome";
import StudentOverview from "@/components/student/StudentOverview";
import { authOptions } from "@/lib/auth";

export default async function HomePage() {
  const session = await getServerSession(authOptions);
  const role = session?.user?.role;

  if (role === "STUDENT") return <StudentOverview />;
  if (role === "HIWI" || role === "ADMIN") return <StaffHome />;
  return <HomePublic />;
}
