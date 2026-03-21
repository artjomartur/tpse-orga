import { prisma } from "@/lib/prisma";

export async function getStudentTeamMembership(userId: string) {
  return prisma.teamMember.findFirst({
    where: { userId },
    include: { team: true },
  });
}
