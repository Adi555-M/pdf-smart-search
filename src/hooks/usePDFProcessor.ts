import { useState, useCallback } from "react";
import { getDocument, GlobalWorkerOptions } from "pdfjs-dist";
import Tesseract from "tesseract.js";
import { PageContent, PDFDocument, SearchResult } from "@/types/pdf";
import { toast } from "sonner";

// Set up the worker for pdfjs-dist
GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@4.4.168/build/pdf.worker.min.mjs`;

export function usePDFProcessor() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [document, setDocument] = useState<PDFDocument | null>(null);

  const extractTextFromPage = async (
    pdfDoc: any,
    pageNum: number
  ): Promise<string> => {
    const page = await pdfDoc.getPage(pageNum);
    const textContent = await page.getTextContent();
    const text = textContent.items
      .map((item: any) => item.str)
      .join(" ");
    
    // If text is empty or very short, it might be a scanned PDF - use OCR
    if (text.trim().length < 50) {
      return await extractTextWithOCR(page);
    }
    
    return text;
  };

  const extractTextWithOCR = async (page: any): Promise<string> => {
    const scale = 2.0; // Higher scale for better OCR accuracy
    const viewport = page.getViewport({ scale });
    
    const canvas = window.document.createElement("canvas");
    const context = canvas.getContext("2d")!;
    canvas.height = viewport.height;
    canvas.width = viewport.width;

    await page.render({
      canvasContext: context,
      viewport: viewport,
    }).promise;

    const imageData = canvas.toDataURL("image/png");
    
    const result = await Tesseract.recognize(imageData, "eng", {
      logger: () => {}, // Suppress logs
    });

    return result.data.text;
  };

  const processFile = useCallback(async (file: File) => {
    setIsProcessing(true);
    setProgress(0);
    
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await getDocument({ data: arrayBuffer }).promise;
      const totalPages = pdfDoc.numPages;
      const pages: PageContent[] = [];

      toast.info(`Processing ${totalPages} pages...`);

      for (let i = 1; i <= totalPages; i++) {
        const text = await extractTextFromPage(pdfDoc, i);
        const lines = text.split(/\n|(?<=\.)\s+|(?<=\?)\s+|(?<=!)\s+/).filter(line => line.trim());
        
        pages.push({
          pageNumber: i,
          text,
          lines,
        });

        setProgress(Math.round((i / totalPages) * 100));
      }

      const doc: PDFDocument = {
        file,
        name: file.name,
        pages,
        totalPages,
      };

      setDocument(doc);
      toast.success(`Successfully processed ${totalPages} pages!`);
    } catch (error) {
      console.error("Error processing PDF:", error);
      toast.error("Failed to process PDF. Please try again.");
    } finally {
      setIsProcessing(false);
      setProgress(0);
    }
  }, []);

  const searchDocument = useCallback(
    (searchTerm: string): SearchResult[] => {
      if (!document || !searchTerm.trim()) return [];

      const results: SearchResult[] = [];
      const term = searchTerm.toLowerCase();

      document.pages.forEach((page) => {
        page.lines.forEach((line, lineIndex) => {
          if (line.toLowerCase().includes(term)) {
            const matchIndex = line.toLowerCase().indexOf(term);
            results.push({
              pageNumber: page.pageNumber,
              lineNumber: lineIndex + 1,
              lineText: line,
              matchIndex,
            });
          }
        });
      });

      return results;
    },
    [document]
  );

  const clearDocument = useCallback(() => {
    setDocument(null);
  }, []);

  return {
    isProcessing,
    progress,
    document,
    processFile,
    searchDocument,
    clearDocument,
  };
}
