import { supabase } from "@/lib/supabase";
import { getClientId } from "@/lib/clientId";

export interface RoomRecord {
  id: string;
  hashtag: string;
  created_at: string;
  expiry: string | null;
  secret_hash?: string | null;
  auto_clean_after_days?: number | null;
  created_by?: string | null;
}

const ROOM_EXPIRY_HOURS = 24;

export const sanitizeHashtag = (raw: string) => {
  const withoutHash = raw.trim().replace(/^#/, "");
  return withoutHash;
};

/** Parse expiry string as UTC so we don't get timezone shifts (e.g. DB returning without "Z"). */
export const parseExpiryUtc = (expiry: string | null | undefined): number | null => {
  if (!expiry?.trim()) return null;
  const s = expiry.trim();
  const hasTz = s.endsWith("Z") || /[+-]\d{2}:?\d{2}$/.test(s);
  return new Date(hasTz ? s : s + "Z").getTime();
};

export const isRoomExpired = (room: RoomRecord | null) => {
  if (!room || !room.expiry) return false;
  const expiryMs = parseExpiryUtc(room.expiry);
  return expiryMs != null && expiryMs <= Date.now();
};

export const createRoom = async (hashtag: string): Promise<RoomRecord> => {
  const cleanHashtag = sanitizeHashtag(hashtag);
  const expiresAt = new Date(Date.now() + ROOM_EXPIRY_HOURS * 60 * 60 * 1000).toISOString();
  const clientId = getClientId();

  const { data, error } = await supabase
    .from("rooms")
    .insert({
      hashtag: cleanHashtag,
      expiry: expiresAt,
      created_by: clientId,
    })
    .select("*")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  const room = data as RoomRecord;

  if (typeof window !== "undefined") {
    try {
      window.localStorage.setItem(`droptag:room-owner:${cleanHashtag}`, "1");
    } catch {
      // ignore storage errors
    }
  }

  return room;
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

export const updateRoomSettings = async (
  roomId: string,
  updates: Pick<RoomRecord, "expiry" | "auto_clean_after_days">,
): Promise<RoomRecord> => {
  const { data, error } = await supabase
    .from("rooms")
    .update({
      expiry: updates.expiry,
      auto_clean_after_days: updates.auto_clean_after_days,
    })
    .eq("id", roomId)
    .select("*")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data as RoomRecord;
};


