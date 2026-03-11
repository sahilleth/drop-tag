import { supabase } from "@/lib/supabase";
import { getOrCreateRoom, getRoomByHashtag, isRoomExpired, sanitizeHashtag, type RoomRecord } from "@/lib/rooms";

export interface TextRecord {
  id: string;
  room_id: string;
  content: string;
  created_at: string;
}

export interface RoomTextsResult {
  room: RoomRecord | null;
  texts: TextRecord[];
  isExpired: boolean;
}

export const createText = async (hashtag: string, content: string): Promise<TextRecord> => {
  const trimmed = content.trim();
  if (!trimmed) {
    throw new Error("Text cannot be empty.");
  }

  const cleanHashtag = sanitizeHashtag(hashtag);
  const roomId = await getOrCreateRoom(cleanHashtag);

  const { data, error } = await supabase
    .from("texts")
    .insert({
      room_id: roomId,
      content: trimmed,
    })
    .select("*")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data as TextRecord;
};

export const getTextsForRoom = async (hashtag: string): Promise<RoomTextsResult> => {
  const cleanHashtag = sanitizeHashtag(hashtag);

  const room = await getRoomByHashtag(cleanHashtag);
  if (!room) {
    return {
      room: null,
      texts: [],
      isExpired: false,
    };
  }

  const { data, error } = await supabase
    .from("texts")
    .select("*")
    .eq("room_id", room.id)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  const texts = (data || []) as TextRecord[];

  return {
    room,
    texts,
    isExpired: isRoomExpired(room),
  };
};

export const deleteText = async (id: string): Promise<void> => {
  const { error } = await supabase.from("texts").delete().eq("id", id);
  if (error) {
    throw new Error(error.message);
  }
};


