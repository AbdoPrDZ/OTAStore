declare module "subset-font" {
  export interface SubsetFontOptions {
    targetFormat?: "sfnt" | "truetype" | "woff" | "woff2";
    preserveNameIds?: number[];
    keepFeatures?: string[];
    variationAxes?: Record<string, number>;
    noLayoutClosure?: boolean;
    glyphNames?: boolean;
    noHinting?: boolean;
    dropTables?: string[];
    keepAllGlyphs?: boolean;
  }

  export default function subsetFont(
    originalFont: Buffer,
    text: string,
    options?: SubsetFontOptions
  ): Promise<Buffer>;
}
