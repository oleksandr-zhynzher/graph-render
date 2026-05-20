export interface SvgDocumentParts {
  readonly width: number;
  readonly height: number;
  readonly background: string;
  readonly fontFamily: string;
  readonly metadata: string;
  readonly defs: string;
  readonly edgesMarkup: string;
  readonly nodesMarkup: string;
}
