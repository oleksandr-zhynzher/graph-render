import React from 'react';
import type { EdgeComponent, PositionedEdge } from '@graph-render/types';
import { getEdgeRenderState } from '../utils/edgeRenderState';

interface GraphEdgesLayerProps {
  edges: PositionedEdge[];
  EdgeComponent: EdgeComponent;
  edgeColor: string;
  edgeWidth: number;
  curveEdges: boolean;
  curveStrength: number;
  edgeLabelColor?: string;
  showArrows: boolean;
  arrowMarkerId: string;
  hoverArrowMarkerId: string;
  hoverIncomingArrowMarkerId: string;
  selectionArrowMarkerId: string;
  hoverHighlight: boolean;
  hoveredEdgeId: string | null;
  hoveredNodeId: string | null;
  pathHighlightEdges?: Set<string>;
  selectedEdgeSet: Set<string>;
  highlightedEdgeSet: Set<string>;
  hoverEdgeColor: string;
  hoverNodeOutColor: string;
  selectionEdgeColor: string;
  highlightColor: string;
  onEdgeHoverChange: (edgeId: string, hovered: boolean) => void;
  onEdgeSelection: (edge: PositionedEdge) => void;
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
