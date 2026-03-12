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
    })
    .select("*")
    .single();

  if (error) {
    throw new Error(error.message);
  }

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

