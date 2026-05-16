import React from 'react';

interface GraphMarkerDefsProps {
  arrowMarkerId: string;
  edgeColor: string;
  hoverArrowMarkerId: string;
  hoverEdgeColor: string;
  hoverIncomingArrowMarkerId: string;
  hoverNodeOutColor: string;
  selectionArrowMarkerId: string;
  selectionEdgeColor: string;
}

const Marker = ({ id, color }: { id: string; color: string }) => (
  <marker
    id={id}
    viewBox="0 0 10 10"
    refX="6"
    refY="5"
    markerWidth="6"
    markerHeight="6"
    orient="auto-start-reverse"
  >
    <path d="M 0 0 L 10 5 L 0 10 z" fill={color} />
  </marker>
);

export const GraphMarkerDefs = React.memo(function GraphMarkerDefs({
  arrowMarkerId,
  edgeColor,
  hoverArrowMarkerId,
  hoverEdgeColor,
  hoverIncomingArrowMarkerId,
  hoverNodeOutColor,
  selectionArrowMarkerId,
  selectionEdgeColor,
}: GraphMarkerDefsProps) {
  return (
    <defs>
      <Marker id={arrowMarkerId} color={edgeColor} />
      <Marker id={hoverArrowMarkerId} color={hoverEdgeColor} />
      <Marker id={hoverIncomingArrowMarkerId} color={hoverNodeOutColor} />
      <Marker id={selectionArrowMarkerId} color={selectionEdgeColor} />
    </defs>
  );
});
