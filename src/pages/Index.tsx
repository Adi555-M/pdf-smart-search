import { useState, useMemo } from "react";
import { FileSearch2 } from "lucide-react";
import { PDFUploader } from "@/components/PDFUploader";
import { SearchBar } from "@/components/SearchBar";
import { SearchResults } from "@/components/SearchResults";
import { PDFViewer } from "@/components/PDFViewer";
import { DocumentHeader } from "@/components/DocumentHeader";
import { ProcessingProgress } from "@/components/ProcessingProgress";
import { usePDFProcessor } from "@/hooks/usePDFProcessor";

const Index = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const { isProcessing, progress, document, processFile, searchDocument, clearDocument } = usePDFProcessor();

  const searchResults = useMemo(() => {
    return searchDocument(searchTerm);
  }, [searchDocument, searchTerm]);

  const handleResultClick = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  const handleClearDocument = () => {
    clearDocument();
    setSearchTerm("");
    setCurrentPage(1);
  };

  return (
    <div className="min-h-screen bg-background">
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

      <main className="container max-w-7xl mx-auto px-4 py-8">
        {!document ? (
          <div className="max-w-2xl mx-auto space-y-6 animate-fade-in-up">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-foreground mb-3">
                Search Any PDF Document
              </h2>
              <p className="text-lg text-muted-foreground max-w-md mx-auto">
                Upload a PDF, including scanned documents. We'll extract all text using OCR and make it searchable.
              </p>
            </div>
            
            <PDFUploader onFileSelect={processFile} isProcessing={isProcessing} />
            
            {isProcessing && (
              <div className="paper-card p-6">
                <ProcessingProgress progress={progress} />
              </div>
            )}

            {/* Features */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-12">
              {[
                { title: "OCR Extraction", desc: "Works with scanned PDFs" },
                { title: "Smart Search", desc: "Find text instantly" },
                { title: "Jump to Page", desc: "Click to navigate" },
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
              <DocumentHeader
                fileName={document.name}
                pageCount={document.totalPages}
                onClose={handleClearDocument}
              />
              
              <div className="p-4 space-y-4 flex-1 flex flex-col">
                <SearchBar
                  value={searchTerm}
                  onChange={setSearchTerm}
                  resultCount={searchResults.length}
                />
                
                <div className="flex-1 min-h-0">
                  <SearchResults
                    results={searchResults}
                    searchTerm={searchTerm}
                    onResultClick={handleResultClick}
                  />
                </div>
              </div>
            </div>

            {/* PDF Viewer */}
            <div className="paper-card-lg overflow-hidden h-[calc(100vh-180px)] lg:sticky lg:top-24">
              <PDFViewer
                file={document.file}
                currentPage={currentPage}
                onPageChange={setCurrentPage}
                totalPages={document.totalPages}
              />
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-card/50 mt-auto">
        <div className="container max-w-7xl mx-auto px-4 py-6">
          <div className="flex flex-col items-center gap-3">
            {/* Black Mind Logo */}
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-foreground flex items-center justify-center">
                <div className="w-5 h-5 relative">
                  <div className="absolute inset-0 rounded-full border-2 border-background" />
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-background" />
                </div>
              </div>
              <span className="font-bold text-foreground tracking-tight">Black Mind</span>
            </div>
            
            <p className="text-sm text-muted-foreground">
              Made by <span className="font-semibold text-foreground">Mr.Marb</span>
            </p>
            
            {/* Note about line numbers */}
            <p className="text-xs text-muted-foreground/70 text-center max-w-md">
              Note: Line numbers shown are estimates based on text extraction and may not match exact PDF formatting.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
