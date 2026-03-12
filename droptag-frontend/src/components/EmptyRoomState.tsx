import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FolderOpen } from "lucide-react";

interface EmptyRoomStateProps {
  onUpload?: () => void;
}

const EmptyRoomState = ({ onUpload }: EmptyRoomStateProps) => {
  return (
    <Card className="rounded-xl border border-dashed border-border">
      <CardContent className="flex flex-col items-center justify-center py-16 px-6 text-center">
        <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center mb-4">
          <FolderOpen className="w-6 h-6 text-muted-foreground" />
        </div>
        <h3 className="text-sm font-medium mb-1">This room is empty.</h3>
        <p className="text-xs text-muted-foreground mb-4 max-w-xs">
          Upload files to start sharing.
        </p>
        <Button size="sm" className="rounded-lg" onClick={onUpload}>
          Upload Files
        </Button>
      </CardContent>
    </Card>
  );
};

export default EmptyRoomState;
