import { SearchResult } from "@/types/pdf";
import { FileText, Check } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";

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
  if (!searchTerm) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center py-12">
        <FileText className="w-12 h-12 text-muted-foreground/30 mb-4" />
        <p className="text-muted-foreground">Enter a search term to find text in your documents</p>
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center py-12">
        <p className="text-muted-foreground">No results found for "{searchTerm}"</p>
      </div>
    );
  }

  const highlightMatch = (text: string, term: string) => {
    const regex = new RegExp(`(${term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    const parts = text.split(regex);
    
    return parts.map((part, index) => {
      if (part.toLowerCase() === term.toLowerCase()) {
        return (
          <mark key={index} className="bg-yellow-400 text-foreground font-bold px-0.5 rounded">
            {part}
          </mark>
        );
      }
      return part;
    });
  };

  const getResultKey = (result: SearchResult, index: number) => 
    `${result.documentId}-${result.pageNumber}-${result.lineNumber}-${index}`;

  return (
    <div className="flex flex-col h-full">
      {/* Selection controls */}
      <div className="flex items-center justify-between pb-3 border-b border-border mb-3">
        <span className="text-sm text-muted-foreground">
          {selectedResults.size} of {results.length} selected
        </span>
        <div className="flex gap-2">
          <button
            onClick={onSelectAll}
            className="text-xs text-primary hover:underline"
          >
            Select All
          </button>
          <span className="text-muted-foreground">|</span>
          <button
            onClick={onDeselectAll}
            className="text-xs text-primary hover:underline"
          >
            Deselect All
          </button>
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="space-y-2 pr-2">
          {results.map((result, index) => {
            const resultKey = getResultKey(result, index);
            const isSelected = selectedResults.has(resultKey);
            
            return (
              <div
                key={resultKey}
                className={cn(
                  "group p-3 rounded-lg border transition-all duration-200 cursor-pointer",
                  isSelected 
                    ? "border-primary bg-primary/5" 
                    : "border-border hover:border-primary/50 hover:bg-secondary/50"
                )}
              >
                <div className="flex items-start gap-3">
                  <div 
                    className="pt-0.5"
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleSelect(resultKey);
                    }}
                  >
                    <Checkbox 
                      checked={isSelected}
                      className="data-[state=checked]:bg-primary"
                    />
                  </div>
                  
                  <div 
                    className="flex-1 min-w-0"
                    onClick={() => onResultClick(result.documentId, result.pageNumber)}
                  >
                    <p className="text-sm text-foreground leading-relaxed break-words">
                      {highlightMatch(result.lineText, searchTerm)}
                    </p>
                    
                    <div className="flex flex-wrap items-center gap-2 mt-2">
                      <span className="text-xs text-muted-foreground truncate max-w-[150px]" title={result.documentName}>
                        📄 {result.documentName}
                      </span>
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                        Page {result.pageNumber}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        Line ~{result.lineNumber}
                      </span>
                    </div>
                  </div>

                  {isSelected && (
                    <Check className="w-4 h-4 text-primary flex-shrink-0" />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
}
