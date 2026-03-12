import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Copy, Trash2 } from "lucide-react";
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

const formatCreatedTime = (createdAt: string) => {
  const date = new Date(createdAt);
  if (Number.isNaN(date.getTime())) return createdAt;
  return date.toLocaleString();
};

const TextList = ({ texts, roomId, hashtag }: TextListProps) => {
  if (!texts.length) return null;

  const { toast } = useToast();
  const queryClient = useQueryClient();

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
    try {
      await deleteText(id);
      toast({
        title: "Text deleted",
      });
      if (hashtag) {
        void queryClient.invalidateQueries({ queryKey: ["room-texts", hashtag] });
      }
    } catch (error: unknown) {
      toast({
        title: "Failed to delete text",
        description: error instanceof Error ? error.message : "Something went wrong.",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="rounded-xl border border-border bg-card mt-4">
      <CardContent className="pt-4 pb-3 px-4">
        <div className="flex items-center justify-between mb-2">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
            Text
          </p>
          <span className="text-[11px] text-muted-foreground/70">{texts.length}</span>
        </div>
        <ScrollArea className="max-h-60 pr-2">
          <div className="space-y-3">
            {texts.map((text) => (
              <div
                key={text.id}
                className="rounded-md border border-border/70 bg-background/40 px-3 py-2"
              >
                <div className="flex items-start justify-between gap-2 mb-1">
                  <p className="text-[11px] text-muted-foreground">
                    {formatCreatedTime(text.createdAt)}
                  </p>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 rounded-md"
                      onClick={() => handleCopy(text.content)}
                    >
                      <Copy className="w-3 h-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 rounded-md text-destructive"
                      onClick={() => handleDelete(text.id)}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
                <p className="text-xs whitespace-pre-wrap break-words mb-1">
                  {text.content}
                </p>
                <TagInput textId={text.id} />
                {roomId && <CommentThread roomId={roomId} textId={text.id} />}
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default TextList;

