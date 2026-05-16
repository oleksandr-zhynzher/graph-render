import type { EdgeComponent, PositionedEdge } from '@graph-render/types';
import React from 'react';

import { getEdgeRenderState } from '../utils/edgeRenderState';

interface GraphEdgesLayerProps {
  readonly edges: readonly PositionedEdge[];
  readonly EdgeComponent: EdgeComponent;
  readonly edgeColor: string;
  readonly edgeWidth: number;
  readonly curveEdges: boolean;
  readonly curveStrength: number;
  readonly edgeLabelColor?: string | undefined;
  readonly showArrows: boolean;
  readonly arrowMarkerId: string;
  readonly hoverArrowMarkerId: string;
  readonly hoverIncomingArrowMarkerId: string;
  readonly selectionArrowMarkerId: string;
  readonly hoverHighlight: boolean;
  readonly hoveredEdgeId: string | null;
  readonly hoveredNodeId: string | null;
  readonly pathHighlightEdges?: ReadonlySet<string> | undefined;
  readonly selectedEdgeSet: ReadonlySet<string>;
  readonly highlightedEdgeSet: ReadonlySet<string>;
  readonly hoverEdgeColor: string;
  readonly hoverNodeOutColor: string;
  readonly selectionEdgeColor: string;
  readonly highlightColor: string;
  readonly onEdgeHoverChange: (edgeId: string, hovered: boolean) => void;
  readonly onEdgeSelection: (edge: PositionedEdge) => void;
}

export const GraphEdgesLayer = React.memo(function GraphEdgesLayer({
  edges,
  EdgeComponent,
  edgeColor,
  edgeWidth,
  curveEdges,
  curveStrength,
  edgeLabelColor,
  showArrows,
  arrowMarkerId,
  hoverArrowMarkerId,
  hoverIncomingArrowMarkerId,
  selectionArrowMarkerId,
  hoverHighlight,
  hoveredEdgeId,
  hoveredNodeId,
  pathHighlightEdges,
  selectedEdgeSet,
  highlightedEdgeSet,
  hoverEdgeColor,
  hoverNodeOutColor,
  selectionEdgeColor,
  highlightColor,
  onEdgeHoverChange,
  onEdgeSelection,
}: GraphEdgesLayerProps) {
  return (
    <g aria-label="edges">
      {edges.map((edge) => {
        const { edgeHovered, isIncomingToHovered } = getEdgeRenderState(edge, {
          hoverHighlight,
          hoveredEdgeId,
          hoveredNodeId,
          pathHighlightEdges,
        });

        return (
          <EdgeComponent
            key={edge.id}
            edge={edge}
            color={edgeColor}
            width={edgeWidth}
            curveEdges={curveEdges}
            curveStrength={curveStrength}
            markerEnd={showArrows ? `url(#${arrowMarkerId})` : undefined}
            isHovered={edgeHovered}
            isSelected={selectedEdgeSet.has(edge.id) || highlightedEdgeSet.has(edge.id)}
            hoverColor={isIncomingToHovered ? hoverNodeOutColor : hoverEdgeColor}
            selectionColor={selectedEdgeSet.has(edge.id) ? selectionEdgeColor : highlightColor}
            labelColor={edgeLabelColor}
            selectionMarker={showArrows ? `url(#${selectionArrowMarkerId})` : undefined}
            hoverMarker={
              showArrows
                ? isIncomingToHovered
                  ? `url(#${hoverIncomingArrowMarkerId})`
                  : `url(#${hoverArrowMarkerId})`
                : undefined
            }
            hoverEnabled={hoverHighlight}
            hitStrokeWidth={edgeWidth + 8}
            hoverStrokeWidth={edgeWidth + 1.5}
            selectedStrokeWidth={edgeWidth + 1.5}
            onHoverChange={(value) => onEdgeHoverChange(edge.id, value)}
            onClick={() => onEdgeSelection(edge)}
          />
        );
      })}
    </g>
  );
});
