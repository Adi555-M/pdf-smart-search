import { PDFDocument } from "@/types/pdf";
import { FileText, X, ChevronRight } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

interface DocumentListProps {
  documents: PDFDocument[];
  activeDocumentId: string | null;
  onDocumentSelect: (id: string) => void;
  onDocumentRemove: (id: string) => void;
}

export function DocumentList({
  documents,
  activeDocumentId,
  onDocumentSelect,
  onDocumentRemove,
}: DocumentListProps) {
  if (documents.length === 0) {
    return null;
  }

  return (
    <div className="paper-card p-3 mb-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-medium text-foreground">Uploaded Documents ({documents.length})</h3>
      </div>
      <ScrollArea className="max-h-32">
        <div className="space-y-1">
          {documents.map((doc) => (
            <div
              key={doc.id}
              className={cn(
                "flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-all group",
                activeDocumentId === doc.id
                  ? "bg-primary/10 border border-primary/30"
                  : "hover:bg-secondary/50 border border-transparent"
              )}
              onClick={() => onDocumentSelect(doc.id)}
            >
              <FileText className="w-4 h-4 text-primary flex-shrink-0" />
              <span className="text-sm text-foreground truncate flex-1" title={doc.name}>
                {doc.name}
              </span>
              <span className="text-xs text-muted-foreground">{doc.totalPages}p</span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDocumentRemove(doc.id);
                }}
                className="opacity-0 group-hover:opacity-100 p-1 hover:bg-destructive/10 rounded transition-all"
              >
                <X className="w-3 h-3 text-destructive" />
              </button>
              {activeDocumentId === doc.id && (
                <ChevronRight className="w-4 h-4 text-primary" />
              )}
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
