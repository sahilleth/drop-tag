const STORAGE_KEY = "recentRooms";
const MAX_RECENT = 5;

export const getRecentRooms = (): string[] => {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((v) => typeof v === "string");
  } catch {
    return [];
  }
};

export const addRecentRoom = (tag: string) => {
  if (typeof window === "undefined") return;
  const clean = (tag || "").trim().replace(/^#/, "");
  if (!clean) return;
  try {
    const current = getRecentRooms().filter((t) => t !== clean);
    const next = [clean, ...current].slice(0, MAX_RECENT);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // ignore localStorage errors
  }
};

export const removeRecentRoom = (tag: string) => {
  if (typeof window === "undefined") return;
  try {
    const current = getRecentRooms();
    const next = current.filter((t) => t !== tag);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // ignore
  }
};

export const clearRecentRooms = () => {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
};

