const STORAGE_KEY = "droptag_cid";

export function getClientId(): string {
  if (typeof window === "undefined") {
    return "";
  }
  try {
    let cid = window.localStorage.getItem(STORAGE_KEY);
    if (!cid) {
      cid =
        typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
          ? crypto.randomUUID()
          : `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
      window.localStorage.setItem(STORAGE_KEY, cid);
    }
    return cid;
  } catch {
    return `anon-${Date.now()}`;
  }
}
