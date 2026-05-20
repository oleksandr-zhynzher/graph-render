import { escapeXml } from '../utils';
import type { SvgDocumentParts } from './svgTypes';

export const createArrowMarkerDef = (markerId: string, edgeColor: string): string => {
  return [
    `<marker id="${escapeXml(markerId)}" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">`,
    `<path d="M 0 0 L 10 5 L 0 10 z" fill="${escapeXml(edgeColor)}" />`,
    '</marker>',
  ].join('');
};

export const createMetadataElements = (title?: string, desc?: string): string => {
  const titleElement = title ? `<title>${escapeXml(title)}</title>` : '';
  const descElement = desc ? `<desc>${escapeXml(desc)}</desc>` : '';
  return titleElement + descElement;
};

export const assembleSvgDocument = ({
  width,
  height,
  background,
  fontFamily,
  metadata,
  defs,
  edgesMarkup,
  nodesMarkup,
}: SvgDocumentParts): string => {
  return [
    `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" style="background:${escapeXml(background)};font-family:${fontFamily};">`,
    metadata,
    '<defs>',
    defs,
    '</defs>',
    '<g>',
    edgesMarkup,
    nodesMarkup,
    '</g>',
    '</svg>',
  ].join('');
};
