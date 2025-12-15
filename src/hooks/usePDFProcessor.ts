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
    
    if (textContent.items.length === 0) {
      return await extractTextWithOCR(page);
    }
    
    // Extract all text items with their positions
    const textItems: { y: number; x: number; text: string; height: number }[] = [];
    
    textContent.items.forEach((item: any) => {
      if (!item.str || !item.str.trim()) return;
      textItems.push({
        y: item.transform[5],
        x: item.transform[4],
        text: item.str,
        height: item.height || 12, // Default font height
      });
    });
    
    if (textItems.length === 0) {
      return await extractTextWithOCR(page);
    }
    
    // Calculate average font height to determine line tolerance
    const avgHeight = textItems.reduce((sum, item) => sum + item.height, 0) / textItems.length;
    const lineTolerance = Math.max(avgHeight * 0.6, 2); // Use 60% of font height as tolerance
    
    // Sort items by Y position (descending - top to bottom)
    textItems.sort((a, b) => b.y - a.y);
    
    // Group items into lines based on Y proximity
    const lineGroups: { y: number; items: typeof textItems }[] = [];
    
    textItems.forEach(item => {
      // Find existing line group within tolerance
      const existingGroup = lineGroups.find(group => 
        Math.abs(group.y - item.y) <= lineTolerance
      );
      
      if (existingGroup) {
        existingGroup.items.push(item);
        // Update group Y to weighted average for better grouping
        existingGroup.y = (existingGroup.y + item.y) / 2;
      } else {
        lineGroups.push({ y: item.y, items: [item] });
      }
    });
    
    // Sort line groups by Y position (top to bottom)
    lineGroups.sort((a, b) => b.y - a.y);
    
    // Build lines by sorting each group's items by X position (left to right)
    const lines = lineGroups.map(group => {
      const sortedItems = group.items.sort((a, b) => a.x - b.x);
      return sortedItems.map(item => item.text).join(' ').trim();
    }).filter(line => line.length > 0);
    
    const text = lines.join('\n');
    
    // If text is too short, might be scanned - use OCR
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
