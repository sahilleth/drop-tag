import { useNavigate, useParams } from "react-router-dom";
import { useMemo, useState, useRef } from "react";
import Navbar from "@/components/Navbar";
import RoomHeader from "@/components/RoomHeader";
import UploadDropzone, { type UploadDropzoneHandle } from "@/components/UploadDropzone";
import FileTable from "@/components/FileTable";
import TextShare from "@/components/TextShare";
import TextList, { type TextItem } from "@/components/TextList";
import EmptyRoomState from "@/components/EmptyRoomState";
import Footer from "@/components/Footer";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getFilesForRoom, mapFilesToUiItems } from "@/lib/files";
import { getTextsForRoom } from "@/lib/texts";
import { getClientId } from "@/lib/clientId";
import { isValidRoomName } from "@/lib/rooms";
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

  const isRoomNameValid = isValidRoomName(normalizedHashtag);

  const filesQuery = useQuery({
    queryKey: ["room-files", normalizedHashtag],
    queryFn: () => getFilesForRoom(normalizedHashtag),
    enabled: Boolean(normalizedHashtag) && isRoomNameValid,
    refetchOnWindowFocus: true,
    staleTime: 15 * 1000,
  });

  const textsQuery = useQuery({
    queryKey: ["room-texts", normalizedHashtag],
    queryFn: () => getTextsForRoom(normalizedHashtag),
    enabled: Boolean(normalizedHashtag) && isRoomNameValid,
    refetchOnWindowFocus: true,
    staleTime: 15 * 1000,
  });

  const files = useMemo(() => mapFilesToUiItems(filesQuery.data?.files || []), [filesQuery.data]);
  const texts: TextItem[] =
    textsQuery.data?.texts.map((t) => ({
      id: t.id,
      content: t.content,
      createdAt: t.created_at,
      createdBy: t.created_by ?? undefined,
    })) || [];
  const clientId = getClientId();
  const isExpired = filesQuery.data?.isExpired ?? false;
  const hasFiles = files.length > 0;
  const hasTexts = texts.length > 0;

  const [search, setSearch] = useState("");
  const [sortMode, setSortMode] = useState<"newest" | "oldest" | "name">("newest");
  const [pinVerified, setPinVerified] = useState(false);
  const [showSetPin, setShowSetPin] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const uploadRef = useRef<UploadDropzoneHandle | null>(null);

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

  if (!isRoomNameValid) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar />
        <main className="flex-1 pt-20 pb-16">
          <div className="container max-w-3xl mx-auto px-4 sm:px-6">
            <Alert variant="destructive" className="rounded-xl">
              <ExclamationTriangleIcon className="w-4 h-4" />
              <AlertTitle>Invalid room name</AlertTitle>
              <AlertDescription>
                Room name must be 3–30 characters and can contain letters, numbers, - or _.
              </AlertDescription>
            </Alert>
            <div className="mt-4">
              <Button size="sm" className="rounded-md h-8 text-xs" onClick={() => navigate("/")}>
                Go back home
              </Button>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

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
        <div className="container max-w-6xl mx-auto px-4 sm:px-6">
          <header className="mb-8">
            <RoomHeader
              hashtag={normalizedHashtag}
              isExpired={isExpired}
              room={room}
              onSetPin={canManageRoom ? () => setShowSetPin(true) : undefined}
              onOpenSettings={canManageRoom ? () => setShowSettings(true) : undefined}
              onChangeExpiry={canManageRoom ? () => setShowSettings(true) : undefined}
            />
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
            {/* Left: Upload & share */}
            <aside className="lg:col-span-4 xl:col-span-4 space-y-6 lg:sticky lg:top-24 lg:self-start">
              <section className="space-y-3">
                <h2 className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                  Share
                </h2>
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
                      ref={uploadRef}
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
              </section>
            </aside>

            {/* Right: Files & messages */}
            <div className="lg:col-span-8 xl:col-span-8 space-y-8">
              {/* Files section */}
              <section className="space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <h2 className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                    Files{" "}
                    <span className="text-muted-foreground/60 font-normal">
                      {filesQuery.isLoading ? "…" : hasFiles ? filteredFiles.length : 0}
                    </span>
                  </h2>
                  <div className="flex items-center gap-2">
                    <Input
                      placeholder="Search files…"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="h-8 flex-1 sm:flex-none sm:w-36 md:w-44 text-xs rounded-lg"
                    />
                    <Select
                      value={sortMode}
                      onValueChange={(value) => setSortMode(value as typeof sortMode)}
                    >
                      <SelectTrigger className="h-8 w-28 text-xs rounded-lg">
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
                ) : filesQuery.isLoading ? (
                  <div className="rounded-xl border border-border bg-card p-8 text-center text-sm text-muted-foreground">
                    Loading files…
                  </div>
                ) : hasFiles ? (
                  <FileTable
                    files={filteredFiles}
                    roomId={room?.id}
                    canManageRoom={canManageRoom}
                    clientId={clientId}
                    onFileDeleted={() =>
                      void queryClient.invalidateQueries({
                        queryKey: ["room-files", normalizedHashtag],
                      })
                    }
                  />
                ) : (
                  <EmptyRoomState onUpload={() => uploadRef.current?.openFileDialog()} />
                )}
              </section>

              {/* Messages section */}
              <section className="space-y-3">
                <h2 className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                  Messages{" "}
                  <span className="text-muted-foreground/60 font-normal">
                    {hasTexts ? filteredTexts.length : 0}
                  </span>
                </h2>
                {hasTexts ? (
                  <TextList
                    texts={filteredTexts}
                    roomId={room?.id}
                    hashtag={normalizedHashtag}
                    canManageRoom={canManageRoom}
                    clientId={clientId}
                  />
                ) : (
                  <div className="rounded-xl border border-dashed border-border bg-card/50 py-8 px-4 text-center">
                    <p className="text-sm text-muted-foreground">No messages yet.</p>
                    <p className="text-xs text-muted-foreground/80 mt-1">
                      Use the panel on the left to share text with this room.
                    </p>
                  </div>
                )}
              </section>
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
