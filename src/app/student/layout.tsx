import StudentSubNav from "@/components/student/StudentSubNav";

export default function StudentSectionLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="space-y-6">
      <StudentSubNav />
      {children}
    </div>
  );
}
