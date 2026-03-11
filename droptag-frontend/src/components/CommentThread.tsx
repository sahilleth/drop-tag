import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  createComment,
  deleteComment,
  getCommentsForFile,
  getCommentsForText,
  type CommentRecord,
} from "@/lib/comments";

interface CommentThreadProps {
  roomId: string;
  fileId?: string;
  textId?: string;
}

const CommentThread = ({ roomId, fileId, textId }: CommentThreadProps) => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [value, setValue] = useState("");

  const queryKey =
    fileId != null ? ["comments-file", fileId] : textId != null ? ["comments-text", textId] : null;

  const { data: comments = [], isLoading } = useQuery<CommentRecord[]>({
    queryKey: queryKey ?? ["comments-disabled"],
    queryFn: () =>
      fileId != null
        ? getCommentsForFile(fileId)
        : textId != null
        ? getCommentsForText(textId!)
        : Promise.resolve([]),
    enabled: Boolean(queryKey),
  });

  const handleSubmit = async () => {
    const trimmed = value.trim();
    if (!trimmed) return;
    try {
      await createComment(roomId, trimmed, fileId, textId);
      setValue("");
      toast({
        title: "Comment added",
      });
      if (queryKey) {
        void queryClient.invalidateQueries({ queryKey });
      }
    } catch (error: unknown) {
      toast({
        title: "Failed to add comment",
        description: error instanceof Error ? error.message : "Something went wrong.",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteComment(id);
      toast({
        title: "Comment deleted",
      });
      if (queryKey) {
        void queryClient.invalidateQueries({ queryKey });
      }
    } catch (error: unknown) {
      toast({
        title: "Failed to delete comment",
        description: error instanceof Error ? error.message : "Something went wrong.",
        variant: "destructive",
      });
    }
  };

  if (!fileId && !textId) return null;

  return (
    <Card className="mt-2 border border-border/80 bg-background/80 rounded-lg">
      <CardContent className="pt-2 pb-2 px-3 space-y-2">
        <button
          type="button"
          className="w-full flex items-center justify-between text-[11px] text-muted-foreground hover:text-foreground"
          onClick={() => setOpen((prev) => !prev)}
        >
          <span>💬 {comments.length} comments</span>
          <span>{open ? "Hide" : "Show"}</span>
        </button>
        {open && (
          <>
            <div className="space-y-1 max-h-40 overflow-y-auto pr-1">
              {isLoading ? (
                <p className="text-[11px] text-muted-foreground">Loading comments…</p>
              ) : comments.length === 0 ? (
                <p className="text-[11px] text-muted-foreground">No comments yet.</p>
              ) : (
                comments.map((comment) => (
                  <div key={comment.id} className="flex items-start gap-2">
                    <Avatar className="h-6 w-6">
                      <AvatarFallback className="text-[10px]">A</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="text-[11px] text-muted-foreground mb-0.5">
                        {new Date(comment.created_at).toLocaleString()}
                      </p>
                      <p className="text-xs whitespace-pre-wrap break-words">{comment.content}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 rounded-md text-destructive"
                      onClick={() => handleDelete(comment.id)}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                ))
              )}
            </div>
            <div className="pt-1 space-y-1">
              <Textarea
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder="Add a comment…"
                className="min-h-[50px] text-xs"
              />
              <div className="flex justify-end">
                <Button
                  size="sm"
                  className="h-7 rounded-md text-xs"
                  onClick={handleSubmit}
                  disabled={!value.trim()}
                >
                  Send
                </Button>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default CommentThread;

