import { supabase } from "@/lib/supabase";

export const deleteExpiredRooms = async (): Promise<number> => {
  const { data, error } = await supabase
    .from("rooms")
    .select("id, created_at, auto_clean_after_days");

  if (error) {
    throw new Error(error.message);
  }

  const rooms = (data || []) as { id: string; created_at: string; auto_clean_after_days: number | null }[];

  const now = Date.now();
  const expiredIds: string[] = [];

  for (const room of rooms) {
    const days = room.auto_clean_after_days ?? 1;
    const createdAt = new Date(room.created_at).getTime();
    if (Number.isNaN(createdAt)) continue;
    const ttlMs = days * 24 * 60 * 60 * 1000;
    if (createdAt + ttlMs < now) {
      expiredIds.push(room.id);
    }
  }

  if (!expiredIds.length) {
    return 0;
  }

  const { error: deleteError } = await supabase.from("rooms").delete().in("id", expiredIds);
  if (deleteError) {
    throw new Error(deleteError.message);
  }

  return expiredIds.length;
};

