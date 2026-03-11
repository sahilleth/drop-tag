import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const Privacy = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <main className="flex-1 pt-20 pb-16">
        <div className="container max-w-3xl mx-auto px-4 space-y-6">
          <h1 className="text-2xl font-semibold tracking-tight">Privacy Policy</h1>
          <p className="text-sm text-muted-foreground">
            DropTag.cloud is a simple file and text sharing tool built on Supabase. This page
            explains what data is stored and how it is used.
          </p>

          <section className="space-y-2">
            <h2 className="text-sm font-semibold">What we store</h2>
            <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
              <li>Files you upload to a room (stored in Supabase Storage).</li>
              <li>Text messages you add to a room.</li>
              <li>Room metadata such as hashtag, expiry time, and optional PIN hash.</li>
              <li>Optional comments and tags that you attach to files or texts.</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="text-sm font-semibold">How long data is kept</h2>
            <p className="text-sm text-muted-foreground">
              Rooms have an expiry time and an automatic cleanup window. After a room expires and
              passes its cleanup window, the room and its associated files, texts, comments and tags
              may be deleted automatically.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-sm font-semibold">Security</h2>
            <p className="text-sm text-muted-foreground">
              Room PINs are stored as bcrypt hashes and are never stored in plain text. Files are
              served via Supabase public URLs. Do not use this service for highly sensitive or
              regulated data.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-sm font-semibold">Third‑party services</h2>
            <p className="text-sm text-muted-foreground">
              Storage, database, and realtime features are provided by Supabase. Your data is
              processed according to Supabase&apos;s own terms and privacy policy.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-sm font-semibold">Contact</h2>
            <p className="text-sm text-muted-foreground">
              If you have questions about privacy on DropTag.cloud, please reach out to the project
              maintainer.
            </p>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Privacy;

