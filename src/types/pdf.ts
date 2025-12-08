export interface PageContent {
  pageNumber: number;
  text: string;
  lines: string[];
}

export interface SearchResult {
  pageNumber: number;
  lineNumber: number;
  lineText: string;
  matchIndex: number;
}

export interface PDFDocument {
  file: File;
  name: string;
  pages: PageContent[];
  totalPages: number;
}
