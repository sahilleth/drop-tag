import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { updateRoomSettings, parseExpiryUtc, type RoomRecord } from "@/lib/rooms";

interface RoomSettingsDialogProps {
  room: RoomRecord;
  open: boolean;
  onClose: () => void;
  onUpdated?: () => void;
}

const RoomSettingsDialog = ({ room, open, onClose, onUpdated }: RoomSettingsDialogProps) => {
  const { toast } = useToast();
  const [expiryHours, setExpiryHours] = useState<string>("24");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;

    // Pre-fill from existing values when dialog opens (use UTC parsing to avoid timezone bugs).
    const expiryMs = parseExpiryUtc(room.expiry ?? null);
    if (expiryMs != null && expiryMs > Date.now()) {
      const diffMs = expiryMs - Date.now();
      const hours = Math.max(1, Math.round(diffMs / (1000 * 60 * 60)));
      setExpiryHours(String(hours));
    } else {
      setExpiryHours("24");
    }
  }, [open, room.expiry]);

  const handleSave = async () => {
    const hours = Number(expiryHours);

    if (!Number.isFinite(hours) || hours <= 0) {
      toast({
        title: "Invalid expiry",
        description: "Please enter a positive number of hours.",
        variant: "destructive",
      });
      return;
    }

    try {
      setSaving(true);
      const newExpiry = new Date(Date.now() + hours * 60 * 60 * 1000).toISOString();
      await updateRoomSettings(room.id, {
        expiry: newExpiry,
      });
      toast({
        title: "Room settings updated",
      });
      onUpdated?.();
      onClose();
    } catch (error: unknown) {
      toast({
        title: "Failed to update room",
        description: error instanceof Error ? error.message : "Something went wrong.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-sm">Room settings</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-1">
          <div className="space-y-1.5">
            <Label htmlFor="expiry-hours" className="text-xs">
              Room expiry
            </Label>
            <Select value={expiryHours} onValueChange={setExpiryHours}>
              <SelectTrigger id="expiry-hours" className="h-8 text-xs">
                <SelectValue placeholder="Choose expiry" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">In 1 hour</SelectItem>
                <SelectItem value="6">In 6 hours</SelectItem>
                <SelectItem value="12">In 12 hours</SelectItem>
                <SelectItem value="24">In 24 hours</SelectItem>
                <SelectItem value="72">In 3 days</SelectItem>
                <SelectItem value="168">In 7 days</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-[10px] text-muted-foreground">
              The room will automatically expire after this time.
            </p>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="cleanup-days" className="text-xs">
              Auto-clean after (days)
            </Label>
            <Input
              id="cleanup-days"
              type="number"
              min={1}
              value={cleanupDays}
              onChange={(e) => setCleanupDays(e.target.value)}
              className="h-8 text-xs"
            />
          </div>
          <div className="flex justify-end gap-2 pt-1">
            <Button
              variant="outline"
              size="sm"
              className="h-8 rounded-md text-xs"
              onClick={onClose}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button
              size="sm"
              className="h-8 rounded-md text-xs"
              onClick={handleSave}
              disabled={saving}
            >
              Save changes
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default RoomSettingsDialog;

