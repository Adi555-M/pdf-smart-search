import { FileText } from "lucide-react";
import { SearchResult } from "@/types/pdf";

interface SearchResultsProps {
  results: SearchResult[];
  searchTerm: string;
  onResultClick: (pageNumber: number) => void;
}

function highlightText(text: string, searchTerm: string): React.ReactNode {
  if (!searchTerm.trim()) return text;
  
  const regex = new RegExp(`(${searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
  const parts = text.split(regex);
  
  return parts.map((part, index) => 
    regex.test(part) ? (
      <mark key={index} className="highlight-text font-bold">
        {part}
      </mark>
    ) : (
      <span key={index}>{part}</span>
    )
  );
}

export function SearchResults({ results, searchTerm, onResultClick }: SearchResultsProps) {
  if (results.length === 0 && searchTerm) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
          <FileText className="w-8 h-8 text-muted-foreground" />
        </div>
        <p className="text-lg font-medium text-foreground">No results found</p>
        <p className="text-sm text-muted-foreground mt-1">
          Try a different search term
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2 overflow-y-auto scrollbar-thin max-h-[calc(100vh-400px)]">
      {results.map((result, index) => (
        <button
          key={`${result.pageNumber}-${result.lineNumber}-${index}`}
          onClick={() => onResultClick(result.pageNumber)}
          className="search-result-line w-full text-left bg-card border border-border hover:border-primary/30"
        >
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 flex items-center gap-2 pt-0.5">
              <span className="inline-flex items-center justify-center h-6 px-2.5 rounded-md bg-primary/10 text-primary text-xs font-semibold">
                Page {result.pageNumber}
              </span>
              <span className="text-xs text-muted-foreground">
                Line {result.lineNumber}
              </span>
            </div>
          </div>
          <p className="mt-2 text-sm text-secondary-foreground leading-relaxed line-clamp-2">
            {highlightText(result.lineText, searchTerm)}
          </p>
        </button>
      ))}
    </div>
  );
}
