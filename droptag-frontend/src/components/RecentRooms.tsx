import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { X } from "lucide-react";
import {
  getRecentRooms,
  removeRecentRoom,
  clearRecentRooms,
} from "@/lib/recentRooms";

const RecentRooms = () => {
  const [rooms, setRooms] = useState<string[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    setRooms(getRecentRooms());
  }, []);

  const handleOpen = (tag: string) => {
    navigate(`/room/${tag}/files`);
  };

  const handleRemove = (tag: string) => {
    removeRecentRoom(tag);
    setRooms((prev) => prev.filter((t) => t !== tag));
  };

  const handleClear = () => {
    clearRecentRooms();
    setRooms([]);
  };

  if (!rooms.length) {
    return null;
  }

  return (
    <section className="mt-10">
      <h2 className="text-sm font-semibold text-foreground mb-3 text-left">
        Recent Rooms
      </h2>
      <div className="space-y-1">
        {rooms.map((tag) => (
          <div
            key={tag}
            className="flex items-center justify-between text-xs text-muted-foreground rounded-md px-2 py-1 hover:bg-muted cursor-pointer"
          >
            <button
              type="button"
              className="flex-1 text-left hover:text-primary transition-colors"
              onClick={() => handleOpen(tag)}
            >
              #{tag}
            </button>
            <button
              type="button"
              className="ml-2 text-muted-foreground/70 hover:text-destructive transition-colors"
              onClick={() => handleRemove(tag)}
              aria-label={`Remove room ${tag} from recent`}
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={handleClear}
        className="mt-3 text-[11px] text-muted-foreground hover:text-destructive underline underline-offset-2"
      >
        Clear all
      </button>
    </section>
  );
};

export default RecentRooms;

