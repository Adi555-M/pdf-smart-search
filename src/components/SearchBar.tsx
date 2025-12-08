import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  resultCount: number;
  disabled?: boolean;
}

export function SearchBar({ value, onChange, resultCount, disabled }: SearchBarProps) {
  return (
    <div className="relative">
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Search in document..."
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          className="pl-12 pr-20 h-14 text-base rounded-xl bg-card border-border focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
        />
        {value && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
            <span className="text-sm text-muted-foreground font-medium">
              {resultCount} {resultCount === 1 ? "result" : "results"}
            </span>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onChange("")}
              className="h-8 w-8 rounded-lg hover:bg-secondary"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
