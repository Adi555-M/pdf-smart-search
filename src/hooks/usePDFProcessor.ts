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
  const [documents, setDocuments] = useState<PDFDocument[]>([]);
  const [currentProcessingFile, setCurrentProcessingFile] = useState<string>("");

  const extractTextFromPage = async (
    pdfDoc: any,
    pageNum: number
  ): Promise<{ text: string; lines: string[] }> => {
    const page = await pdfDoc.getPage(pageNum);
    const textContent = await page.getTextContent();
    
    // Group text items by their vertical position (y coordinate) to detect actual lines
    const lineMap = new Map<number, { x: number; text: string }[]>();
    const tolerance = 3; // Tighter tolerance for better line accuracy
    
    textContent.items.forEach((item: any) => {
      if (!item.str.trim()) return;
      
      const y = Math.round(item.transform[5] / tolerance) * tolerance;
      const x = item.transform[4];
      
      if (!lineMap.has(y)) {
        lineMap.set(y, []);
      }
      lineMap.get(y)!.push({ x, text: item.str });
    });
    
    // Sort by Y position (descending - PDF coordinates start from bottom)
    const sortedYPositions = Array.from(lineMap.keys()).sort((a, b) => b - a);
    
    // For each line, sort by X position (left to right) and join
    const lines = sortedYPositions.map(y => {
      const lineItems = lineMap.get(y)!.sort((a, b) => a.x - b.x);
      return lineItems.map(item => item.text).join(' ').trim();
    }).filter(line => line);
    
    const text = lines.join('\n');
    
    // If text is empty or very short, it might be a scanned PDF - use OCR
    if (text.trim().length < 50) {
      return await extractTextWithOCR(page);
    }
    
    return { text, lines };
  };

  const extractTextWithOCR = async (page: any): Promise<{ text: string; lines: string[] }> => {
    const scale = 2.5; // Higher scale for better OCR accuracy
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
      logger: () => {},
    });

    const text = result.data.text;
    // Split OCR text by actual newlines
    const lines = text.split('\n').map(line => line.trim()).filter(line => line);
    
    return { text, lines };
  };

  const processFiles = useCallback(async (files: File[]) => {
    setIsProcessing(true);
    setProgress(0);
    
    const newDocuments: PDFDocument[] = [];
    const totalFiles = files.length;
    
    try {
      for (let fileIndex = 0; fileIndex < files.length; fileIndex++) {
        const file = files[fileIndex];
        setCurrentProcessingFile(file.name);
        
        const arrayBuffer = await file.arrayBuffer();
        const pdfDoc = await getDocument({ data: arrayBuffer }).promise;
        const totalPages = pdfDoc.numPages;
        const pages: PageContent[] = [];

        for (let i = 1; i <= totalPages; i++) {
          const { text, lines } = await extractTextFromPage(pdfDoc, i);
          
          pages.push({
            pageNumber: i,
            text,
            lines,
          });

          // Progress calculation: (completed files + current page progress) / total files
          const fileProgress = (fileIndex / totalFiles) * 100;
          const pageProgress = ((i / totalPages) * 100) / totalFiles;
          setProgress(Math.round(fileProgress + pageProgress));
        }

        const doc: PDFDocument = {
          id: `${file.name}-${Date.now()}-${fileIndex}`,
          file,
          name: file.name,
          pages,
          totalPages,
        };

        newDocuments.push(doc);
      }

      setDocuments(prev => [...prev, ...newDocuments]);
      toast.success(`Successfully processed ${files.length} file(s)!`);
    } catch (error) {
      console.error("Error processing PDF:", error);
      toast.error("Failed to process PDF. Please try again.");
    } finally {
      setIsProcessing(false);
      setProgress(0);
      setCurrentProcessingFile("");
    }
  }, []);

  const searchDocuments = useCallback(
    (searchTerm: string): SearchResult[] => {
      if (documents.length === 0 || !searchTerm.trim()) return [];

      const results: SearchResult[] = [];
      const term = searchTerm.toLowerCase();

      documents.forEach((doc) => {
        doc.pages.forEach((page) => {
          page.lines.forEach((line, lineIndex) => {
            if (line.toLowerCase().includes(term)) {
              const matchIndex = line.toLowerCase().indexOf(term);
              results.push({
                documentId: doc.id,
                documentName: doc.name,
                pageNumber: page.pageNumber,
                lineNumber: lineIndex + 1,
                lineText: line,
                matchIndex,
                selected: false,
              });
            }
          });
        });
      });

      return results;
    },
    [documents]
  );

  const getDocumentById = useCallback((id: string) => {
    return documents.find(doc => doc.id === id);
  }, [documents]);

  const removeDocument = useCallback((id: string) => {
    setDocuments(prev => prev.filter(doc => doc.id !== id));
  }, []);

  const clearAllDocuments = useCallback(() => {
    setDocuments([]);
  }, []);

  return {
    isProcessing,
    progress,
    currentProcessingFile,
    documents,
    processFiles,
    searchDocuments,
    getDocumentById,
    removeDocument,
    clearAllDocuments,
  };
}
