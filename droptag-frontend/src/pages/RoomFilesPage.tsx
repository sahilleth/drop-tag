import { useMemo, useRef, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
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
import UploadDropzone, { type UploadDropzoneHandle } from "@/components/UploadDropzone";
import FileTable from "@/components/FileTable";
import EmptyRoomState from "@/components/EmptyRoomState";
import { getFilesForRoom, mapFilesToUiItems } from "@/lib/files";
import type { RoomOutletContext } from "./RoomLayout";

const RoomFilesPage = () => {
  const { normalizedHashtag, room, isExpired, canManageRoom, clientId } =
    useOutletContext<RoomOutletContext>();
  const queryClient = useQueryClient();
  const uploadRef = useRef<UploadDropzoneHandle | null>(null);

  const filesQuery = useQuery({
    queryKey: ["room-files", normalizedHashtag],
    queryFn: () => getFilesForRoom(normalizedHashtag),
    refetchOnWindowFocus: true,
    staleTime: 15 * 1000,
  });

  const files = useMemo(
    () => mapFilesToUiItems(filesQuery.data?.files || []),
    [filesQuery.data],
  );
  const hasFiles = files.length > 0;

  const [search, setSearch] = useState("");
  const [sortMode, setSortMode] = useState<"newest" | "oldest" | "name">("newest");

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

  const handleUploadComplete = () => {
    void queryClient.invalidateQueries({
      queryKey: ["room-files", normalizedHashtag],
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
      {/* Left: Upload CTA */}
      <aside className="lg:col-span-4 xl:col-span-4">
        <section className="space-y-4 rounded-xl border border-border/60 bg-card/40 px-4 py-5">
          <h2 className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground text-center">
            Share files
          </h2>
          <div className="flex flex-col items-center text-center">
            {isExpired ? (
              <Alert variant="destructive" className="rounded-xl border-2 border-dashed max-w-md">
                <ExclamationTriangleIcon className="w-4 h-4" />
                <AlertTitle>This room has expired.</AlertTitle>
                <AlertDescription>
                  Uploads are disabled. You can still download existing files below.
                </AlertDescription>
              </Alert>
            ) : (
              <UploadDropzone
                ref={uploadRef}
                hashtag={normalizedHashtag}
                disabled={isExpired}
                onUploadComplete={handleUploadComplete}
              />
            )}
          </div>
        </section>
      </aside>

      {/* Right: Files list */}
      <section className="lg:col-span-8 xl:col-span-8 space-y-3">
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
                  <EmptyRoomState />
                )}
      </section>
    </div>
  );
};

export default RoomFilesPage;

