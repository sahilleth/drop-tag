import { supabase } from "@/lib/supabase";

export interface TagRecord {
  id: string;
  name: string;
}

export const createTag = async (name: string): Promise<TagRecord> => {
  const trimmed = name.trim().toLowerCase();
  if (!trimmed) {
    throw new Error("Tag name cannot be empty.");
  }

  const { data, error } = await supabase
    .from("tags")
    .upsert({ name: trimmed }, { onConflict: "name" })
    .select("*")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data as TagRecord;
};

export const addTagToFile = async (fileId: string, tagName: string): Promise<void> => {
  const tag = await createTag(tagName);
  const { error } = await supabase
    .from("file_tags")
    .upsert({ file_id: fileId, tag_id: tag.id }, { onConflict: "file_id,tag_id" });

  if (error) {
    throw new Error(error.message);
  }
};

export const addTagToText = async (textId: string, tagName: string): Promise<void> => {
  const tag = await createTag(tagName);
  const { error } = await supabase
    .from("text_tags")
    .upsert({ text_id: textId, tag_id: tag.id }, { onConflict: "text_id,tag_id" });

  if (error) {
    throw new Error(error.message);
  }
};

export const getTagsForFile = async (fileId: string): Promise<TagRecord[]> => {
  const { data, error } = await supabase
    .from("file_tags")
    .select("tags ( id, name )")
    .eq("file_id", fileId);

  if (error) {
    throw new Error(error.message);
  }

  const rows = (data || []) as { tags: TagRecord | null }[];
  return rows.map((row) => row.tags).filter((t): t is TagRecord => Boolean(t));
};

export const getTagsForText = async (textId: string): Promise<TagRecord[]> => {
  const { data, error } = await supabase
    .from("text_tags")
    .select("tags ( id, name )")
    .eq("text_id", textId);

  if (error) {
    throw new Error(error.message);
  }

  const rows = (data || []) as { tags: TagRecord | null }[];
  return rows.map((row) => row.tags).filter((t): t is TagRecord => Boolean(t));
};

export const searchByTag = async (tagName: string): Promise<{
  fileIds: string[];
  textIds: string[];
}> => {
  const trimmed = tagName.trim().toLowerCase();
  if (!trimmed) {
    return { fileIds: [], textIds: [] };
  }

  const { data: tagRow, error: tagError } = await supabase
    .from("tags")
    .select("*")
    .eq("name", trimmed)
    .maybeSingle();

  if (tagError) {
    throw new Error(tagError.message);
  }

  if (!tagRow) {
    return { fileIds: [], textIds: [] };
  }

  const tagId = (tagRow as TagRecord).id;

  const [{ data: fileTagRows, error: fileError }, { data: textTagRows, error: textError }] =
    await Promise.all([
      supabase.from("file_tags").select("file_id").eq("tag_id", tagId),
      supabase.from("text_tags").select("text_id").eq("tag_id", tagId),
    ]);

  if (fileError) {
    throw new Error(fileError.message);
  }
  if (textError) {
    throw new Error(textError.message);
  }

  return {
    fileIds: (fileTagRows || []).map((r) => r.file_id as string),
    textIds: (textTagRows || []).map((r) => r.text_id as string),
  };
};

