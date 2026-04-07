import { Navbar, Footer } from "@/global/components";
import { DocumentUploadForm } from "@/features/documents";

export default function UploadDocumentsPage() {
  return (
    <>
      <Navbar />
      <main className="flex-1 flex items-center justify-center py-16 px-4 bg-surface">
        <DocumentUploadForm />
      </main>
      <Footer />
    </>
  );
}
