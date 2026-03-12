import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Copy, Trash2, Loader2, ChevronDown, ChevronUp } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { deleteText } from "@/lib/texts";
import TagInput from "@/components/TagInput";
import CommentThread from "@/components/CommentThread";
import { useQueryClient } from "@tanstack/react-query";

export interface TextItem {
  id: string;
  content: string;
  createdAt: string;
}

interface TextListProps {
  texts: TextItem[];
  roomId?: string;
  hashtag?: string;
}

const PREVIEW_CHARS = 400;
const PREVIEW_LINES = 8;

const formatCreatedTime = (createdAt: string) => {
  const date = new Date(createdAt);
  if (Number.isNaN(date.getTime())) return createdAt;
  return date.toLocaleString();
};

/** Heuristic: content looks like code if it has many lines or common code patterns */
const looksLikeCode = (content: string) => {
  const lines = content.split("\n").length;
  if (lines >= 3) return true;
  return /^\s*[{}()[\]<>;:=]|def |function |const |let |var |import |from |class |\/\//m.test(content);
};

const TextList = ({ texts, roomId, hashtag }: TextListProps) => {
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  if (!texts.length) return null;

  const handleCopy = async (content: string) => {
    try {
      await navigator.clipboard.writeText(content);
      toast({
        title: "Text copied",
      });
    } catch (error) {
      toast({
        title: "Failed to copy text",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (!hashtag) {
      toast({
        title: "Cannot delete",
        description: "Room context missing.",
        variant: "destructive",
      });
      return;
    }
    setDeletingId(id);
    try {
      await deleteText(id);
      await queryClient.refetchQueries({ queryKey: ["room-texts", hashtag] });
      toast({
        title: "Text deleted",
      });
    } catch (error: unknown) {
      toast({
        title: "Failed to delete text",
        description: error instanceof Error ? error.message : "Something went wrong.",
        variant: "destructive",
      });
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <Card className="rounded-xl border border-border bg-card overflow-hidden flex flex-col max-h-[min(50vh,480px)]">
      <CardContent className="p-0 flex flex-col min-h-0 flex-1">
        <ScrollArea className="flex-1 min-h-0">
          <div className="p-3 space-y-3">
            {texts.map((text) => {
              const isLong = text.content.length > PREVIEW_CHARS || text.content.split("\n").length > PREVIEW_LINES;
              const isExpanded = expandedId === text.id;
              const preview =
                isLong && !isExpanded
                  ? text.content.slice(0, PREVIEW_CHARS) + (text.content.length > PREVIEW_CHARS ? "…" : "")
                  : text.content;
              const isCode = looksLikeCode(text.content);
              const contentClass = isCode
                ? "font-mono text-xs whitespace-pre overflow-x-auto break-all"
                : "text-xs whitespace-pre-wrap break-words";

              return (
                <div
                  key={text.id}
                  className="rounded-lg border border-border/70 bg-background/50 overflow-hidden"
                >
                  <div className="flex items-start justify-between gap-2 px-3 py-2 border-b border-border/50 bg-muted/30">
                    <p className="text-[11px] text-muted-foreground shrink-0">
                      {formatCreatedTime(text.createdAt)}
                    </p>
                    <div className="flex items-center gap-0.5">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 rounded"
                        onClick={() => handleCopy(text.content)}
                      >
                        <Copy className="w-3 h-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 rounded text-destructive"
                        onClick={() => void handleDelete(text.id)}
                        disabled={deletingId !== null}
                      >
                        {deletingId === text.id ? (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        ) : (
                          <Trash2 className="w-3 h-3" />
                        )}
                      </Button>
                      {isLong && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 rounded"
                          onClick={() => setExpandedId(isExpanded ? null : text.id)}
                        >
                          {isExpanded ? (
                            <ChevronUp className="w-3 h-3" />
                          ) : (
                            <ChevronDown className="w-3 h-3" />
                          )}
                        </Button>
                      )}
                    </div>
                  </div>
                  <div className="px-3 py-2">
                    {isLong && !isExpanded ? (
                      <div className={contentClass}>
                        {preview}
                        <Button
                          variant="link"
                          className="h-auto p-0 text-xs mt-1"
                          onClick={() => setExpandedId(text.id)}
                        >
                          Show more…
                        </Button>
                      </div>
                    ) : isLong ? (
                      <ScrollArea className="max-h-[min(40vh,360px)] w-full">
                        <div className={`${contentClass} pr-2`}>{text.content}</div>
                      </ScrollArea>
                    ) : (
                      <div className={contentClass}>{text.content}</div>
                    )}
                    <div className="mt-2">
                      <TagInput textId={text.id} />
                    </div>
                    {roomId && (
                      <div className="mt-2">
                        <CommentThread roomId={roomId} textId={text.id} />
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default TextList;

