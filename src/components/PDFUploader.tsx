import { useCallback, useState } from "react";
import { Upload, FileText, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface PDFUploaderProps {
  onFileSelect: (file: File) => void;
  isProcessing: boolean;
}

export function PDFUploader({ onFileSelect, isProcessing }: PDFUploaderProps) {
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
      const file = e.dataTransfer.files[0];
      if (file && file.type === "application/pdf") {
        onFileSelect(file);
      }
    },
    [onFileSelect]
  );

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        onFileSelect(file);
      }
    },
    [onFileSelect]
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
              <p className="text-sm text-muted-foreground mt-1">Extracting text with OCR</p>
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
                {isDragging ? "Drop your PDF here" : "Upload a PDF document"}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Drag and drop or click to browse • Supports scanned PDFs
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
