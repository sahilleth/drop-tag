import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { verifyRoomPin, setRoomPin } from "@/lib/roomAuth";

interface PinDialogProps {
  mode: "verify" | "set";
  open: boolean;
  hashtag: string;
  roomId?: string;
  onVerified?: () => void;
  onClose?: () => void;
}

const PinDialog = ({ mode, open, hashtag, roomId, onVerified, onClose }: PinDialogProps) => {
  const [pin, setPin] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async () => {
    if (submitting) return;
    try {
      setSubmitting(true);
      if (mode === "verify") {
        const ok = await verifyRoomPin(hashtag, pin);
        if (!ok) {
          toast({
            title: "Incorrect PIN",
            variant: "destructive",
          });
          return;
        }
        toast({
          title: "Access granted",
        });
        onVerified?.();
      } else if (mode === "set") {
        if (!roomId) {
          toast({
            title: "Unable to set PIN",
            description: "Room is not ready yet.",
            variant: "destructive",
          });
          return;
        }
        await setRoomPin(roomId, pin);
        toast({
          title: "PIN set for this room",
        });
        onVerified?.();
      }
      setPin("");
      onClose?.();
    } catch (error: unknown) {
      toast({
        title: "Something went wrong",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose?.()}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-sm">
            {mode === "verify" ? "Enter PIN to access this room" : "Set a PIN for this room"}
          </DialogTitle>
          <DialogDescription className="text-xs">
            {mode === "verify"
              ? "This room is protected. Enter the PIN to view its contents."
              : "Optional: protect this room with a numeric or text PIN."}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <Input
            type="password"
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            placeholder="Enter PIN"
            className="h-9 text-sm"
          />
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              size="sm"
              className="h-8 rounded-md"
              onClick={() => {
                setPin("");
                onClose?.();
              }}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button
              size="sm"
              className="h-8 rounded-md"
              onClick={handleSubmit}
              disabled={submitting || !pin.trim()}
            >
              {mode === "verify" ? "Unlock" : "Set PIN"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PinDialog;

