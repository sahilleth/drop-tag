import { Card, CardContent } from "@/components/ui/card";
import { Zap, Clock, UserX, Shield, Lock } from "lucide-react";

const features = [
  {
    icon: Zap,
    title: "Instant Uploads",
    description: "Drag, drop, and share. Files are available to everyone in the room immediately.",
  },
  {
    icon: Clock,
    title: "Temporary Rooms",
    description: "Rooms auto-expire after a set time. Set custom durations so everything cleans itself up.",
  },
  {
    icon: UserX,
    title: "No Signups Required",
    description: "Jump straight in. No accounts, no emails, no friction whatsoever.",
  },
  {
    icon: Lock,
    title: "PIN-Protected Access",
    description: "Lock rooms with a PIN so only people you share it with can join and see the content.",
  },
  {
    icon: Shield,
    title: "Ephemeral by Default",
    description: "Rooms are designed to be temporary. Control how long they live so nothing hangs around longer than it should.",
  },
];

const FeatureCards = () => {
  return (
    <section id="features" className="relative py-24 md:py-32">
      <div className="container max-w-5xl mx-auto px-4">
        <div className="text-center mb-16">
          <p className="text-xs font-semibold uppercase tracking-widest text-primary mb-3">Features</p>
          <h2 className="text-2xl md:text-4xl font-bold tracking-tight mb-4">
            Why teams choose DropTag
          </h2>
          <p className="text-muted-foreground max-w-md mx-auto text-sm">
            The fastest way to share files with a group. Zero friction.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-5">
          {features.map((f, i) => (
            <Card
              key={f.title}
              className="group relative border border-border bg-card hover:border-primary/30 transition-all duration-300 rounded-xl overflow-hidden animate-slide-up"
              style={{ animationDelay: `${i * 0.1}s` }}
            >
              {/* Subtle top accent line */}
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              
              <CardContent className="p-6">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-5 group-hover:bg-primary/20 group-hover:glow-sm transition-all">
                  <f.icon className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-semibold text-[15px] mb-2">{f.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {f.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeatureCards;
