import { PDFDocument } from "@/types/pdf";
import { FileText, X } from "lucide-react";
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
  if (documents.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-1.5">
      {documents.map((doc) => (
        <button
          key={doc.id}
          onClick={() => onDocumentSelect(doc.id)}
          className={cn(
            "group flex items-center gap-1.5 px-2 py-1 rounded-md text-xs transition-all max-w-[160px]",
            activeDocumentId === doc.id
              ? "bg-primary text-primary-foreground shadow-sm"
              : "bg-muted/80 text-foreground hover:bg-muted"
          )}
        >
          <FileText className="w-3 h-3 flex-shrink-0" />
          <span className="truncate">{doc.name}</span>
          <span className={cn(
            "flex-shrink-0 tabular-nums",
            activeDocumentId === doc.id ? "text-primary-foreground/70" : "text-muted-foreground"
          )}>
            {doc.totalPages}p
          </span>
          <span
            role="button"
            onClick={(e) => {
              e.stopPropagation();
              onDocumentRemove(doc.id);
            }}
            className={cn(
              "flex-shrink-0 p-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive/20",
              activeDocumentId === doc.id ? "hover:bg-primary-foreground/20" : ""
            )}
          >
            <X className="w-3 h-3" />
          </span>
        </button>
      ))}
    </div>
  );
}
