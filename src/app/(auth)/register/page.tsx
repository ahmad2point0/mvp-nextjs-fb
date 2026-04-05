import { Navbar, Footer } from "@/global/components";
import { RegisterForm } from "@/features/auth";

export default function RegisterPage() {
  return (
    <>
      <Navbar />
      <main className="flex-1 flex items-center justify-center py-16 px-4 bg-surface">
        <RegisterForm />
      </main>
      <Footer />
    </>
  );
}
