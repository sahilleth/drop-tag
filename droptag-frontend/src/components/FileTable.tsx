import { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Download, FileText, Image, FileArchive, File, Eye, Link2 } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import CommentThread from "@/components/CommentThread";
import TagInput from "@/components/TagInput";

export interface FileItem {
  id: string;
  name: string;
  uploadedAt: string;
  url: string;
  type: "image" | "document" | "archive" | "other";
  isImage?: boolean;
  isPdf?: boolean;
}

const iconMap = {
  image: Image,
  document: FileText,
  archive: FileArchive,
  other: File,
};

interface FileTableProps {
  files: FileItem[];
  roomId?: string;
}

const formatUploadedTime = (uploadedAt: string) => {
  const date = new Date(uploadedAt);
  if (Number.isNaN(date.getTime())) return uploadedAt;
  return date.toLocaleString();
};

const FileTable = ({ files, roomId }: FileTableProps) => {
  const [previewFile, setPreviewFile] = useState<FileItem | null>(null);
  const { toast } = useToast();

  const handleCopyLink = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      toast({
        title: "File link copied",
      });
    } catch (error) {
      toast({
        title: "Failed to copy link",
        variant: "destructive",
      });
    }
  };

  return (
    <>
      <div className="rounded-xl border border-border overflow-hidden bg-card">
        <Table>
          <TableHeader>
            <TableRow className="bg-secondary/50 hover:bg-secondary/50 border-b border-border">
              <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                File
              </TableHead>
              <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground w-28 hidden sm:table-cell">
                Uploaded
              </TableHead>
              <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground w-28 text-right">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {files.map((file) => {
              const Icon = iconMap[file.type];
              const canPreview = Boolean(file.isImage || file.isPdf);

              return (
                <TableRow
                  key={file.id}
                  className="group transition-colors hover:bg-secondary/20 border-b border-border last:border-0"
                >
                  <TableCell className="py-2.5">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-3">
                        <div className="w-7 h-7 rounded-md bg-secondary flex items-center justify-center shrink-0">
                          <Icon className="w-3.5 h-3.5 text-muted-foreground" />
                        </div>
                        <span className="text-[13px] font-medium truncate max-w-[200px]">
                          {file.name}
                        </span>
                      </div>
                      <TagInput fileId={file.id} />
                    </div>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground hidden sm:table-cell align-top">
                    {formatUploadedTime(file.uploadedAt)}
                  </TableCell>
                  <TableCell className="text-right space-x-1 align-top">
                    {canPreview && (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 rounded-md opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => setPreviewFile(file)}
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Preview</TooltipContent>
                      </Tooltip>
                    )}
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 rounded-md opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => window.open(file.url, "_blank", "noopener,noreferrer")}
                        >
                          <Download className="w-3.5 h-3.5" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Download</TooltipContent>
                    </Tooltip>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 rounded-md opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => handleCopyLink(file.url)}
                        >
                          <Link2 className="w-3.5 h-3.5" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Copy link</TooltipContent>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {roomId &&
        files.map((file) => (
          <CommentThread key={`comments-${file.id}`} roomId={roomId} fileId={file.id} />
        ))}

      {previewFile && (
        <Dialog
          open
          onOpenChange={(open) => {
            if (!open) setPreviewFile(null);
          }}
        >
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle className="truncate">{previewFile.name}</DialogTitle>
            </DialogHeader>
            {previewFile.isImage && (
              <div className="mt-4">
                <img
                  src={previewFile.url}
                  alt={previewFile.name}
                  className="w-full h-auto rounded-md border border-border object-contain max-h-[70vh]"
                />
              </div>
            )}
            {previewFile.isPdf && (
              <div className="mt-4 h-[70vh]">
                <iframe
                  src={previewFile.url}
                  title={previewFile.name}
                  className="w-full h-full rounded-md border border-border"
                />
              </div>
            )}
          </DialogContent>
        </Dialog>
      )}
    </>
  );
};

export default FileTable;
