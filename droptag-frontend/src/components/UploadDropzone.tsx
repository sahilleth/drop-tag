import { useState, useCallback, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { CloudUpload, CheckCircle2, FileUp } from "lucide-react";
import { uploadFile } from "@/lib/files";
import { useToast } from "@/hooks/use-toast";

type UploadState = "empty" | "uploading" | "success" | "error";

interface UploadDropzoneProps {
  hashtag: string;
  disabled?: boolean;
  onUploadComplete?: () => void;
}

const UploadDropzone = ({ hashtag, disabled, onUploadComplete }: UploadDropzoneProps) => {
  const [state, setState] = useState<UploadState>("empty");
  const [progress, setProgress] = useState(0);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const { toast } = useToast();

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

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      if (disabled) return;
      void handleFiles(e.dataTransfer.files);
    },
    [disabled, handleFiles],
  );

  return (
    <Card
      className={`rounded-xl border-2 border-dashed transition-all duration-300 cursor-pointer ${
        disabled
          ? "border-border bg-muted cursor-not-allowed opacity-70"
          : dragOver
          ? "border-primary/50 bg-primary/5 glow-sm"
          : state === "success"
          ? "border-primary/30 bg-primary/5"
          : "border-border hover:border-muted-foreground/30"
      }`}
      onDragOver={(e) => {
        e.preventDefault();
        setDragOver(true);
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={handleDrop}
      onClick={() => {
        if (disabled || state === "uploading") return;
        fileInputRef.current?.click();
      }}
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
      <CardContent className="flex flex-col items-center justify-center py-12 px-6 text-center">
        {state === "success" ? (
          <>
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-3">
              <CheckCircle2 className="w-6 h-6 text-primary" />
            </div>
            <p className="text-sm font-medium text-primary">Upload complete!</p>
          </>
        ) : state === "error" ? (
          <>
            <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center mb-3">
              <FileUp className="w-6 h-6 text-destructive" />
            </div>
            <p className="text-sm font-medium text-destructive">Upload failed</p>
            <p className="text-xs text-muted-foreground mt-1">Please try again.</p>
          </>
        ) : (
          <>
            <div
              className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-all ${
                state === "uploading"
                  ? "bg-primary/10 border border-primary/20"
                  : "bg-secondary"
              }`}
            >
              {state === "uploading" ? (
                <FileUp className="w-5 h-5 text-primary animate-pulse" />
              ) : (
                <CloudUpload className="w-5 h-5 text-muted-foreground" />
              )}
            </div>
            <p className="text-sm font-medium mb-1">
              {disabled
                ? "This room has expired."
                : state === "uploading"
                ? "Uploading..."
                : "Drag & drop files here"}
            </p>
            <p className="text-xs text-muted-foreground mb-5">
              {state === "uploading"
                ? `${progress}% complete`
                : disabled
                ? "Uploads are disabled for expired rooms."
                : "or click to browse · Max 50MB · JPG, PNG, WEBP, PDF, ZIP"}
            </p>

            {state === "uploading" ? (
              <div className="w-full max-w-xs">
                <Progress value={progress} className="h-1 rounded-full" />
              </div>
            ) : (
              <Button
                variant="outline"
                size="sm"
                className="rounded-md h-7 text-xs"
                onClick={(e) => {
                  e.stopPropagation();
                  if (disabled) return;
                  fileInputRef.current?.click();
                }}
                disabled={disabled}
              >
                Browse files
              </Button>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default UploadDropzone;
