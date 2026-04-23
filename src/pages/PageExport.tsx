import { useState, useEffect, useCallback } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import { FileSearch2, Upload, Download, Check, ChevronLeft, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PDFDocument as PDFLibDocument } from "pdf-lib";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import "react-pdf/dist/esm/Page/AnnotationLayer.css";
import "react-pdf/dist/esm/Page/TextLayer.css";

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

const PageExport = () => {
  const navigate = useNavigate();
  const [file, setFile] = useState<File | null>(null);
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [totalPages, setTotalPages] = useState(0);
  const [selectedPages, setSelectedPages] = useState<Set<number>>(new Set());
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    if (file) {
      const url = URL.createObjectURL(file);
      setFileUrl(url);
      return () => URL.revokeObjectURL(url);
    }
  }, [file]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f && f.type === "application/pdf") {
      setFile(f);
      setSelectedPages(new Set());
      setTotalPages(0);
    }
    e.target.value = "";
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const f = e.dataTransfer.files[0];
    if (f && f.type === "application/pdf") {
      setFile(f);
      setSelectedPages(new Set());
      setTotalPages(0);
    }
  }, []);

  const togglePage = (pageNum: number) => {
    setSelectedPages(prev => {
      const next = new Set(prev);
      if (next.has(pageNum)) next.delete(pageNum);
      else next.add(pageNum);
      return next;
    });
  };

  const selectAll = () => {
    const all = new Set<number>();
    for (let i = 1; i <= totalPages; i++) all.add(i);
    setSelectedPages(all);
  };

  const deselectAll = () => setSelectedPages(new Set());

  const selectRange = (start: number, end: number) => {
    setSelectedPages(prev => {
      const next = new Set(prev);
      for (let i = start; i <= end; i++) next.add(i);
      return next;
    });
  };

  const handleExport = async () => {
    if (!file || selectedPages.size === 0) return;
    setIsExporting(true);
    try {
      const arrayBuffer = await file.arrayBuffer();
      const sourcePdf = await PDFLibDocument.load(arrayBuffer);
      const newPdf = await PDFLibDocument.create();
      const sorted = Array.from(selectedPages).sort((a, b) => a - b);
      for (const pageNum of sorted) {
        const [copied] = await newPdf.copyPages(sourcePdf, [pageNum - 1]);
        newPdf.addPage(copied);
      }
      const pdfBytes = await newPdf.save();
      const blob = new Blob([new Uint8Array(pdfBytes)], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      const baseName = file.name.replace(/\.pdf$/i, "");
      link.download = `${baseName}-selected-pages.pdf`;
      link.click();
      URL.revokeObjectURL(url);
      toast.success(`Exported ${sorted.length} pages successfully!`);
    } catch (error) {
      console.error("Export error:", error);
      toast.error("Failed to export PDF");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="h-screen bg-background flex flex-col overflow-hidden">
      {/* Header */}
      <header className="flex-shrink-0 border-b border-border bg-background/95 backdrop-blur-sm">
        <div className="px-4 py-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => navigate("/")}>
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <FileSearch2 className="w-4 h-4 text-primary-foreground" />
            </div>
            <h1 className="text-lg font-semibold text-foreground">Page Picker & Export</h1>
          </div>
          <div className="flex items-center gap-2">
            {file && (
              <>
                <Button variant="ghost" size="sm" className="h-8" onClick={() => { setFile(null); setFileUrl(null); setSelectedPages(new Set()); setTotalPages(0); }}>
                  <X className="w-3.5 h-3.5 mr-1" /> Clear
                </Button>
                <Button
                  onClick={handleExport}
                  disabled={selectedPages.size === 0 || isExporting}
                  size="sm"
                  className="h-8 gap-1.5"
                >
                  {isExporting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
                  Export {selectedPages.size > 0 && `(${selectedPages.size} pages)`}
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="flex-1 min-h-0 overflow-hidden">
        {!file ? (
          <div className="h-full flex items-center justify-center p-4">
            <label
              className="max-w-md w-full cursor-pointer"
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
            >
              <input type="file" accept="application/pdf" className="hidden" onChange={handleFileSelect} />
              <div className="border-2 border-dashed border-border rounded-xl p-12 text-center hover:border-primary/50 hover:bg-primary/5 transition-colors">
                <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <h2 className="text-lg font-semibold text-foreground mb-1">Upload a PDF</h2>
                <p className="text-sm text-muted-foreground">Select pages visually and export as a new PDF</p>
              </div>
            </label>
          </div>
        ) : (
          <div className="h-full flex flex-col">
            {/* Selection toolbar */}
            <div className="flex-shrink-0 px-4 py-2 border-b border-border bg-card/50 flex items-center gap-3 flex-wrap">
              <span className="text-sm text-muted-foreground">
                {totalPages} pages • {selectedPages.size} selected
              </span>
              <Button variant="outline" size="sm" className="h-7 text-xs" onClick={selectAll}>Select All</Button>
              <Button variant="outline" size="sm" className="h-7 text-xs" onClick={deselectAll}>Deselect All</Button>
              <div className="flex items-center gap-1">
                <RangeSelector totalPages={totalPages} onSelectRange={selectRange} />
              </div>
            </div>

            {/* Page thumbnails grid */}
            <div className="flex-1 overflow-auto p-4">
              {fileUrl && (
                <Document
                  file={fileUrl}
                  onLoadSuccess={({ numPages }) => setTotalPages(numPages)}
                  loading={<div className="text-sm text-muted-foreground text-center py-8">Loading PDF...</div>}
                >
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(pageNum => (
                      <div
                        key={pageNum}
                        onClick={() => togglePage(pageNum)}
                        className={`relative cursor-pointer rounded-lg border-2 transition-all overflow-hidden group ${
                          selectedPages.has(pageNum)
                            ? "border-primary shadow-md ring-2 ring-primary/20"
                            : "border-border hover:border-primary/40"
                        }`}
                      >
                        {/* Selection indicator */}
                        <div className={`absolute top-2 right-2 z-10 w-6 h-6 rounded-full flex items-center justify-center transition-all ${
                          selectedPages.has(pageNum)
                            ? "bg-primary text-primary-foreground"
                            : "bg-background/80 border border-border text-transparent group-hover:border-primary/50"
                        }`}>
                          <Check className="w-3.5 h-3.5" />
                        </div>
                        
                        {/* Page number */}
                        <div className="absolute bottom-0 left-0 right-0 bg-background/90 backdrop-blur-sm py-1 text-center z-10">
                          <span className="text-xs font-medium text-foreground">Page {pageNum}</span>
                        </div>

                        <Page
                          pageNumber={pageNum}
                          width={180}
                          renderTextLayer={false}
                          renderAnnotationLayer={false}
                          className="pointer-events-none"
                        />
                      </div>
                    ))}
                  </div>
                </Document>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="flex-shrink-0 border-t border-border bg-card/50 px-4 py-1.5">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>Made by <span className="font-medium text-foreground">Mr.Marb</span></span>
          <span className="opacity-70">Select pages and export as new PDF</span>
        </div>
      </footer>
    </div>
  );
};

// Range selector sub-component
function RangeSelector({ totalPages, onSelectRange }: { totalPages: number; onSelectRange: (s: number, e: number) => void }) {
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");

  const apply = () => {
    const s = parseInt(start);
    const e = parseInt(end);
    if (s >= 1 && e <= totalPages && s <= e) {
      onSelectRange(s, e);
      setStart("");
      setEnd("");
    } else {
      toast.error("Invalid page range");
    }
  };

  return (
    <div className="flex items-center gap-1">
      <input
        type="number"
        min={1}
        max={totalPages}
        placeholder="From"
        value={start}
        onChange={e => setStart(e.target.value)}
        className="w-14 h-7 text-xs rounded border border-border bg-background px-2 text-foreground"
      />
      <span className="text-xs text-muted-foreground">–</span>
      <input
        type="number"
        min={1}
        max={totalPages}
        placeholder="To"
        value={end}
        onChange={e => setEnd(e.target.value)}
        className="w-14 h-7 text-xs rounded border border-border bg-background px-2 text-foreground"
      />
      <Button variant="outline" size="sm" className="h-7 text-xs" onClick={apply}>Add Range</Button>
    </div>
  );
}

export default PageExport;
