import { useNavigate, useParams } from "react-router-dom";
import { useMemo, useState } from "react";
import Navbar from "@/components/Navbar";
import RoomHeader from "@/components/RoomHeader";
import UploadDropzone from "@/components/UploadDropzone";
import FileTable from "@/components/FileTable";
import TextShare from "@/components/TextShare";
import TextList, { type TextItem } from "@/components/TextList";
import EmptyRoomState from "@/components/EmptyRoomState";
import Footer from "@/components/Footer";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getFilesForRoom, mapFilesToUiItems } from "@/lib/files";
import { getTextsForRoom } from "@/lib/texts";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ExclamationTriangleIcon } from "@radix-ui/react-icons";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import PinDialog from "@/components/PinDialog";
import RoomSettingsDialog from "@/components/RoomSettingsDialog";

const Room = () => {
  const { hashtag } = useParams<{ hashtag: string }>();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const normalizedHashtag = useMemo(
    () => (hashtag || "demo").trim().replace(/^#/, ""),
    [hashtag],
  );

  const filesQuery = useQuery({
    queryKey: ["room-files", normalizedHashtag],
    queryFn: () => getFilesForRoom(normalizedHashtag),
    enabled: Boolean(normalizedHashtag),
  });

  const textsQuery = useQuery({
    queryKey: ["room-texts", normalizedHashtag],
    queryFn: () => getTextsForRoom(normalizedHashtag),
    enabled: Boolean(normalizedHashtag),
  });

  const files = useMemo(() => mapFilesToUiItems(filesQuery.data?.files || []), [filesQuery.data]);
  const texts: TextItem[] =
    textsQuery.data?.texts.map((t) => ({
      id: t.id,
      content: t.content,
      createdAt: t.created_at,
    })) || [];
  const isExpired = filesQuery.data?.isExpired ?? false;
  const hasFiles = files.length > 0;
  const hasTexts = texts.length > 0;

  const [search, setSearch] = useState("");
  const [sortMode, setSortMode] = useState<"newest" | "oldest" | "name">("newest");
  const [pinVerified, setPinVerified] = useState(false);
  const [showSetPin, setShowSetPin] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  const filteredFiles = useMemo(() => {
    const q = search.toLowerCase().trim();
    let next = [...files];
    if (q) {
      next = next.filter((f) => f.name.toLowerCase().includes(q));
    }

    if (sortMode === "name") {
      next.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortMode === "oldest") {
      next.sort((a, b) => new Date(a.uploadedAt).getTime() - new Date(b.uploadedAt).getTime());
    } else {
      next.sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime());
    }

    return next;
  }, [files, search, sortMode]);

  const filteredTexts = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return texts;
    return texts.filter((t) => t.content.toLowerCase().includes(q));
  }, [texts, search]);

  const handleUploadComplete = () => {
    void queryClient.invalidateQueries({
      queryKey: ["room-files", normalizedHashtag],
    });
  };

  const handleTextCreated = () => {
    void queryClient.invalidateQueries({
      queryKey: ["room-texts", normalizedHashtag],
    });
  };

  const room = filesQuery.data?.room ?? null;

  const canManageRoom = useMemo(() => {
    if (typeof window === "undefined") return false;
    try {
      const flag = window.localStorage.getItem(`droptag:room-owner:${normalizedHashtag}`);
      return flag === "1";
    } catch {
      return false;
    }
  }, [normalizedHashtag]);

  if (room?.secret_hash && !pinVerified) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <PinDialog
          mode="verify"
          open
          hashtag={normalizedHashtag}
          roomId={room.id}
          onVerified={() => setPinVerified(true)}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <main className="flex-1 pt-20 pb-16">
        <div className="container max-w-5xl mx-auto px-4">
          <RoomHeader
            hashtag={normalizedHashtag}
            isExpired={isExpired}
            room={room}
            onSetPin={canManageRoom ? () => setShowSetPin(true) : undefined}
            onOpenSettings={canManageRoom ? () => setShowSettings(true) : undefined}
            onChangeExpiry={canManageRoom ? () => setShowSettings(true) : undefined}
          />

          <div className="grid lg:grid-cols-5 gap-6">
            <div className="lg:col-span-2">
              <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground mb-3">
                Upload
              </p>
              {isExpired ? (
                <div className="space-y-3">
                  <Alert variant="destructive" className="rounded-xl border-2 border-dashed">
                    <ExclamationTriangleIcon className="w-4 h-4" />
                    <AlertTitle>This room has expired.</AlertTitle>
                    <AlertDescription>
                      Uploads are disabled. You can still download existing files below.
                    </AlertDescription>
                  </Alert>
                  <Button
                    size="sm"
                    className="rounded-md h-8 text-xs"
                    onClick={() => navigate("/")}
                  >
                    Create New Room
                  </Button>
                </div>
              ) : (
                <>
                  <UploadDropzone
                    hashtag={normalizedHashtag}
                    disabled={isExpired}
                    onUploadComplete={handleUploadComplete}
                  />
                  <TextShare
                    hashtag={normalizedHashtag}
                    disabled={isExpired}
                    onTextCreated={handleTextCreated}
                  />
                </>
              )}
            </div>

            <div className="lg:col-span-3">
              <div className="flex items-center justify-between mb-3 gap-3">
                <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                  Files{" "}
                  <span className="text-muted-foreground/60">
                    ({filesQuery.isLoading ? "…" : hasFiles ? filteredFiles.length : 0})
                  </span>
                </p>
                <div className="flex items-center gap-2">
                  <Input
                    placeholder="Search…"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="h-8 w-32 md:w-40 text-xs"
                  />
                  <Select
                    value={sortMode}
                    onValueChange={(value) => setSortMode(value as typeof sortMode)}
                  >
                    <SelectTrigger className="h-8 w-28 text-xs">
                      <SelectValue placeholder="Sort" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="newest">Newest</SelectItem>
                      <SelectItem value="oldest">Oldest</SelectItem>
                      <SelectItem value="name">Name</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              {filesQuery.isError ? (
                <Alert variant="destructive" className="rounded-xl">
                  <ExclamationTriangleIcon className="w-4 h-4" />
                  <AlertTitle>Something went wrong</AlertTitle>
                  <AlertDescription>
                    {(filesQuery.error as Error)?.message ?? "Failed to load files for this room."}
                  </AlertDescription>
                </Alert>
              ) : hasFiles ? (
                <>
                  <FileTable files={filteredFiles} />
                  <TextList texts={filteredTexts} roomId={room?.id} hashtag={normalizedHashtag} />
                </>
              ) : filesQuery.isLoading ? (
                <div className="rounded-xl border border-border bg-card p-6 text-xs text-muted-foreground">
                  Loading files…
                </div>
              ) : (
                <>
                  <EmptyRoomState />
                  <TextList texts={texts} roomId={room?.id} hashtag={normalizedHashtag} />
                </>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />

      {room && canManageRoom && (
        <>
          <PinDialog
            mode="set"
            open={showSetPin}
            hashtag={normalizedHashtag}
            roomId={room.id}
            onVerified={() => setShowSetPin(false)}
            onClose={() => setShowSetPin(false)}
          />
          <RoomSettingsDialog
            room={room}
            open={showSettings}
            onClose={() => setShowSettings(false)}
            onUpdated={() =>
              void queryClient.invalidateQueries({ queryKey: ["room-files", normalizedHashtag] })
            }
          />
        </>
      )}
    </div>
  );
};

export default Room;
