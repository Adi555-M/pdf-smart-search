import { useCallback, useState } from "react";
import { Upload, FileText, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface PDFUploaderProps {
  onFilesSelect: (files: File[]) => void;
  isProcessing: boolean;
  currentFile?: string;
}

export function PDFUploader({ onFilesSelect, isProcessing, currentFile }: PDFUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const files = Array.from(e.dataTransfer.files).filter(
        file => file.type === "application/pdf"
      );
      if (files.length > 0) {
        onFilesSelect(files);
      }
    },
    [onFilesSelect]
  );

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files || []);
      if (files.length > 0) {
        onFilesSelect(files);
      }
      // Reset input so same files can be selected again
      e.target.value = '';
    },
    [onFilesSelect]
  );

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={cn(
        "relative flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-2xl transition-all duration-300 cursor-pointer group",
        isDragging
          ? "border-primary bg-primary/5 scale-[1.02]"
          : "border-border hover:border-primary/50 hover:bg-secondary/50",
        isProcessing && "pointer-events-none opacity-60"
      )}
    >
      <input
        type="file"
        accept="application/pdf"
        multiple
        onChange={handleFileInput}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        disabled={isProcessing}
      />
      
      <div className="flex flex-col items-center gap-4 pointer-events-none">
        {isProcessing ? (
          <>
            <div className="relative">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
              </div>
            </div>
            <div className="text-center">
              <p className="text-lg font-medium text-foreground">Processing PDF...</p>
              {currentFile && (
                <p className="text-sm text-muted-foreground mt-1 max-w-xs truncate">{currentFile}</p>
              )}
            </div>
          </>
        ) : (
          <>
            <div className="relative">
              <div className={cn(
                "w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-300",
                isDragging ? "bg-primary text-primary-foreground scale-110" : "bg-secondary text-secondary-foreground group-hover:bg-primary/10"
              )}>
                {isDragging ? (
                  <FileText className="w-8 h-8" />
                ) : (
                  <Upload className="w-8 h-8" />
                )}
              </div>
            </div>
            <div className="text-center">
              <p className="text-lg font-medium text-foreground">
                {isDragging ? "Drop your PDFs here" : "Upload PDF documents"}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Drag and drop or click to browse • Select multiple files
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
