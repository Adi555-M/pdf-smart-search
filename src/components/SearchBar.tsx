import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  resultCount: number;
  disabled?: boolean;
}

export function SearchBar({ value, onChange, resultCount, disabled }: SearchBarProps) {
  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
      <Input
        type="text"
        placeholder="Search..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className="pl-9 pr-16 h-10 text-sm rounded-lg bg-background border-border focus:border-primary transition-all"
      />
      {value && (
        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
          <span className="text-xs text-muted-foreground tabular-nums">
            {resultCount}
          </span>
          <button
            onClick={() => onChange("")}
            className="p-1 rounded hover:bg-muted transition-colors"
          >
            <X className="w-3.5 h-3.5 text-muted-foreground" />
          </button>
        </div>
      )}
    </div>
  );
}
