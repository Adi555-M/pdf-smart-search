import { useState, useMemo, useCallback } from "react";
import { FileSearch2, Plus } from "lucide-react";
import { PDFUploader } from "@/components/PDFUploader";
import { SearchBar } from "@/components/SearchBar";
import { SearchResults } from "@/components/SearchResults";
import { PDFViewer } from "@/components/PDFViewer";
import { DocumentList } from "@/components/DocumentList";
import { ProcessingProgress } from "@/components/ProcessingProgress";
import { ExportButton } from "@/components/ExportButton";
import { usePDFProcessor } from "@/hooks/usePDFProcessor";
import { Button } from "@/components/ui/button";

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

  const handleResultClick = (documentId: string, pageNumber: number) => {
    setActiveDocumentId(documentId);
    setCurrentPage(pageNumber);
  };

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
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-lg">
        <div className="container max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
              <FileSearch2 className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">PDF Search</h1>
              <p className="text-sm text-muted-foreground">Extract & search with OCR</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container max-w-7xl mx-auto px-4 py-8 flex-1">
        {documents.length === 0 ? (
          <div className="max-w-2xl mx-auto space-y-6 animate-fade-in-up">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-foreground mb-3">
                Search Any PDF Document
              </h2>
              <p className="text-lg text-muted-foreground max-w-md mx-auto">
                Upload PDFs, including scanned documents. We'll extract all text using OCR and make it searchable.
              </p>
            </div>
            
            <PDFUploader onFilesSelect={processFiles} isProcessing={isProcessing} currentFile={currentProcessingFile} />
            
            {isProcessing && (
              <div className="paper-card p-6">
                <ProcessingProgress progress={progress} />
              </div>
            )}

            {/* Features */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-12">
              {[
                { title: "Multi-File Upload", desc: "Upload multiple PDFs at once" },
                { title: "Smart Search", desc: "Find text across all documents" },
                { title: "Export Pages", desc: "Export selected pages as PDF" },
              ].map((feature, i) => (
                <div key={i} className="paper-card p-4 text-center">
                  <h3 className="font-semibold text-foreground">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fade-in-up">
            {/* Search Panel */}
            <div className="paper-card-lg overflow-hidden flex flex-col">
              <div className="p-4 border-b border-border flex items-center justify-between">
                <div>
                  <h2 className="font-semibold text-foreground">Documents & Search</h2>
                  <p className="text-sm text-muted-foreground">{documents.length} file(s) loaded</p>
                </div>
                <div className="flex gap-2">
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
                    <Button variant="outline" size="sm" className="gap-1" asChild>
                      <span>
                        <Plus className="w-4 h-4" />
                        Add
                      </span>
                    </Button>
                  </label>
                  <Button variant="ghost" size="sm" onClick={handleClearAll}>
                    Clear All
                  </Button>
                </div>
              </div>
              
              <div className="p-4 space-y-4 flex-1 flex flex-col min-h-0">
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
                  <div className="paper-card p-4">
                    <ProcessingProgress progress={progress} />
                    {currentProcessingFile && (
                      <p className="text-xs text-muted-foreground mt-2 truncate">{currentProcessingFile}</p>
                    )}
                  </div>
                )}

                <SearchBar
                  value={searchTerm}
                  onChange={setSearchTerm}
                  resultCount={searchResults.length}
                />

                <div className="flex items-center justify-between">
                  <ExportButton 
                    selectedResults={selectedResults}
                    results={searchResults}
                    documents={documents}
                  />
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

            {/* PDF Viewer */}
            <div className="paper-card-lg overflow-hidden h-[calc(100vh-180px)] lg:sticky lg:top-24">
              {activeDocument ? (
                <PDFViewer
                  file={activeDocument.file}
                  currentPage={currentPage}
                  onPageChange={setCurrentPage}
                  totalPages={activeDocument.totalPages}
                />
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  Select a document to view
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-card/50 mt-auto">
        <div className="container max-w-7xl mx-auto px-4 py-4">
          <div className="flex flex-col items-center gap-2">
            <p className="text-sm text-muted-foreground">
              Made by <span className="font-semibold text-foreground">Mr.Marb</span>
            </p>
            <p className="text-xs text-muted-foreground/70 text-center max-w-md">
              Note: Line numbers are estimates based on text extraction.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
