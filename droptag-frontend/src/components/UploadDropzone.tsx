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
        setState("uploading");
        setProgress(0);
        for (const file of Array.from(files)) {
          await uploadFile(hashtag, file);
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

  return (
    <div className="flex flex-col items-center justify-center text-center gap-3">
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
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6 text-primary" />
          </div>
          <p className="text-sm font-medium text-primary">Upload complete!</p>
        </>
      ) : state === "error" ? (
        <>
          <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center">
            <FileUp className="w-6 h-6 text-destructive" />
          </div>
          <p className="text-sm font-medium text-destructive">Upload failed</p>
          <p className="text-xs text-muted-foreground mt-1">Please try again.</p>
        </>
      ) : (
        <>
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-2">
            <CloudUpload className="w-5 h-5 text-primary" />
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
            {state === "uploading" ? "Uploading…" : "Upload Files"}
          </Button>
          <p className="text-[11px] text-muted-foreground mt-1">Max file size: 50MB</p>
        </>
      )}
    </div>
  );
},
);

export default UploadDropzone;
