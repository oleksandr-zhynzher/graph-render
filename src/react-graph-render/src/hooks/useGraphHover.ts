import { useMemo, useState } from 'react';
import { PositionedEdge, EdgeId } from '@graph-render/types';
import { groupEdgesByTarget, sortEdgesBySourcePosition } from '@graph-render/core';
import {
  extractPathKeysFromNodes,
  FocusedPath,
  traverseHighlightedPath,
} from '../utils/pathHighlight';

export function useGraphHover(
  positionedNodes: Array<{
    id: string;
    position: { x: number; y: number };
    meta?: Record<string, unknown>;
  }>,
  positionedEdges: PositionedEdge[],
  hoverHighlight: boolean
) {
  const [hoveredEdgeId, setHoveredEdgeId] = useState<EdgeId | null>(null);
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);
  const [focusedPath, setFocusedPath] = useState<FocusedPath | null>(null);
  const edgeById = useMemo(
    () => new Map(positionedEdges.map((edge) => [edge.id, edge])),
    [positionedEdges]
  );
  const edgesByNodeId = useMemo(() => {
    const map = new Map<string, PositionedEdge[]>();

    positionedEdges.forEach((edge) => {
      map.set(edge.source, [...(map.get(edge.source) ?? []), edge]);
      if (edge.target !== edge.source) {
        map.set(edge.target, [...(map.get(edge.target) ?? []), edge]);
      }
    });

    return map;
  }, [positionedEdges]);

  const nodePos = useMemo(() => {
    const m = new Map<string, { x: number; y: number }>();
    positionedNodes.forEach((n) => m.set(n.id, n.position));
    return m;
  }, [positionedNodes]);

  const pathKeysByNode = useMemo(
    () => extractPathKeysFromNodes(positionedNodes),
    [positionedNodes]
  );

  const incomingEdgesByTarget = useMemo(() => {
    const map = groupEdgesByTarget(positionedEdges);
    map.forEach((edges, targetId) => {
      map.set(targetId, sortEdgesBySourcePosition(edges, nodePos));
    });
    return map;
  }, [positionedEdges, nodePos]);

  const pathHighlight = useMemo(() => {
    if (!focusedPath) return null;

    return traverseHighlightedPath({
      startNodeId: focusedPath.nodeId,
      sourceIndex: focusedPath.sourceIndex,
      pathKey: focusedPath.pathKey,
      incomingEdgesByTarget,
      pathKeysByNode,
    });
  }, [focusedPath, incomingEdgesByTarget, pathKeysByNode]);

  const hoveredNodeStates = useMemo(() => {
    if (!hoverHighlight && !pathHighlight) return null;

    const map = new Map<string, { in: boolean; out: boolean }>();

    const applyPath = () => {
      if (pathHighlight) {
        pathHighlight.nodes.forEach((id) => {
          const curr = map.get(id) ?? { in: false, out: false };
          map.set(id, { ...curr, in: true, out: true });
        });
      }
    };

    if (focusedPath) {
      applyPath();
    } else {
      if (hoverHighlight) {
        if (hoveredEdgeId) {
          const match = edgeById.get(hoveredEdgeId);
          if (match) {
            const add = (id: string, dir: 'in' | 'out') => {
              const curr = map.get(id) ?? { in: false, out: false };
              map.set(id, { ...curr, [dir]: true });
            };
            if (match.type === 'undirected') {
              add(match.source, 'in');
              add(match.source, 'out');
              add(match.target, 'in');
              add(match.target, 'out');
            } else {
              // For a directed edge A→B the source is the origin (out only)
              // and the target is the destination (in only).
              add(match.source, 'out');
              add(match.target, 'in');
            }
          }
        } else if (hoveredNodeId) {
          const add = (id: string, dir: 'in' | 'out') => {
            const curr = map.get(id) ?? { in: false, out: false };
            map.set(id, { ...curr, [dir]: true });
          };
          (edgesByNodeId.get(hoveredNodeId) ?? []).forEach((e) => {
            const isUndir = e.type === 'undirected';
            if (e.source === hoveredNodeId) {
              if (isUndir) {
                add(e.source, 'in');
                add(e.source, 'out');
                add(e.target, 'in');
                add(e.target, 'out');
              } else {
                add(e.source, 'out');
                add(e.target, 'in');
              }
            } else if (e.target === hoveredNodeId) {
              if (isUndir) {
                add(e.source, 'in');
                add(e.source, 'out');
                add(e.target, 'in');
                add(e.target, 'out');
              } else {
                add(e.source, 'out');
                add(e.target, 'in');
              }
            }
          });
          add(hoveredNodeId, 'in');
          add(hoveredNodeId, 'out');
        }
      }
      applyPath();
    }

    return map.size ? map : null;
  }, [
    edgeById,
    edgesByNodeId,
    hoverHighlight,
    hoveredEdgeId,
    hoveredNodeId,
    pathHighlight,
    focusedPath,
  ]);

  const edgesForRender = useMemo(() => {
    const highlightIds = new Set<string>();

    if (focusedPath && pathHighlight) {
      pathHighlight.edges.forEach((id) => highlightIds.add(id));
    } else {
      if (hoverHighlight) {
        if (hoveredEdgeId) {
          highlightIds.add(hoveredEdgeId);
        } else if (hoveredNodeId) {
          (edgesByNodeId.get(hoveredNodeId) ?? []).forEach((e) => {
            if (e.source === hoveredNodeId || e.target === hoveredNodeId) {
              highlightIds.add(e.id);
            }
          });
        }
      }
      if (pathHighlight) {
        pathHighlight.edges.forEach((id) => highlightIds.add(id));
      }
    }

    if (!highlightIds.size) return positionedEdges;

    const front: PositionedEdge[] = [];
    const back: PositionedEdge[] = [];
    positionedEdges.forEach((e) => {
      if (highlightIds.has(e.id)) front.push(e);
      else back.push(e);
    });
    return [...back, ...front];
  }, [
    edgesByNodeId,
    hoverHighlight,
    hoveredEdgeId,
    hoveredNodeId,
    positionedEdges,
    pathHighlight,
    focusedPath,
  ]);

  return {
    hoveredEdgeId,
    setHoveredEdgeId,
    hoveredNodeId,
    setHoveredNodeId,
    focusedPath,
    setFocusedPath,
    pathHighlight,
    hoveredNodeStates,
    edgesForRender,
  };
}
