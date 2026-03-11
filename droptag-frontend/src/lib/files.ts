import { supabase } from "@/lib/supabase";
import { getOrCreateRoom, getRoomByHashtag, isRoomExpired, sanitizeHashtag, type RoomRecord } from "@/lib/rooms";

export interface FileRecord {
  id: string;
  room_id: string;
  filename: string;
  original_filename?: string | null;
  filepath?: string | null;
  url: string;
  uploaded_at: string;
  mime_type?: string | null;
  size_bytes?: number | null;
}

export interface RoomFilesResult {
  room: RoomRecord | null;
  files: FileRecord[];
  isExpired: boolean;
}

const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const MAX_UPLOADS_PER_WINDOW = 10;

const getUploadHistoryKey = (hashtag: string) => `droptag:uploads:${hashtag}`;

const readUploadHistory = (hashtag: string): number[] => {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(getUploadHistoryKey(hashtag));
    if (!raw) return [];
    const parsed = JSON.parse(raw) as number[];
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((ts) => typeof ts === "number");
  } catch {
    return [];
  }
};

const writeUploadHistory = (hashtag: string, timestamps: number[]) => {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(getUploadHistoryKey(hashtag), JSON.stringify(timestamps));
  } catch {
    // ignore storage errors
  }
};

const registerUploads = (hashtag: string, count: number) => {
  const now = Date.now();
  const history = readUploadHistory(hashtag).filter((ts) => now - ts <= RATE_LIMIT_WINDOW_MS);
  for (let i = 0; i < count; i += 1) {
    history.push(now);
  }
  writeUploadHistory(hashtag, history);
};

const assertWithinRateLimit = (hashtag: string, additionalUploads: number) => {
  const now = Date.now();
  const history = readUploadHistory(hashtag).filter((ts) => now - ts <= RATE_LIMIT_WINDOW_MS);
  const projected = history.length + additionalUploads;
  if (projected > MAX_UPLOADS_PER_WINDOW) {
    const remaining = RATE_LIMIT_WINDOW_MS - (now - (history[0] ?? now));
    const seconds = Math.max(5, Math.round(remaining / 1000));
    throw new Error(`Too many uploads. Please wait about ${seconds}s and try again.`);
  }
};

const MAX_FILE_SIZE_BYTES = 50 * 1024 * 1024; // 50MB

const ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/pdf",
  "application/zip",
] as const;

export const isAllowedFileType = (file: File) => ALLOWED_MIME_TYPES.includes(file.type as (typeof ALLOWED_MIME_TYPES)[number]);

export const isAllowedFileSize = (file: File) => file.size <= MAX_FILE_SIZE_BYTES;

const getFileTypeFromRecord = (record: FileRecord): "image" | "document" | "archive" | "other" => {
  const sourceName = (record.original_filename || record.filename || "").toLowerCase();
  const ext = sourceName.split(".").pop();
  if (!ext) return "other";

  if (["png", "jpg", "jpeg", "gif", "webp", "svg"].includes(ext)) return "image";
  if (["pdf", "doc", "docx", "ppt", "pptx", "txt", "md"].includes(ext)) return "document";
  if (["zip", "rar", "7z", "tar", "gz"].includes(ext)) return "archive";
  return "other";
};

const generateUniqueFileName = (file: File): string => {
  return `${Date.now()}-${Math.random().toString(36).slice(2)}-${file.name}`;
};

export const uploadFile = async (
  hashtag: string,
  file: File,
  onProgress?: (percent: number) => void,
): Promise<FileRecord> => {
  if (!isAllowedFileType(file)) {
    throw new Error("Unsupported file type.");
  }

  if (!isAllowedFileSize(file)) {
    throw new Error("File is too large. Max size is 50MB.");
  }

  const cleanHashtag = sanitizeHashtag(hashtag);
  assertWithinRateLimit(cleanHashtag, 1);
  const roomId = await getOrCreateRoom(cleanHashtag);

  const uniqueFileName = generateUniqueFileName(file);
  const path = `rooms/${cleanHashtag}/${uniqueFileName}`;

  const { error: uploadError } = await supabase.storage.from("files").upload(path, file, {
    upsert: false,
    onUploadProgress: (event) => {
      if (!event.total) return;
      const percent = Math.round((event.loaded / event.total) * 100);
      if (onProgress) {
        onProgress(percent);
      }
    },
  });

  if (uploadError) {
    throw new Error(uploadError.message);
  }

  const { data: publicUrlData } = supabase.storage.from("files").getPublicUrl(path);
  const publicUrl = publicUrlData.publicUrl;

  const { data, error } = await supabase
    .from("files")
    .insert({
      room_id: roomId,
      filename: file.name,
      original_filename: file.name,
      filepath: path,
      url: publicUrl,
      mime_type: file.type || null,
      size_bytes: typeof file.size === "number" ? file.size : null,
    })
    .select("*")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  registerUploads(cleanHashtag, 1);
  return data as FileRecord;
};

export const getFilesForRoom = async (hashtag: string): Promise<RoomFilesResult> => {
  const cleanHashtag = sanitizeHashtag(hashtag);

  const room = await getRoomByHashtag(cleanHashtag);
  if (!room) {
    return {
      room: null,
      files: [],
      isExpired: false,
    };
  }

  const { data, error } = await supabase
    .from("files")
    .select("*")
    .eq("room_id", room.id)
    .order("uploaded_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  const files = (data || []) as FileRecord[];

  return {
    room,
    files,
    isExpired: isRoomExpired(room),
  };
};

export const mapFilesToUiItems = (records: FileRecord[]) =>
  records.map((record) => {
    const type = getFileTypeFromRecord(record);
    const sourceName = record.original_filename || record.filename;
    const lowerName = (sourceName || "").toLowerCase();
    const isPdf = lowerName.endsWith(".pdf");
    const isImage = type === "image";

    return {
      id: record.id,
      name: sourceName,
      uploadedAt: record.uploaded_at,
      url: record.url,
      type,
      isPdf,
      isImage,
    };
  });

