import { supabase } from "@/lib/supabase";

export interface CommentRecord {
  id: string;
  room_id: string;
  file_id: string | null;
  text_id: string | null;
  content: string;
  created_at: string;
}

export const createComment = async (
  roomId: string,
  content: string,
  fileId?: string,
  textId?: string,
): Promise<CommentRecord> => {
  const trimmed = content.trim();
  if (!trimmed) {
    throw new Error("Comment cannot be empty.");
  }

  const { data, error } = await supabase
    .from("comments")
    .insert({
      room_id: roomId,
      content: trimmed,
      file_id: fileId ?? null,
      text_id: textId ?? null,
    })
    .select("*")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data as CommentRecord;
};

export const getCommentsForFile = async (fileId: string): Promise<CommentRecord[]> => {
  const { data, error } = await supabase
    .from("comments")
    .select("*")
    .eq("file_id", fileId)
    .order("created_at", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return (data || []) as CommentRecord[];
};

export const getCommentsForText = async (textId: string): Promise<CommentRecord[]> => {
  const { data, error } = await supabase
    .from("comments")
    .select("*")
    .eq("text_id", textId)
    .order("created_at", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return (data || []) as CommentRecord[];
};

export const deleteComment = async (commentId: string): Promise<void> => {
  const { error } = await supabase.from("comments").delete().eq("id", commentId);
  if (error) {
    throw new Error(error.message);
  }
};

