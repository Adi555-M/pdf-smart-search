import { SearchResult } from "@/types/pdf";
import { FileText, Check, Eye } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { useCallback } from "react";

interface SearchResultsProps {
  results: SearchResult[];
  searchTerm: string;
  onResultClick: (documentId: string, pageNumber: number) => void;
  selectedResults: Set<string>;
  onToggleSelect: (resultKey: string) => void;
  onSelectAll: () => void;
  onDeselectAll: () => void;
}

export function SearchResults({
  results,
  searchTerm,
  onResultClick,
  selectedResults,
  onToggleSelect,
  onSelectAll,
  onDeselectAll,
}: SearchResultsProps) {
  const getResultKey = useCallback((result: SearchResult, index: number) => 
    `${result.documentId}-${result.pageNumber}-${result.lineNumber}-${index}`, []);

  const highlightMatch = useCallback((text: string, term: string) => {
    const regex = new RegExp(`(${term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    const parts = text.split(regex);
    
    return parts.map((part, index) => {
      if (part.toLowerCase() === term.toLowerCase()) {
        return (
          <mark key={index} className="bg-yellow-400/80 text-foreground font-semibold px-0.5 rounded-sm">
            {part}
          </mark>
        );
      }
      return part;
    });
  }, []);

  if (!searchTerm) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center py-8">
        <FileText className="w-10 h-10 text-muted-foreground/20 mb-3" />
        <p className="text-sm text-muted-foreground">Search to find text in documents</p>
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center py-8">
        <p className="text-sm text-muted-foreground">No results for "{searchTerm}"</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Compact Selection controls */}
      <div className="flex items-center justify-between pb-2 mb-2 border-b border-border/50">
        <span className="text-xs text-muted-foreground">
          {results.length} result{results.length !== 1 && 's'}
        </span>
        <div className="flex gap-1.5">
          <button
            onClick={onSelectAll}
            className="text-xs px-2 py-0.5 rounded bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
          >
            All
          </button>
          <button
            onClick={onDeselectAll}
            className="text-xs px-2 py-0.5 rounded bg-muted text-muted-foreground hover:bg-muted/80 transition-colors"
          >
            None
          </button>
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="space-y-1.5 pr-1">
          {results.map((result, index) => {
            const resultKey = getResultKey(result, index);
            const isSelected = selectedResults.has(resultKey);
            
            return (
              <div
                key={resultKey}
                className={cn(
                  "group relative rounded-lg border transition-all duration-150",
                  isSelected 
                    ? "border-primary/60 bg-primary/5 shadow-sm" 
                    : "border-transparent bg-background hover:bg-muted/50"
                )}
              >
                {/* Selection indicator bar */}
                <div className={cn(
                  "absolute left-0 top-0 bottom-0 w-1 rounded-l-lg transition-colors",
                  isSelected ? "bg-primary" : "bg-transparent group-hover:bg-border"
                )} />
                
                <div className="flex items-start gap-2 p-2 pl-3">
                  {/* Checkbox area - click to select */}
                  <button
                    onClick={() => onToggleSelect(resultKey)}
                    className={cn(
                      "flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center mt-0.5 transition-all",
                      isSelected 
                        ? "bg-primary border-primary" 
                        : "border-muted-foreground/30 hover:border-primary/50"
                    )}
                  >
                    {isSelected && <Check className="w-3 h-3 text-primary-foreground" />}
                  </button>
                  
                  {/* Content area - click to view */}
                  <div 
                    className="flex-1 min-w-0 cursor-pointer"
                    onClick={() => onResultClick(result.documentId, result.pageNumber)}
                  >
                    <p className="text-sm text-foreground leading-snug break-words line-clamp-2">
                      {highlightMatch(result.lineText, searchTerm)}
                    </p>
                    
                    <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                      <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-primary/10 text-primary">
                        P{result.pageNumber}
                      </span>
                      <span className="text-[10px] text-muted-foreground">
                        ~L{result.lineNumber}
                      </span>
                      <span className="text-[10px] text-muted-foreground/70 truncate max-w-[100px]" title={result.documentName}>
                        {result.documentName}
                      </span>
                    </div>
                  </div>

                  {/* View button */}
                  <button
                    onClick={() => onResultClick(result.documentId, result.pageNumber)}
                    className="flex-shrink-0 p-1.5 rounded-md opacity-0 group-hover:opacity-100 hover:bg-muted transition-all"
                    title="View in PDF"
                  >
                    <Eye className="w-3.5 h-3.5 text-muted-foreground" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
}
