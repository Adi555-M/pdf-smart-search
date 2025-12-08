import { useState, useEffect } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import "react-pdf/dist/esm/Page/AnnotationLayer.css";
import "react-pdf/dist/esm/Page/TextLayer.css";

// Set up the worker
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface PDFViewerProps {
  file: File;
  currentPage: number;
  onPageChange: (page: number) => void;
  totalPages: number;
  searchTerm?: string;
}

export function PDFViewer({ file, currentPage, onPageChange, totalPages, searchTerm }: PDFViewerProps) {
  const [scale, setScale] = useState(1.0);
  const [fileUrl, setFileUrl] = useState<string | null>(null);

  useEffect(() => {
    const url = URL.createObjectURL(file);
    setFileUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  // Highlight search term in PDF text layer
  useEffect(() => {
    if (!searchTerm?.trim()) {
      // Remove existing highlights
      document.querySelectorAll('.pdf-highlight').forEach(el => {
        const parent = el.parentNode;
        if (parent) {
          parent.replaceChild(document.createTextNode(el.textContent || ''), el);
          parent.normalize();
        }
      });
      return;
    }

    const highlightText = () => {
      const textLayer = document.querySelector('.react-pdf__Page__textContent');
      if (!textLayer) return;

      const spans = textLayer.querySelectorAll('span');
      const regex = new RegExp(`(${searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');

      spans.forEach((span) => {
        const text = span.textContent || '';
        if (regex.test(text)) {
          const highlighted = text.replace(regex, '<mark class="pdf-highlight">$1</mark>');
          span.innerHTML = highlighted;
        }
      });
    };

    // Small delay to ensure text layer is rendered
    const timer = setTimeout(highlightText, 300);
    return () => clearTimeout(timer);
  }, [searchTerm, currentPage]);

  const goToPreviousPage = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  };

  const zoomIn = () => setScale((s) => Math.min(s + 0.25, 3));
  const zoomOut = () => setScale((s) => Math.max(s - 0.25, 0.5));

  if (!fileUrl) return null;

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="flex items-center justify-between p-3 border-b border-border bg-card/50 backdrop-blur-sm rounded-t-xl">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={goToPreviousPage}
            disabled={currentPage <= 1}
            className="h-9 w-9 rounded-lg"
          >
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <span className="text-sm font-medium text-foreground min-w-[100px] text-center">
            Page {currentPage} of {totalPages}
          </span>
          <Button
            variant="ghost"
            size="icon"
            onClick={goToNextPage}
            disabled={currentPage >= totalPages}
            className="h-9 w-9 rounded-lg"
          >
            <ChevronRight className="w-5 h-5" />
          </Button>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={zoomOut}
            disabled={scale <= 0.5}
            className="h-9 w-9 rounded-lg"
          >
            <ZoomOut className="w-5 h-5" />
          </Button>
          <span className="text-sm font-medium text-muted-foreground min-w-[60px] text-center">
            {Math.round(scale * 100)}%
          </span>
          <Button
            variant="ghost"
            size="icon"
            onClick={zoomIn}
            disabled={scale >= 3}
            className="h-9 w-9 rounded-lg"
          >
            <ZoomIn className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* PDF Content */}
      <div className="flex-1 overflow-auto p-6 bg-muted/30 scrollbar-thin flex justify-center">
        <Document
          file={fileUrl}
          loading={
            <div className="flex items-center justify-center h-64">
              <div className="text-muted-foreground">Loading PDF...</div>
            </div>
          }
          error={
            <div className="flex items-center justify-center h-64">
              <div className="text-destructive">Failed to load PDF</div>
            </div>
          }
        >
          <Page
            pageNumber={currentPage}
            scale={scale}
            className="shadow-paper-lg rounded-lg overflow-hidden"
            renderTextLayer={true}
            renderAnnotationLayer={true}
          />
        </Document>
      </div>
    </div>
  );
}
