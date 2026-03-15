import { useState, useCallback, useRef, forwardRef, useImperativeHandle } from "react";
import { Button } from "@/components/ui/button";
import { CloudUpload, CheckCircle2, FileUp } from "lucide-react";
import { uploadFile } from "@/lib/files";
import { useToast } from "@/hooks/use-toast";

type UploadState = "empty" | "uploading" | "success" | "error";

export interface UploadDropzoneHandle {
  openFileDialog: () => void;
}

interface UploadDropzoneProps {
  hashtag: string;
  disabled?: boolean;
  onUploadComplete?: () => void;
}

const UploadDropzone = forwardRef<UploadDropzoneHandle, UploadDropzoneProps>(
  ({ hashtag, disabled, onUploadComplete }, ref) => {
  const [state, setState] = useState<UploadState>("empty");
  const [progress, setProgress] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const { toast } = useToast();

  useImperativeHandle(
    ref,
    () => ({
      openFileDialog: () => {
        if (disabled || state === "uploading") return;
        fileInputRef.current?.click();
      },
    }),
    [disabled, state],
  );

  const resetState = () => {
    setState("empty");
    setProgress(0);
  };

  const handleFiles = useCallback(
    async (files: FileList | null) => {
      if (!files || files.length === 0 || disabled) return;

      try {
        const fileList = Array.from(files);
        setState("uploading");
        setProgress(0);
        for (let i = 0; i < fileList.length; i++) {
          await uploadFile(hashtag, fileList[i]);
          setProgress(Math.round(((i + 1) / fileList.length) * 100));
        }

        setProgress(100);
        setState("success");
        toast({
          title: "Upload complete!",
        });
        onUploadComplete?.();

        setTimeout(() => {
          resetState();
        }, 2000);
      } catch (error: unknown) {
        console.error(error);
        setState("error");
        toast({
          title: "Upload failed",
          description: error instanceof Error ? error.message : "Something went wrong while uploading.",
          variant: "destructive",
        });
        setTimeout(() => {
          resetState();
        }, 3000);
      }
    },
    [disabled, hashtag, onUploadComplete, toast],
  );

  const canDrop = !disabled && state !== "uploading";
  const onDragOver = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (canDrop) setIsDragging(true);
    },
    [canDrop],
  );
  const onDragLeave = useCallback((e: React.DragEvent) => {
    if (!e.currentTarget.contains(e.relatedTarget as Node)) setIsDragging(false);
  }, []);
  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);
      if (!canDrop) return;
      const files = e.dataTransfer.files;
      if (files?.length) void handleFiles(files);
    },
    [canDrop, handleFiles],
  );

  return (
    <div
      className={`
        relative flex flex-col items-center justify-center text-center gap-4
        rounded-2xl border-2 border-dashed min-h-[200px] px-6 py-8
        transition-all duration-200 ease-out
        ${disabled ? "opacity-60 cursor-not-allowed" : "cursor-default"}
        ${state === "empty" && !disabled ? "hover:border-primary/40 hover:bg-muted/20" : ""}
        ${isDragging ? "border-primary bg-primary/10 scale-[1.02] shadow-lg shadow-primary/10" : "border-border/70 bg-muted/5"}
      `}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
    >
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        multiple
        accept="image/jpeg,image/png,image/webp,application/pdf,application/zip"
        onChange={(e) => {
          void handleFiles(e.target.files);
        }}
      />
      {state === "success" ? (
        <>
          <div className="w-14 h-14 rounded-full bg-primary/15 flex items-center justify-center ring-4 ring-primary/10">
            <CheckCircle2 className="w-7 h-7 text-primary" />
          </div>
          <p className="text-sm font-semibold text-primary">Upload complete!</p>
          <p className="text-xs text-muted-foreground">Files are in the room.</p>
        </>
      ) : state === "error" ? (
        <>
          <div className="w-14 h-14 rounded-full bg-destructive/10 flex items-center justify-center ring-4 ring-destructive/10">
            <FileUp className="w-7 h-7 text-destructive" />
          </div>
          <p className="text-sm font-semibold text-destructive">Upload failed</p>
          <p className="text-xs text-muted-foreground mt-0.5">Please try again.</p>
        </>
      ) : state === "uploading" ? (
        <>
          <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center animate-pulse">
            <CloudUpload className="w-7 h-7 text-primary" />
          </div>
          <p className="text-sm font-medium">Uploading…</p>
          <div className="w-full max-w-[200px] h-1.5 rounded-full bg-muted overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </>
      ) : (
        <>
          <div
            className={`
              flex items-center justify-center rounded-2xl border-2 border-dashed
              transition-all duration-200
              ${isDragging ? "w-16 h-16 border-primary bg-primary/10" : "w-14 h-14 border-muted-foreground/20 bg-muted/50"}
            `}
          >
            <CloudUpload
              className={`text-primary transition-transform duration-200 ${isDragging ? "w-8 h-8 scale-110" : "w-7 h-7"}`}
            />
          </div>
          <div className="space-y-0.5">
            <p className="text-sm font-medium">
              {isDragging ? "Drop files here" : "Drag files here or click to browse"}
            </p>
            <p className="text-[11px] text-muted-foreground">
              {isDragging ? "Images, PDF, ZIP · Max 50MB" : "Images, PDF, ZIP · Max 50MB per file"}
            </p>
          </div>
          <Button
            type="button"
            className="upload-button rounded-lg h-10 px-6 text-sm font-semibold w-full sm:w-auto shadow-sm hover:shadow-md transition-all hover:-translate-y-px"
            disabled={disabled || state === "uploading"}
            onClick={() => {
              if (disabled || state === "uploading") return;
              fileInputRef.current?.click();
            }}
          >
            Choose files
          </Button>
        </>
      )}
    </div>
  );
},
);

export default UploadDropzone;
