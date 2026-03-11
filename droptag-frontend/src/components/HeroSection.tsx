import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import HashtagInput from "./HashtagInput";

const HeroSection = () => {
  const [hashtag, setHashtag] = useState("");
  const navigate = useNavigate();

  const handleCreate = () => {
    const tag = hashtag.trim() || "hackathon2026";
    navigate(`/room/${tag}`);
  };

  const handleJoin = () => {
    const tag = hashtag.trim();
    if (!tag) {
      return;
    }
    navigate(`/room/${tag}`);
  };

  return (
    <section className="relative pt-28 pb-24 md:pt-40 md:pb-36 overflow-hidden">
      {/* Grid background */}
      <div className="absolute inset-0 -z-10 grid-pattern opacity-50" />
      
      {/* Radial fade over grid */}
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_center,transparent_20%,hsl(var(--background))_70%)]" />
      
      {/* Green glow orb */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] -z-10 rounded-full bg-primary/8 blur-[100px]" />

      <div className="container max-w-3xl mx-auto px-4 text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/20 bg-primary/5 text-xs font-medium text-primary mb-8 animate-fade-in">
          <Sparkles className="w-3 h-3" />
          Now in public beta
        </div>

        <h1 className="text-4xl sm:text-5xl md:text-7xl font-extrabold tracking-[-0.04em] leading-[1.05] mb-6 animate-slide-up">
          Instant file sharing
          <br />
          with <span className="text-gradient">hashtag rooms</span>
        </h1>

        <p
          className="text-base md:text-lg text-muted-foreground max-w-lg mx-auto mb-12 leading-relaxed animate-slide-up"
          style={{ animationDelay: "0.1s" }}
        >
          Create or join a temporary cloud space and share files with anyone using a simple hashtag. No accounts needed.
        </p>

        <div
          className="max-w-lg mx-auto flex flex-col sm:flex-row gap-3 animate-slide-up"
          style={{ animationDelay: "0.2s" }}
        >
          <div className="flex-1">
            <HashtagInput value={hashtag} onChange={setHashtag} />
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <Button
              size="lg"
              onClick={handleCreate}
              className="rounded-xl h-12 px-6 font-semibold glow-sm hover:glow-md transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              Create Room
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={handleJoin}
              className="rounded-xl h-12 px-6 font-semibold"
              disabled={!hashtag.trim()}
            >
              Join Room
            </Button>
          </div>
        </div>

        {/* Trust line */}
        <p
          className="text-xs text-muted-foreground mt-8 animate-slide-up"
          style={{ animationDelay: "0.3s" }}
        >
          No signups · Files auto-expire · End-to-end encrypted
        </p>
      </div>
    </section>
  );
};

export default HeroSection;
