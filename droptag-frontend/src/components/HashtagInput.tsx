import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Hash } from "lucide-react";

interface HashtagInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

const HashtagInput = ({ value, onChange, placeholder = "hackathon2026" }: HashtagInputProps) => {
  const [focused, setFocused] = useState(false);

  return (
    <div
      className={`relative flex items-center rounded-xl border bg-card transition-all duration-200 ${
        focused ? "border-primary/50 glow-sm ring-1 ring-primary/10" : "border-border"
      }`}
    >
      <div className="flex items-center justify-center pl-4 pr-1">
        <Hash className={`w-4 h-4 transition-colors ${focused ? "text-primary" : "text-muted-foreground"}`} />
      </div>
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value.replace(/[^a-zA-Z0-9_-]/g, ""))}
        placeholder={placeholder}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        className="border-0 bg-transparent shadow-none focus-visible:ring-0 text-base font-medium placeholder:text-muted-foreground/40 h-12"
      />
    </div>
  );
};

export default HashtagInput;
