export interface PageContent {
  pageNumber: number;
  text: string;
  lines: string[];
}

export interface SearchResult {
  documentId: string;
  documentName: string;
  pageNumber: number;
  lineNumber: number;
  lineText: string;
  matchIndex: number;
  selected?: boolean;
}

export interface PDFDocument {
  id: string;
  file: File;
  name: string;
  pages: PageContent[];
  totalPages: number;
}
