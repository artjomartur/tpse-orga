import TeamActivityClient from "@/components/student/TeamActivityClient";

export default function StudentTeamPage() {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold text-slate-900">Gruppenwahl</h1>
        <p className="mt-1 text-sm text-slate-600">
          Einzelteam, MiniGruppe oder einem bestehenden Team beitreten. Mit Team siehst du Mitglieder und kannst die
          Zuordnung bei Bedarf ändern.
        </p>
      </div>
      <TeamActivityClient />
    </div>
  );
}
