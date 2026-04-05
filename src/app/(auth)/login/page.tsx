import { Suspense } from "react";
import { Navbar, Footer } from "@/global/components";
import { LoginForm } from "@/features/auth";

export default function LoginPage() {
  return (
    <>
      <Navbar />
      <main className="flex-1 flex items-center justify-center py-16 px-4 bg-surface">
        <Suspense>
          <LoginForm />
        </Suspense>
      </main>
      <Footer />
    </>
  );
}
