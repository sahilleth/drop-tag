import { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Download, FileText, Image, FileArchive, File, Eye, Link2, Trash2, Loader2 } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import CommentThread from "@/components/CommentThread";
import TagInput from "@/components/TagInput";
import { deleteFile } from "@/lib/files";

export interface FileItem {
  id: string;
  name: string;
  uploadedAt: string;
  url: string;
  type: "image" | "document" | "archive" | "other";
  isImage?: boolean;
  isPdf?: boolean;
  uploadedBy?: string;
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
  canManageRoom?: boolean;
  clientId?: string;
  onFileDeleted?: () => void;
}

const formatUploadedTime = (uploadedAt: string) => {
  const date = new Date(uploadedAt);
  if (Number.isNaN(date.getTime())) return uploadedAt;
  return date.toLocaleString();
};

const FileTable = ({ files, roomId, canManageRoom, clientId, onFileDeleted }: FileTableProps) => {
  const [previewFile, setPreviewFile] = useState<FileItem | null>(null);
  const [previewLoadFailed, setPreviewLoadFailed] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const { toast } = useToast();

  const canDelete = (file: FileItem) =>
    Boolean(clientId && (canManageRoom || file.uploadedBy === clientId));

  const handleDeleteFile = async (file: FileItem) => {
    if (!clientId || !canDelete(file)) return;
    setDeletingId(file.id);
    try {
      await deleteFile(file.id, clientId);
      toast({ title: "File deleted" });
      onFileDeleted?.();
    } catch (error: unknown) {
      toast({
        title: "Failed to delete file",
        description: error instanceof Error ? error.message : "Not allowed or error.",
        variant: "destructive",
      });
    } finally {
      setDeletingId(null);
    }
  };

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
      <div className="rounded-xl border border-border overflow-hidden bg-card flex flex-col max-h-[min(55vh,520px)]">
        <div className="overflow-auto min-h-0 flex-1">
          <Table>
            <TableHeader>
              <TableRow className="bg-secondary/50 hover:bg-secondary/50 border-b border-border sticky top-0 z-10">
                <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground bg-secondary/95 backdrop-blur py-2">
                  File
                </TableHead>
                <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground w-24 hidden sm:table-cell bg-secondary/95 backdrop-blur py-2">
                  Uploaded
                </TableHead>
                <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground w-24 text-right bg-secondary/95 backdrop-blur py-2">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {files.map((file) => {
                const Icon = iconMap[file.type];
                const canPreview = Boolean(file.isImage || file.isPdf);
                const showDelete = canDelete(file);
                const isDeleting = deletingId === file.id;

                return (
                  <TableRow
                    key={file.id}
                    className="group transition-colors hover:bg-secondary/20 border-b border-border last:border-0"
                  >
                    <TableCell className="py-1.5">
                      <div className="flex flex-col gap-0.5">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded bg-secondary flex items-center justify-center shrink-0">
                            <Icon className="w-3 h-3 text-muted-foreground" />
                          </div>
                          <span className="text-xs font-medium truncate max-w-[180px] sm:max-w-[240px]">
                            {file.name}
                          </span>
                        </div>
                        <TagInput fileId={file.id} />
                      </div>
                    </TableCell>
                    <TableCell className="text-[11px] text-muted-foreground hidden sm:table-cell align-top py-1.5">
                      {formatUploadedTime(file.uploadedAt)}
                    </TableCell>
                    <TableCell className="text-right space-x-0.5 align-top py-1.5">
                      {canPreview && (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={() => setPreviewFile(file)}
                            >
                              <Eye className="w-3 h-3" />
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
                            className="h-6 w-6 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => window.open(file.url, "_blank", "noopener,noreferrer")}
                          >
                            <Download className="w-3 h-3" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Download</TooltipContent>
                      </Tooltip>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => handleCopyLink(file.url)}
                          >
                            <Link2 className="w-3 h-3" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Copy link</TooltipContent>
                      </Tooltip>
                      {showDelete && (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 rounded opacity-0 group-hover:opacity-100 transition-opacity text-destructive"
                              onClick={() => void handleDeleteFile(file)}
                              disabled={isDeleting}
                            >
                              {isDeleting ? (
                                <Loader2 className="w-3 h-3 animate-spin" />
                              ) : (
                                <Trash2 className="w-3 h-3" />
                              )}
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Delete file</TooltipContent>
                        </Tooltip>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </div>

      {roomId &&
        files.map((file) => (
          <CommentThread key={`comments-${file.id}`} roomId={roomId} fileId={file.id} />
        ))}

      {previewFile && (
        <Dialog
          open
          onOpenChange={(open) => {
            if (!open) {
              setPreviewFile(null);
              setPreviewLoadFailed(false);
            }
          }}
        >
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle className="truncate">{previewFile.name}</DialogTitle>
            </DialogHeader>
            {previewLoadFailed ? (
              <div className="mt-4 py-8 px-4 text-center rounded-lg border border-dashed border-border bg-muted/30">
                <p className="text-sm font-medium text-muted-foreground">
                  This file is no longer available.
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  It may have been deleted from storage. Refresh the list to update.
                </p>
                <Button
                  variant="secondary"
                  size="sm"
                  className="mt-4"
                  onClick={() => {
                    onFileDeleted?.();
                    setPreviewFile(null);
                    setPreviewLoadFailed(false);
                  }}
                >
                  Refresh file list
                </Button>
              </div>
            ) : (
              <>
                {previewFile.isImage && (
                  <div className="mt-4">
                    <img
                      src={previewFile.url}
                      alt={previewFile.name}
                      className="w-full h-auto rounded-md border border-border object-contain max-h-[70vh]"
                      onError={() => setPreviewLoadFailed(true)}
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
                    <p className="text-[11px] text-muted-foreground mt-1">
                      If the PDF doesn’t load, it may have been removed. Close and click “Refresh” in the room to update the list.
                    </p>
                  </div>
                )}
              </>
            )}
          </DialogContent>
        </Dialog>
      )}
    </>
  );
};

export default FileTable;
