import { FileText, X, FileSearch } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DocumentHeaderProps {
  fileName: string;
  pageCount: number;
  onClose: () => void;
}

export function DocumentHeader({ fileName, pageCount, onClose }: DocumentHeaderProps) {
  return (
    <div className="flex items-center justify-between p-4 bg-card border-b border-border rounded-t-xl">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
          <FileSearch className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h2 className="font-semibold text-foreground truncate max-w-[200px] sm:max-w-[300px]">
            {fileName}
          </h2>
          <p className="text-sm text-muted-foreground">
            {pageCount} {pageCount === 1 ? "page" : "pages"}
          </p>
        </div>
      </div>
      <Button
        variant="ghost"
        size="icon"
        onClick={onClose}
        className="h-9 w-9 rounded-lg hover:bg-destructive/10 hover:text-destructive"
      >
        <X className="w-5 h-5" />
      </Button>
    </div>
  );
}
