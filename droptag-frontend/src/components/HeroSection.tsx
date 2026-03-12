import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import HashtagInput from "./HashtagInput";
import { getRoomByHashtag, isValidRoomName } from "@/lib/rooms";
import { useToast } from "@/hooks/use-toast";

const normalizedTag = (s: string) => s.trim().replace(/^#/, "");

const HeroSection = () => {
  const [hashtag, setHashtag] = useState("");
  const [debouncedTag, setDebouncedTag] = useState("");
  const [creating, setCreating] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const tag = normalizedTag(hashtag);
    const t = setTimeout(() => setDebouncedTag(tag), 400);
    return () => clearTimeout(t);
  }, [hashtag]);

  const { data: existingRoom, isLoading: checkingRoom } = useQuery({
    queryKey: ["room-exists", debouncedTag],
    queryFn: () => getRoomByHashtag(debouncedTag),
    enabled: debouncedTag.length > 0 && isValidRoomName(debouncedTag),
    staleTime: 30 * 1000,
  });

  const tag = normalizedTag(hashtag);
  const tagIsValid = !tag || isValidRoomName(tag);
  const joinDisabled =
    !tag ||
    !tagIsValid ||
    (tag === debouncedTag && (checkingRoom || !existingRoom));

  const handleCreate = async () => {
    const tagToCreate = tag || "hackathon2026";
    if (!tagToCreate) return;
    if (!isValidRoomName(tagToCreate)) {
      toast({
        title: "Invalid room name",
        description: "Room name must be 3–30 characters and can contain letters, numbers, - or _.",
        variant: "destructive",
      });
      return;
    }
    setCreating(true);
    try {
      const existing = await getRoomByHashtag(tagToCreate);
      if (existing) {
        toast({
          title: "Room already exists",
          description: `#${tagToCreate} is already in use. Opening it instead.`,
        });
      }
      navigate(`/room/${tagToCreate}`);
    } catch (err) {
      toast({
        title: "Something went wrong",
        description: err instanceof Error ? err.message : "Could not check room.",
        variant: "destructive",
      });
    } finally {
      setCreating(false);
    }
  };

  const handleJoin = () => {
    if (!tag) return;
    if (!isValidRoomName(tag)) {
      toast({
        title: "Invalid room name",
        description: "Room name must be 3–30 characters and can contain letters, numbers, - or _.",
        variant: "destructive",
      });
      return;
    }
    if (joinDisabled) return;
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
          Create or join a temporary cloud space and share files with anyone using a simple hashtag.
          Set a PIN, control room duration, and keep everything private—no accounts needed.
        </p>

        <div
          className="max-w-lg mx-auto flex flex-col sm:flex-row gap-3 animate-slide-up"
          style={{ animationDelay: "0.2s" }}
        >
          <div className="flex-1">
            <HashtagInput value={hashtag} onChange={setHashtag} />
            {tag && !tagIsValid && (
              <p className="mt-1 text-xs text-destructive text-left">
                Room name must be 3–30 characters and can contain letters, numbers, - or _.
              </p>
            )}
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <Button
              size="lg"
              onClick={() => void handleCreate()}
              disabled={creating}
              className="rounded-xl h-12 px-6 font-semibold glow-sm hover:glow-md transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              {creating ? "Checking…" : "Create Room"}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={handleJoin}
              className="rounded-xl h-12 px-6 font-semibold border-dashed hover:border-solid hover:glow-sm hover:translate-y-[-1px] transition-all disabled:opacity-60"
              disabled={joinDisabled}
            >
              {tag && tag === debouncedTag && checkingRoom ? "Checking…" : "Join Room"}
            </Button>
          </div>
        </div>

        {/* Trust line */}
        <p
          className="text-xs text-muted-foreground mt-8 animate-slide-up"
          style={{ animationDelay: "0.3s" }}
        >
          No signups · PIN-protected rooms · Custom expiry · Files auto-delete
        </p>
      </div>
    </section>
  );
};

export default HeroSection;
