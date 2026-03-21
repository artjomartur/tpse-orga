declare module "pdf-parse" {
  export interface PdfParseResult {
    numpages: number;
    text: string;
  }

  function pdfParse(dataBuffer: Buffer, options?: unknown): Promise<PdfParseResult>;
  export default pdfParse;
}
