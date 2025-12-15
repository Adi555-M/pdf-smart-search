import { Download, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PDFDocument as PDFLibDocument, rgb } from "pdf-lib";
import { SearchResult, PDFDocument } from "@/types/pdf";
import { toast } from "sonner";
import { useState } from "react";

interface ExportButtonProps {
  selectedResults: Set<string>;
  results: SearchResult[];
  documents: PDFDocument[];
}

export function ExportButton({ selectedResults, results, documents }: ExportButtonProps) {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    if (selectedResults.size === 0) {
      toast.error("Please select at least one result to export");
      return;
    }

    setIsExporting(true);

    try {
      // Group selected results by document
      const selectedByDoc = new Map<string, Set<number>>();
      
      results.forEach((result, index) => {
        const key = `${result.documentId}-${result.pageNumber}-${result.lineNumber}-${index}`;
        if (selectedResults.has(key)) {
          if (!selectedByDoc.has(result.documentId)) {
            selectedByDoc.set(result.documentId, new Set());
          }
          selectedByDoc.get(result.documentId)!.add(result.pageNumber);
        }
      });

      // Create merged PDF
      const mergedPdf = await PDFLibDocument.create();

      for (const [docId, pageNumbers] of selectedByDoc) {
        const doc = documents.find(d => d.id === docId);
        if (!doc) continue;

        const arrayBuffer = await doc.file.arrayBuffer();
        const sourcePdf = await PDFLibDocument.load(arrayBuffer);

        const sortedPages = Array.from(pageNumbers).sort((a, b) => a - b);
        
        for (const pageNum of sortedPages) {
          const [copiedPage] = await mergedPdf.copyPages(sourcePdf, [pageNum - 1]);
          mergedPdf.addPage(copiedPage);
        }
      }

      const pdfBytes = await mergedPdf.save();
      const blob = new Blob([new Uint8Array(pdfBytes)], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = `exported-pages-${Date.now()}.pdf`;
      link.click();

      URL.revokeObjectURL(url);
      toast.success(`Exported ${mergedPdf.getPageCount()} pages successfully!`);
    } catch (error) {
      console.error("Export error:", error);
      toast.error("Failed to export PDF");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Button
      onClick={handleExport}
      disabled={selectedResults.size === 0 || isExporting}
      size="sm"
      className="h-8 gap-1.5 text-xs"
      variant={selectedResults.size > 0 ? "default" : "outline"}
    >
      {isExporting ? (
        <Loader2 className="w-3.5 h-3.5 animate-spin" />
      ) : (
        <Download className="w-3.5 h-3.5" />
      )}
      Export {selectedResults.size > 0 && `(${selectedResults.size})`}
    </Button>
  );
}
