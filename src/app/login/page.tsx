import { Suspense } from "react";
import LoginClient from "./LoginClient";

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="text-sm text-gray-600">Lade...</div>}>
      <LoginClient />
    </Suspense>
  );
}
