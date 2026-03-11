import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import FeatureCards from "@/components/FeatureCards";
import Footer from "@/components/Footer";
import { Hash, Upload, ArrowRight, Link as LinkIcon } from "lucide-react";

const HowItWorks = () => {
  const steps = [
    { icon: Hash, title: "Pick a hashtag", desc: "Choose any hashtag as your room name — like a channel." },
    { icon: Upload, title: "Upload files", desc: "Drag & drop or click to upload. Instant availability." },
    { icon: LinkIcon, title: "Share the link", desc: "Anyone with the hashtag can access files instantly." },
  ];

  return (
    <section id="how-it-works" className="relative py-24 md:py-32 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 -z-10 dot-pattern opacity-40" />
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_center,transparent_30%,hsl(var(--background))_70%)]" />

      <div className="container max-w-4xl mx-auto px-4">
        <div className="text-center mb-16">
          <p className="text-xs font-semibold uppercase tracking-widest text-primary mb-3">How it works</p>
          <h2 className="text-2xl md:text-4xl font-bold tracking-tight mb-4">
            Three steps. That's it.
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-10 md:gap-8">
          {steps.map((s, i) => (
            <div
              key={s.title}
              className="flex flex-col items-center text-center animate-slide-up"
              style={{ animationDelay: `${i * 0.1}s` }}
            >
              <div className="relative mb-5">
                <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20">
                  <s.icon className="w-6 h-6 text-primary" />
                </div>
                <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-card border border-border flex items-center justify-center text-[10px] font-bold text-foreground">
                  {i + 1}
                </div>
              </div>
              <h3 className="font-semibold text-[15px] mb-2">{s.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed max-w-[220px]">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const CTA = () => (
  <section className="py-24 md:py-32">
    <div className="container max-w-3xl mx-auto px-4 text-center">
      <div className="relative rounded-2xl border border-border bg-card p-10 md:p-16 overflow-hidden">
        {/* Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[300px] h-[200px] bg-primary/10 rounded-full blur-[80px] -z-10" />
        
        <h2 className="text-2xl md:text-3xl font-bold tracking-tight mb-4">
          Ready to share files?
        </h2>
        <p className="text-sm text-muted-foreground mb-8 max-w-sm mx-auto">
          Create a room in seconds. No account needed.
        </p>
        <a href="/r/demo">
          <button className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-sm glow-md hover:glow-lg transition-all hover:scale-[1.02] active:scale-[0.98]">
            Get Started
            <ArrowRight className="w-4 h-4" />
          </button>
        </a>
      </div>
    </div>
  </section>
);

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <HeroSection />
      <FeatureCards />
      <HowItWorks />
      <CTA />
      <Footer />
    </div>
  );
};

export default Index;
