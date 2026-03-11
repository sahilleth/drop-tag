import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { createText } from "@/lib/texts";

interface TextShareProps {
  hashtag: string;
  disabled?: boolean;
  onTextCreated?: () => void;
}

const TextShare = ({ hashtag, disabled, onTextCreated }: TextShareProps) => {
  const [value, setValue] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async () => {
    if (disabled || submitting) return;
    const trimmed = value.trim();
    if (!trimmed) {
      toast({
        title: "Nothing to share",
        description: "Please enter some text before saving.",
        variant: "destructive",
      });
      return;
    }

    try {
      setSubmitting(true);
      await createText(hashtag, trimmed);
      setValue("");
      toast({
        title: "Text shared!",
      });
      onTextCreated?.();
    } catch (error: unknown) {
      toast({
        title: "Failed to share text",
        description: error instanceof Error ? error.message : "Something went wrong.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card className="rounded-xl mt-4">
      <CardHeader className="pb-3">
        <CardTitle className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          Text
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <Textarea
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={disabled ? "This room has expired. Text sharing is disabled." : "Type or paste text to share with this room…"}
          disabled={disabled}
          className="min-h-[90px] text-xs"
        />
        <div className="flex justify-end mt-2">
          <Button
            size="sm"
            className="rounded-md h-7 text-xs"
            onClick={handleSubmit}
            disabled={disabled || submitting}
          >
            Save text
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default TextShare;

