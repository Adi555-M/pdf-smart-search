import { useState, useMemo, useCallback } from "react";
import { FileSearch2, Plus, GripVertical } from "lucide-react";
import { PDFUploader } from "@/components/PDFUploader";
import { SearchBar } from "@/components/SearchBar";
import { SearchResults } from "@/components/SearchResults";
import { PDFViewer } from "@/components/PDFViewer";
import { DocumentList } from "@/components/DocumentList";
import { ProcessingProgress } from "@/components/ProcessingProgress";
import { ExportButton } from "@/components/ExportButton";
import { usePDFProcessor } from "@/hooks/usePDFProcessor";
import { Button } from "@/components/ui/button";
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from "@/components/ui/resizable";

const Index = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [activeDocumentId, setActiveDocumentId] = useState<string | null>(null);
  const [selectedResults, setSelectedResults] = useState<Set<string>>(new Set());
  
  const { 
    isProcessing, 
    progress, 
    currentProcessingFile,
    documents, 
    processFiles, 
    searchDocuments, 
    getDocumentById,
    removeDocument,
    clearAllDocuments 
  } = usePDFProcessor();

  const searchResults = useMemo(() => {
    return searchDocuments(searchTerm);
  }, [searchDocuments, searchTerm]);

  const activeDocument = activeDocumentId ? getDocumentById(activeDocumentId) : documents[0] || null;

  const handleResultClick = useCallback((documentId: string, pageNumber: number) => {
    setActiveDocumentId(documentId);
    setCurrentPage(pageNumber);
  }, []);

  const handleClearAll = () => {
    clearAllDocuments();
    setSearchTerm("");
    setCurrentPage(1);
    setActiveDocumentId(null);
    setSelectedResults(new Set());
  };

  const handleToggleSelect = useCallback((resultKey: string) => {
    setSelectedResults(prev => {
      const next = new Set(prev);
      if (next.has(resultKey)) {
        next.delete(resultKey);
      } else {
        next.add(resultKey);
      }
      return next;
    });
  }, []);

  const handleSelectAll = useCallback(() => {
    const allKeys = searchResults.map((r, i) => 
      `${r.documentId}-${r.pageNumber}-${r.lineNumber}-${i}`
    );
    setSelectedResults(new Set(allKeys));
  }, [searchResults]);

  const handleDeselectAll = useCallback(() => {
    setSelectedResults(new Set());
  }, []);

  return (
    <div className="h-screen bg-background flex flex-col overflow-hidden">
      {/* Compact Header */}
      <header className="flex-shrink-0 border-b border-border bg-background/95 backdrop-blur-sm">
        <div className="px-4 py-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <FileSearch2 className="w-4 h-4 text-primary-foreground" />
            </div>
            <h1 className="text-lg font-semibold text-foreground">PDF Search</h1>
          </div>
          {documents.length > 0 && (
            <div className="flex items-center gap-2">
              <label className="cursor-pointer">
                <input
                  type="file"
                  accept="application/pdf"
                  multiple
                  className="hidden"
                  onChange={(e) => {
                    const files = Array.from(e.target.files || []);
                    if (files.length > 0) processFiles(files);
                    e.target.value = '';
                  }}
                />
                <Button variant="outline" size="sm" className="h-8 gap-1" asChild>
                  <span>
                    <Plus className="w-3.5 h-3.5" />
                    Add PDF
                  </span>
                </Button>
              </label>
              <Button variant="ghost" size="sm" className="h-8" onClick={handleClearAll}>
                Clear
              </Button>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 min-h-0">
        {documents.length === 0 ? (
          <div className="h-full flex items-center justify-center p-4">
            <div className="max-w-xl w-full space-y-6 animate-fade-in">
              <div className="text-center">
                <h2 className="text-2xl font-bold text-foreground mb-2">
                  Find Pages from Long Files Easily
                </h2>
                <p className="text-lg text-primary/80 font-medium mb-1">
                  Search & Export with One Click
                </p>
                <p className="text-muted-foreground">
                  Upload PDFs including scanned documents. Text will be extracted using OCR.
                </p>
              </div>
              
              <PDFUploader onFilesSelect={processFiles} isProcessing={isProcessing} currentFile={currentProcessingFile} />
              
              {isProcessing && (
                <div className="bg-card border border-border rounded-lg p-4">
                  <ProcessingProgress progress={progress} />
                </div>
              )}

              <div className="grid grid-cols-3 gap-3 pt-4">
                {[
                  { title: "Multi-File", desc: "Upload many PDFs" },
                  { title: "Smart Search", desc: "Find across all" },
                  { title: "Export", desc: "Selected pages" },
                ].map((feature, i) => (
                  <div key={i} className="bg-card/50 border border-border/50 rounded-lg p-3 text-center">
                    <h3 className="font-medium text-foreground text-sm">{feature.title}</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">{feature.desc}</p>
                  </div>
                ))}
              </div>

              <div className="text-center pt-2">
                <p className="text-xs text-muted-foreground/70">
                  📁 All uploaded files are processed locally. You retain full rights to your documents.
                </p>
              </div>
            </div>
          </div>
        ) : (
          <ResizablePanelGroup direction="horizontal" className="h-full">
            {/* Search Panel */}
            <ResizablePanel defaultSize={40} minSize={25} maxSize={60}>
              <div className="h-full flex flex-col bg-card/30">
                {/* Document List */}
                <div className="flex-shrink-0 p-3 border-b border-border">
                  <DocumentList 
                    documents={documents}
                    activeDocumentId={activeDocument?.id || null}
                    onDocumentSelect={(id) => {
                      setActiveDocumentId(id);
                      setCurrentPage(1);
                    }}
                    onDocumentRemove={removeDocument}
                  />
                  {isProcessing && (
                    <div className="mt-2 p-2 bg-background rounded border border-border">
                      <ProcessingProgress progress={progress} />
                      {currentProcessingFile && (
                        <p className="text-xs text-muted-foreground mt-1 truncate">{currentProcessingFile}</p>
                      )}
                    </div>
                  )}
                </div>

                {/* Search & Results */}
                <div className="flex-1 min-h-0 flex flex-col p-3 gap-3">
                  <SearchBar
                    value={searchTerm}
                    onChange={setSearchTerm}
                    resultCount={searchResults.length}
                  />

                  <div className="flex items-center gap-2">
                    <ExportButton 
                      selectedResults={selectedResults}
                      results={searchResults}
                      documents={documents}
                    />
                    <span className="text-xs text-muted-foreground">
                      {selectedResults.size > 0 && `${selectedResults.size} selected`}
                    </span>
                  </div>
                  
                  <div className="flex-1 min-h-0">
                    <SearchResults
                      results={searchResults}
                      searchTerm={searchTerm}
                      onResultClick={handleResultClick}
                      selectedResults={selectedResults}
                      onToggleSelect={handleToggleSelect}
                      onSelectAll={handleSelectAll}
                      onDeselectAll={handleDeselectAll}
                    />
                  </div>
                </div>
              </div>
            </ResizablePanel>

            {/* Resize Handle */}
            <ResizableHandle withHandle className="w-1.5 bg-border/50 hover:bg-primary/30 transition-colors">
              <div className="h-full flex items-center justify-center">
                <GripVertical className="w-3 h-3 text-muted-foreground" />
              </div>
            </ResizableHandle>

            {/* PDF Viewer Panel */}
            <ResizablePanel defaultSize={60} minSize={30}>
              <div className="h-full bg-muted/20">
                {activeDocument ? (
                  <PDFViewer
                    file={activeDocument.file}
                    currentPage={currentPage}
                    onPageChange={setCurrentPage}
                    totalPages={activeDocument.totalPages}
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center text-muted-foreground">
                      <FileSearch2 className="w-12 h-12 mx-auto mb-2 opacity-30" />
                      <p>Select a document or search result</p>
                    </div>
                  </div>
                )}
              </div>
            </ResizablePanel>
          </ResizablePanelGroup>
        )}
      </main>

      {/* Compact Footer */}
      <footer className="flex-shrink-0 border-t border-border bg-card/50 px-4 py-1.5">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>Made by <span className="font-medium text-foreground">Mr.Marb</span></span>
          <span className="opacity-70">Line numbers based on PDF text structure</span>
        </div>
      </footer>
    </div>
  );
};

export default Index;
