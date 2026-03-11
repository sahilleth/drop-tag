import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const Terms = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <main className="flex-1 pt-20 pb-16">
        <div className="container max-w-3xl mx-auto px-4 space-y-6">
          <h1 className="text-2xl font-semibold tracking-tight">Terms of Use</h1>
          <p className="text-sm text-muted-foreground">
            By using DropTag.cloud you agree to the terms on this page. This is a lightweight,
            best‑effort service for sharing files and text via hashtag rooms.
          </p>

          <section className="space-y-2">
            <h2 className="text-sm font-semibold">Acceptable use</h2>
            <p className="text-sm text-muted-foreground">
              You agree not to upload illegal, abusive, or harmful content, and not to use the
              service to violate the rights of others. The project maintainer may remove content or
              restrict access at their discretion.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-sm font-semibold">No guarantees</h2>
            <p className="text-sm text-muted-foreground">
              This service is provided &quot;as is&quot; without warranties of any kind. Files and
              rooms may be cleaned up automatically after expiry or due to maintenance. Do not rely
              on DropTag.cloud as your only copy of important data.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-sm font-semibold">Liability</h2>
            <p className="text-sm text-muted-foreground">
              The project maintainer is not liable for any loss, damage, or legal claims arising
              from use of this service, including but not limited to data loss or unauthorized
              access to shared links.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-sm font-semibold">Changes</h2>
            <p className="text-sm text-muted-foreground">
              These terms may change over time. Continued use of the service after changes are
              published constitutes acceptance of the updated terms.
            </p>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Terms;

