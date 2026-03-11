import { supabase } from "@/lib/supabase";

export interface RoomRecord {
  id: string;
  hashtag: string;
  created_at: string;
  expiry: string | null;
  secret_hash?: string | null;
  auto_clean_after_days?: number | null;
}

const ROOM_EXPIRY_HOURS = 24;

export const sanitizeHashtag = (raw: string) => {
  const withoutHash = raw.trim().replace(/^#/, "");
  return withoutHash;
};

export const isRoomExpired = (room: RoomRecord | null) => {
  if (!room || !room.expiry) return false;
  return new Date(room.expiry).getTime() <= Date.now();
};

export const createRoom = async (hashtag: string): Promise<RoomRecord> => {
  const cleanHashtag = sanitizeHashtag(hashtag);
  const expiresAt = new Date(Date.now() + ROOM_EXPIRY_HOURS * 60 * 60 * 1000).toISOString();

  const { data, error } = await supabase
    .from("rooms")
    .insert({
      hashtag: cleanHashtag,
      expiry: expiresAt,
    })
    .select("*")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data as RoomRecord;
};

export const getRoomByHashtag = async (hashtag: string): Promise<RoomRecord | null> => {
  const cleanHashtag = sanitizeHashtag(hashtag);

  const { data, error } = await supabase
    .from("rooms")
    .select("*")
    .eq("hashtag", cleanHashtag)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data as RoomRecord | null;
};

export const getOrCreateRoom = async (hashtag: string): Promise<string> => {
  const cleanHashtag = sanitizeHashtag(hashtag);

  const existing = await getRoomByHashtag(cleanHashtag);
  if (existing) {
    return existing.id;
  }

  const created = await createRoom(cleanHashtag);
  return created.id;
};

