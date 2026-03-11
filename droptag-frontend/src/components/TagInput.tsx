import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import {
  addTagToFile,
  addTagToText,
  getTagsForFile,
  getTagsForText,
  type TagRecord,
} from "@/lib/tags";

interface TagInputProps {
  fileId?: string;
  textId?: string;
}

const TagInput = ({ fileId, textId }: TagInputProps) => {
  const [value, setValue] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const queryKey =
    fileId != null ? ["tags-file", fileId] : textId != null ? ["tags-text", textId] : null;

  const { data: tags = [] } = useQuery<TagRecord[]>({
    queryKey: queryKey ?? ["tags-disabled"],
    queryFn: () =>
      fileId != null
        ? getTagsForFile(fileId)
        : textId != null
        ? getTagsForText(textId!)
        : Promise.resolve([]),
    enabled: Boolean(queryKey),
  });

  const handleAdd = async () => {
    const trimmed = value.trim();
    if (!trimmed || (!fileId && !textId)) return;

    try {
      if (fileId) {
        await addTagToFile(fileId, trimmed);
      } else if (textId) {
        await addTagToText(textId, trimmed);
      }
      setValue("");
      toast({
        title: "Tag added",
      });
      if (queryKey) {
        void queryClient.invalidateQueries({ queryKey });
      }
    } catch (error: unknown) {
      toast({
        title: "Failed to add tag",
        description: error instanceof Error ? error.message : "Something went wrong.",
        variant: "destructive",
      });
    }
  };

  const handleKeyDown: React.KeyboardEventHandler<HTMLInputElement> = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      void handleAdd();
    }
  };

  if (!fileId && !textId) return null;

  return (
    <div className="mt-2 space-y-1">
      <div className="flex flex-wrap gap-1">
        {tags.map((tag) => (
          <Badge key={tag.id} variant="outline" className="text-[10px] px-1.5 py-0.5 rounded-md">
            {tag.name}
          </Badge>
        ))}
      </div>
      <Input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Add tag and press Enter"
        className="h-7 text-[11px]"
      />
    </div>
  );
};

export default TagInput;

