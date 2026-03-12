import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Copy, Settings, Hash, Check, ArrowLeft, Users, Share2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useEffect, useMemo, useState } from "react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import type { RoomRecord } from "@/lib/rooms";
import { parseExpiryUtc } from "@/lib/rooms";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { QRCodeSVG } from "qrcode.react";

interface RoomHeaderProps {
  hashtag: string;
  isExpired?: boolean;
  room?: RoomRecord | null;
  onSetPin?: () => void;
  onOpenSettings?: () => void;
  onChangeExpiry?: () => void;
}

const RoomHeader = ({
  hashtag,
  isExpired,
  room,
  onSetPin,
  onOpenSettings,
  onChangeExpiry,
}: RoomHeaderProps) => {
  const [copied, setCopied] = useState(false);
  const [presenceCount, setPresenceCount] = useState<number | null>(null);
  const [qrOpen, setQrOpen] = useState(false);
  const { toast } = useToast();

  const copyLink = () => {
    const origin = window.location.origin;
    const link = `${origin}/room/${room?.hashtag ?? hashtag}`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    toast({
      title: "Room link copied!",
    });
    setTimeout(() => setCopied(false), 2000);
  };

  const [now, setNow] = useState(() => Date.now());

  const expiryLabel = useMemo(() => {
    if (isExpired) return "This room has expired.";
    if (!room?.expiry) return "Expires in 24h";

    const expiryMs = parseExpiryUtc(room.expiry);
    if (expiryMs == null) return "Expires in 24h";
    const diffMs = expiryMs - now;
    if (diffMs <= 0) return "This room has expired.";

    const diffMinutes = Math.round(diffMs / (1000 * 60));
    const hours = Math.floor(diffMinutes / 60);
    const minutes = diffMinutes % 60;

    if (hours <= 0) {
      return `Expires in ${minutes}m`;
    }

    return `Expires in ${hours}h${minutes > 0 ? ` ${minutes}m` : ""}`;
  }, [isExpired, room?.expiry, now]);

  useEffect(() => {
    if (!room?.expiry || isExpired) return;
    const interval = setInterval(() => setNow(Date.now()), 60 * 1000);
    return () => clearInterval(interval);
  }, [room?.expiry, isExpired]);

  useEffect(() => {
    const key = typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : Math.random().toString(36).slice(2);

    const channel = supabase.channel(`room-presence:${hashtag}`, {
      config: {
        presence: {
          key,
        },
      },
    });

    channel.on("presence", { event: "sync" }, () => {
      const state = channel.presenceState() as Record<string, unknown>;
      setPresenceCount(Object.keys(state).length || null);
    });

    channel.subscribe((status) => {
      if (status === "SUBSCRIBED") {
        void channel.track({ online_at: new Date().toISOString() });
      }
    });

    return () => {
      void channel.untrack();
      void channel.unsubscribe();
    };
  }, [hashtag]);

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
      <div className="flex items-center gap-3">
        <Link to="/">
          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-md">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <div className="w-9 h-9 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
          <Hash className="w-4 h-4 text-primary" />
        </div>
        <div>
          <h1 className="text-lg font-semibold tracking-tight">#{hashtag}</h1>
          <Badge variant="secondary" className="text-[10px] font-normal rounded-md mt-0.5 px-2 py-0">
            {expiryLabel}
          </Badge>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {presenceCount && presenceCount > 0 && (
          <div className="hidden sm:flex items-center text-[11px] text-muted-foreground px-2 py-1 rounded-md border border-border/60 bg-background/60 mr-1">
            <Users className="w-3 h-3 mr-1.5" />
            <span>{presenceCount} here</span>
          </div>
        )}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              onClick={copyLink}
              className="rounded-md h-8 gap-1.5 text-xs transition-all"
            >
              {copied ? (
                <Check className="w-3 h-3 text-primary" />
              ) : (
                <Copy className="w-3 h-3" />
              )}
              {copied ? "Copied!" : "Copy link"}
            </Button>
          </TooltipTrigger>
          <TooltipContent>Copy room link</TooltipContent>
        </Tooltip>

        <Button
          variant="outline"
          size="icon"
          className="rounded-md h-8 w-8"
          onClick={() => setQrOpen(true)}
        >
          <Share2 className="w-3.5 h-3.5" />
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="icon" className="rounded-md h-8 w-8">
              <Settings className="w-3.5 h-3.5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="rounded-lg w-44">
            <DropdownMenuItem className="text-xs" onClick={onOpenSettings}>
              Room settings
            </DropdownMenuItem>
            <DropdownMenuItem className="text-xs" onClick={onChangeExpiry}>
              Change expiry
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-xs" onClick={onSetPin}>
              Set PIN
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-xs text-destructive">Delete room</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <Dialog open={qrOpen} onOpenChange={setQrOpen}>
        <DialogContent className="max-w-xs">
          <DialogHeader>
            <DialogTitle className="text-sm">Share room</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center justify-center gap-3 py-2">
            <QRCodeSVG value={`${window.location.origin}/room/${room?.hashtag ?? hashtag}`} size={128} />
            <p className="text-[11px] text-center text-muted-foreground">
              Scan this QR code to join this room.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default RoomHeader;
