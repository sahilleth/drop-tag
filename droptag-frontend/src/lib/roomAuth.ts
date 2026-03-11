import bcrypt from "bcryptjs";
import { supabase } from "@/lib/supabase";
import { getRoomByHashtag, type RoomRecord } from "@/lib/rooms";

const SALT_ROUNDS = 10;

export const setRoomPin = async (roomId: string, pin: string): Promise<RoomRecord> => {
  const trimmed = pin.trim();
  if (!trimmed) {
    throw new Error("PIN cannot be empty.");
  }

  const hash = await bcrypt.hash(trimmed, SALT_ROUNDS);

  const { data, error } = await supabase
    .from("rooms")
    .update({ secret_hash: hash })
    .eq("id", roomId)
    .select("*")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data as RoomRecord;
};

export const verifyRoomPin = async (hashtag: string, pin: string): Promise<boolean> => {
  const room = await getRoomByHashtag(hashtag);
  if (!room) {
    throw new Error("Room not found.");
  }

  if (!room.secret_hash) {
    // Room is not protected.
    return true;
  }

  const trimmed = pin.trim();
  if (!trimmed) {
    return false;
  }

  return bcrypt.compare(trimmed, room.secret_hash);
};

