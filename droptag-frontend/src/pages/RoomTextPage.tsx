import { useMemo } from "react";
import { useOutletContext } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import TextShare from "@/components/TextShare";
import TextList, { type TextItem } from "@/components/TextList";
import { getTextsForRoom } from "@/lib/texts";
import type { RoomOutletContext } from "./RoomLayout";

const RoomTextPage = () => {
  const { normalizedHashtag, room, isExpired, canManageRoom, clientId } =
    useOutletContext<RoomOutletContext>();

  const textsQuery = useQuery({
    queryKey: ["room-texts", normalizedHashtag],
    queryFn: () => getTextsForRoom(normalizedHashtag),
    refetchOnWindowFocus: true,
    staleTime: 15 * 1000,
  });

  const texts: TextItem[] = useMemo(
    () =>
      textsQuery.data?.texts.map((t) => ({
        id: t.id,
        content: t.content,
        createdAt: t.created_at,
        createdBy: t.created_by ?? undefined,
      })) || [],
    [textsQuery.data],
  );

  const hasTexts = texts.length > 0;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <section>
        <TextShare
          hashtag={normalizedHashtag}
          disabled={isExpired}
          onTextCreated={() => void textsQuery.refetch()}
        />
      </section>

      <section className="space-y-3">
        <h2 className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
          Text{" "}
          <span className="text-muted-foreground/60 font-normal">
            {textsQuery.isLoading ? "…" : hasTexts ? texts.length : 0}
          </span>
        </h2>
        {hasTexts ? (
          <TextList
            texts={texts}
            roomId={room?.id}
            hashtag={normalizedHashtag}
            canManageRoom={canManageRoom}
            clientId={clientId}
          />
        ) : textsQuery.isLoading ? (
          <div className="rounded-xl border border-border bg-card p-8 text-center text-sm text-muted-foreground">
            Loading text…
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-border bg-card/50 py-8 px-4 text-center">
            <p className="text-sm text-muted-foreground">No text shared yet.</p>
            <p className="text-xs text-muted-foreground/80 mt-1">Start the conversation.</p>
          </div>
        )}
      </section>
    </div>
  );
};

export default RoomTextPage;

